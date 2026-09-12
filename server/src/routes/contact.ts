import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { db } from '../db.ts'
import { mailerEnabled, sendContactNotification } from '../mailer.ts'
import { recordEvent } from '../analytics.ts'

export const contactRouter: Router = Router()

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Ism kamida 2 belgidan iborat bo\'lsin').max(80),
  email: z.email('Email manzil noto\'g\'ri').max(160),
  subject: z.string().trim().max(140).optional().default(''),
  message: z.string().trim().min(10, 'Xabar kamida 10 belgidan iborat bo\'lsin').max(4000),
  // Hidden field: real users leave it empty, most bots fill it in.
  website: z.string().max(0).optional().default(''),
})

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Juda ko\'p so\'rov. 15 daqiqadan keyin qayta urinib ko\'ring.' },
})

contactRouter.post('/contact', contactLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body ?? {})

  if (!parsed.success) {
    res.status(400).json({
      error: 'Forma to\'ldirilishida xatolik',
      fields: Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? '_'), issue.message]),
      ),
    })
    return
  }

  const { name, email, subject, message, website } = parsed.data

  // Honeypot tripped — answer as if it worked so the bot does not retry.
  if (website) {
    res.status(202).json({ ok: true })
    return
  }

  const info = db
    .prepare(
      'INSERT INTO messages (name, email, subject, body, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(name, email, subject || null, message, req.ip ?? null, req.get('user-agent') ?? null)

  recordEvent(req, { type: 'contact_submit', refId: String(info.lastInsertRowid) })

  // Persisted already — a failed email must not turn into a failed submission.
  const emailed = mailerEnabled
    ? await sendContactNotification({ name, email, subject, body: message })
    : false

  res.status(201).json({ ok: true, id: Number(info.lastInsertRowid), emailed })
})
