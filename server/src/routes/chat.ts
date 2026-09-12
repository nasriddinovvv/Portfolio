import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { db, parseJson } from '../db.ts'
import type { ProjectRow, SkillRow } from '../db.ts'
import { env } from '../env.ts'
import { recordEvent } from '../analytics.ts'
import { profile } from '../profile.ts'

export const chatRouter: Router = Router()

const client = env.anthropicApiKey ? new Anthropic({ apiKey: env.anthropicApiKey }) : null

/** How many past turns of a session are replayed to the model. */
const HISTORY_TURNS = 12

const chatSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
  message: z.string().trim().min(1, 'Xabar bo\'sh').max(2000),
  lang: z.enum(['uz', 'en', 'ru']).optional().default('uz'),
})

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 25,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Juda ko\'p xabar yuborildi. Biroz kutib, qayta urinib ko\'ring.' },
})

const LANGUAGE_NAMES = { uz: "o'zbek", en: 'English', ru: 'русский' }

/**
 * Builds the grounding context from the database on every request so the
 * assistant always describes the portfolio as it currently stands.
 */
function buildSystemPrompt(lang: 'uz' | 'en' | 'ru'): string {
  const projects = db
    .prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC')
    .all() as ProjectRow[]
  const skills = db
    .prepare('SELECT * FROM skills ORDER BY sort_order ASC')
    .all() as SkillRow[]

  const projectLines = projects
    .map((row) => {
      const title = parseJson<{ uz?: string }>(row.title, {}).uz ?? row.slug
      const summary = parseJson<{ uz?: string }>(row.summary, {}).uz ?? ''
      const tags = parseJson<string[]>(row.tags, []).join(', ')
      const links = [row.live_url, row.github_url].filter(Boolean)
      return `- ${title} (${row.year ?? '—'}) — ${summary} Texnologiyalar: ${tags}.${
        links.length ? ` Havola: ${links.join(' ')}` : ''
      }`
    })
    .join('\n')

  const skillLines = skills
    .map((skill) => `${skill.name} (${skill.category}, ${skill.level}%)`)
    .join(', ')

  return `Sen ${profile.fullName}ning shaxsiy portfolio saytidagi AI yordamchisisan.

VAZIFANG: sayt mehmonlariga ${profile.name} haqida — uning ko'nikmalari, loyihalari, tajribasi va u bilan qanday bog'lanish mumkinligi haqida savollariga javob berish.

${profile.name.toUpperCase()} HAQIDA:
- To'liq ismi: ${profile.fullName}
- Kasbi: ${profile.title}
- Joylashuvi: ${profile.location}
- Tajriba: ${profile.experienceYears}+ yil
- Email: ${profile.email}
- Telegram: ${profile.telegram}
- GitHub: ${profile.github}
- LinkedIn: ${profile.linkedin}
- Yangi loyihalar uchun holati: ${profile.available ? 'ochiq, buyurtma qabul qiladi' : 'hozircha band'}

KO'NIKMALARI: ${skillLines}

LOYIHALARI:
${projectLines || '- (hozircha loyiha qo\'shilmagan)'}

QOIDALAR:
1. Javobni ${LANGUAGE_NAMES[lang]} tilida yoz. Agar foydalanuvchi boshqa tilda yozsa, o'sha tilda javob ber.
2. Qisqa va aniq bo'l — odatda 2-4 gap. Ro'yxat kerak bo'lsa, qisqa punktlar ishlat.
3. Faqat yuqorida berilgan ma'lumotlarga tayan. Bilmagan narsangni o'ylab topma — buning o'rniga "bu haqda aniq ma'lumotim yo'q, ${profile.email} orqali so'rang" deb ayt.
4. Do'stona va professional ohangda gapir. Emoji ishlatma.
5. Narx, muddat yoki shartnoma kabi savollarda aniq raqam aytma — to'g'ridan-to'g'ri ${profile.name} bilan bog'lanishni taklif qil.
6. Markdown formatlashdan foydalanma — oddiy matn yoz.`
}

type ChatRow = { role: string; content: string }

chatRouter.post('/chat', chatLimiter, async (req, res) => {
  if (!client) {
    res.status(503).json({
      error: 'AI chatbot sozlanmagan. Server .env faylida ANTHROPIC_API_KEY ni belgilang.',
      code: 'missing_api_key',
    })
    return
  }

  const parsed = chatSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto\'g\'ri so\'rov' })
    return
  }

  const { sessionId, message, lang } = parsed.data

  const history = (
    db
      .prepare(
        'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT ?',
      )
      .all(sessionId, HISTORY_TURNS) as ChatRow[]
  ).reverse()

  const messages: Anthropic.MessageParam[] = [
    ...history.map((row) => ({
      role: row.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: row.content,
    })),
    { role: 'user', content: message },
  ]

  db.prepare('INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)').run(
    sessionId,
    'user',
    message,
  )
  recordEvent(req, { type: 'chat_message', lang })

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const send = (payload: unknown) => res.write(`data: ${JSON.stringify(payload)}\n\n`)

  const stream = client.messages.stream({
    model: env.chatModel,
    max_tokens: env.chatMaxTokens,
    // Low effort keeps the widget responsive; thinking stays on because
    // disabling it on Opus 5 can leak tool/markup text into the reply.
    output_config: { effort: 'low' },
    system: [
      {
        type: 'text',
        text: buildSystemPrompt(lang),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  })

  // Stop billing for a reply nobody will read.
  req.on('close', () => {
    if (!res.writableEnded) stream.abort()
  })

  let answer = ''

  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        answer += event.delta.text
        send({ type: 'delta', text: event.delta.text })
      }
    }

    const final = await stream.finalMessage()

    if (final.stop_reason === 'refusal') {
      answer = 'Kechirasiz, bu savolga javob bera olmayman. Boshqa savol bering.'
      send({ type: 'replace', text: answer })
    }

    if (answer.trim()) {
      db.prepare(
        'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)',
      ).run(sessionId, 'assistant', answer)
    }

    send({ type: 'done' })
  } catch (error) {
    if (res.writableEnded) return

    const err = error as Error
    const message =
      err instanceof Anthropic.AuthenticationError
        ? 'AI kaliti yaroqsiz. ANTHROPIC_API_KEY ni tekshiring.'
        : err instanceof Anthropic.RateLimitError
          ? 'AI xizmati band. Bir necha soniyadan keyin qayta urinib ko\'ring.'
          : 'Javob olishda xatolik yuz berdi. Qayta urinib ko\'ring.'

    console.error('Chat stream failed:', err.message)
    send({ type: 'error', message })
  } finally {
    if (!res.writableEnded) res.end()
  }
})

/** Lets the widget hide itself when the key is absent instead of failing on send. */
chatRouter.get('/chat/status', (_req, res) => {
  res.json({ enabled: Boolean(client), model: client ? env.chatModel : null })
})
