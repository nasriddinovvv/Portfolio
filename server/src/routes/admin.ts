import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { db } from '../db.ts'
import type { ExperienceRow, MessageRow, ProjectRow, SkillRow } from '../db.ts'
import { changePassword, requireAdmin, signToken, verifyCredentials } from '../auth.ts'
import type { AuthedRequest } from '../auth.ts'
import { analyticsSummary } from '../analytics.ts'
import { toExperience, toMessage, toProject, toSkill } from '../mappers.ts'

export const adminRouter: Router = Router()

/* ---------------------------------------------------------------- auth ---- */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Juda ko\'p urinish. 15 daqiqadan keyin qayta urinib ko\'ring.' },
})

adminRouter.post('/login', loginLimiter, (req, res) => {
  const parsed = z
    .object({ username: z.string().min(1), password: z.string().min(1) })
    .safeParse(req.body ?? {})

  if (!parsed.success) {
    res.status(400).json({ error: 'Login va parolni kiriting' })
    return
  }

  const admin = verifyCredentials(parsed.data.username, parsed.data.password)
  if (!admin) {
    res.status(401).json({ error: 'Login yoki parol noto\'g\'ri' })
    return
  }

  res.json({ token: signToken(admin), admin })
})

// Everything past this point requires a valid bearer token.
adminRouter.use(requireAdmin)

adminRouter.get('/me', (req, res) => {
  res.json({ admin: (req as AuthedRequest).admin })
})

adminRouter.post('/password', (req, res) => {
  const parsed = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8, 'Yangi parol kamida 8 belgidan iborat bo\'lsin'),
    })
    .safeParse(req.body ?? {})

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto\'g\'ri so\'rov' })
    return
  }

  const admin = (req as AuthedRequest).admin!
  if (!verifyCredentials(admin.username, parsed.data.currentPassword)) {
    res.status(401).json({ error: 'Joriy parol noto\'g\'ri' })
    return
  }

  changePassword(admin.id, parsed.data.newPassword)
  res.json({ ok: true })
})

/* ----------------------------------------------------------- dashboard ---- */

adminRouter.get('/stats', (req, res) => {
  const days = Number(req.query.days) || 30
  res.json(analyticsSummary(days))
})

/* ------------------------------------------------------------ projects ---- */

const localizedSchema = z.object({
  uz: z.string().max(6000).default(''),
  en: z.string().max(6000).default(''),
  ru: z.string().max(6000).default(''),
})

const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug faqat kichik harf, raqam va tire bo\'lishi mumkin'),
  title: localizedSchema,
  summary: localizedSchema,
  description: localizedSchema,
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  coverUrl: z.string().trim().max(500).default(''),
  liveUrl: z.string().trim().max(500).default(''),
  githubUrl: z.string().trim().max(500).default(''),
  year: z.string().trim().max(20).default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

adminRouter.get('/projects', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM projects ORDER BY sort_order ASC, id DESC')
    .all() as ProjectRow[]
  res.json(rows.map(toProject))
})

adminRouter.post('/projects', (req, res) => {
  const parsed = projectSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto\'g\'ri ma\'lumot' })
    return
  }
  const p = parsed.data

  const existing = db.prepare('SELECT id FROM projects WHERE slug = ?').get(p.slug)
  if (existing) {
    res.status(409).json({ error: 'Bu slug allaqachon band' })
    return
  }

  const info = db
    .prepare(
      `INSERT INTO projects
         (slug, title, summary, description, tags, cover_url, live_url, github_url, year, featured, published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      p.slug,
      JSON.stringify(p.title),
      JSON.stringify(p.summary),
      JSON.stringify(p.description),
      JSON.stringify(p.tags),
      p.coverUrl || null,
      p.liveUrl || null,
      p.githubUrl || null,
      p.year || null,
      p.featured ? 1 : 0,
      p.published ? 1 : 0,
      p.sortOrder,
    )

  const row = db
    .prepare('SELECT * FROM projects WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as ProjectRow
  res.status(201).json(toProject(row))
})

adminRouter.put('/projects/:id', (req, res) => {
  const id = Number(req.params.id)
  const parsed = projectSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto\'g\'ri ma\'lumot' })
    return
  }
  const p = parsed.data

  const current = db.prepare('SELECT id FROM projects WHERE id = ?').get(id)
  if (!current) {
    res.status(404).json({ error: 'Loyiha topilmadi' })
    return
  }

  const clash = db.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').get(p.slug, id)
  if (clash) {
    res.status(409).json({ error: 'Bu slug boshqa loyihada ishlatilgan' })
    return
  }

  db.prepare(
    `UPDATE projects SET
       slug = ?, title = ?, summary = ?, description = ?, tags = ?,
       cover_url = ?, live_url = ?, github_url = ?, year = ?,
       featured = ?, published = ?, sort_order = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    p.slug,
    JSON.stringify(p.title),
    JSON.stringify(p.summary),
    JSON.stringify(p.description),
    JSON.stringify(p.tags),
    p.coverUrl || null,
    p.liveUrl || null,
    p.githubUrl || null,
    p.year || null,
    p.featured ? 1 : 0,
    p.published ? 1 : 0,
    p.sortOrder,
    id,
  )

  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow
  res.json(toProject(row))
})

adminRouter.delete('/projects/:id', (req, res) => {
  const info = db.prepare('DELETE FROM projects WHERE id = ?').run(Number(req.params.id))
  if (info.changes === 0) {
    res.status(404).json({ error: 'Loyiha topilmadi' })
    return
  }
  res.json({ ok: true })
})

/* -------------------------------------------------------------- skills ---- */

const skillSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.enum(['frontend', 'backend', 'ai', 'tools', 'other']).default('other'),
  level: z.number().int().min(0).max(100).default(50),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

adminRouter.get('/skills', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM skills ORDER BY sort_order ASC, id ASC')
    .all() as SkillRow[]
  res.json(rows.map(toSkill))
})

adminRouter.post('/skills', (req, res) => {
  const parsed = skillSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto\'g\'ri ma\'lumot' })
    return
  }
  const s = parsed.data
  const info = db
    .prepare('INSERT INTO skills (name, category, level, sort_order) VALUES (?, ?, ?, ?)')
    .run(s.name, s.category, s.level, s.sortOrder)

  const row = db
    .prepare('SELECT * FROM skills WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as SkillRow
  res.status(201).json(toSkill(row))
})

adminRouter.put('/skills/:id', (req, res) => {
  const id = Number(req.params.id)
  const parsed = skillSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto\'g\'ri ma\'lumot' })
    return
  }
  const s = parsed.data
  const info = db
    .prepare('UPDATE skills SET name = ?, category = ?, level = ?, sort_order = ? WHERE id = ?')
    .run(s.name, s.category, s.level, s.sortOrder, id)

  if (info.changes === 0) {
    res.status(404).json({ error: 'Ko\'nikma topilmadi' })
    return
  }
  const row = db.prepare('SELECT * FROM skills WHERE id = ?').get(id) as SkillRow
  res.json(toSkill(row))
})

adminRouter.delete('/skills/:id', (req, res) => {
  const info = db.prepare('DELETE FROM skills WHERE id = ?').run(Number(req.params.id))
  if (info.changes === 0) {
    res.status(404).json({ error: 'Ko\'nikma topilmadi' })
    return
  }
  res.json({ ok: true })
})

/* --------------------------------------------------------- experiences ---- */

const experienceSchema = z.object({
  role: localizedSchema,
  company: z.string().trim().min(1).max(120),
  period: z.string().trim().min(1).max(60),
  description: localizedSchema,
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

adminRouter.get('/experiences', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM experiences ORDER BY sort_order ASC, id ASC')
    .all() as ExperienceRow[]
  res.json(rows.map(toExperience))
})

adminRouter.post('/experiences', (req, res) => {
  const parsed = experienceSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto\'g\'ri ma\'lumot' })
    return
  }
  const e = parsed.data
  const info = db
    .prepare(
      'INSERT INTO experiences (role, company, period, description, sort_order) VALUES (?, ?, ?, ?, ?)',
    )
    .run(JSON.stringify(e.role), e.company, e.period, JSON.stringify(e.description), e.sortOrder)

  const row = db
    .prepare('SELECT * FROM experiences WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as ExperienceRow
  res.status(201).json(toExperience(row))
})

adminRouter.put('/experiences/:id', (req, res) => {
  const id = Number(req.params.id)
  const parsed = experienceSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto\'g\'ri ma\'lumot' })
    return
  }
  const e = parsed.data
  const info = db
    .prepare(
      'UPDATE experiences SET role = ?, company = ?, period = ?, description = ?, sort_order = ? WHERE id = ?',
    )
    .run(JSON.stringify(e.role), e.company, e.period, JSON.stringify(e.description), e.sortOrder, id)

  if (info.changes === 0) {
    res.status(404).json({ error: 'Tajriba topilmadi' })
    return
  }
  const row = db.prepare('SELECT * FROM experiences WHERE id = ?').get(id) as ExperienceRow
  res.json(toExperience(row))
})

adminRouter.delete('/experiences/:id', (req, res) => {
  const info = db.prepare('DELETE FROM experiences WHERE id = ?').run(Number(req.params.id))
  if (info.changes === 0) {
    res.status(404).json({ error: 'Tajriba topilmadi' })
    return
  }
  res.json({ ok: true })
})

/* ------------------------------------------------------------ messages ---- */

adminRouter.get('/messages', (req, res) => {
  const archived = req.query.archived === 'true' ? 1 : 0
  const rows = db
    .prepare('SELECT * FROM messages WHERE is_archived = ? ORDER BY created_at DESC LIMIT 300')
    .all(archived) as MessageRow[]
  res.json(rows.map(toMessage))
})

adminRouter.patch('/messages/:id', (req, res) => {
  const id = Number(req.params.id)
  const parsed = z
    .object({ isRead: z.boolean().optional(), isArchived: z.boolean().optional() })
    .safeParse(req.body ?? {})

  if (!parsed.success) {
    res.status(400).json({ error: 'Noto\'g\'ri ma\'lumot' })
    return
  }

  const updates: string[] = []
  const values: unknown[] = []
  if (parsed.data.isRead !== undefined) {
    updates.push('is_read = ?')
    values.push(parsed.data.isRead ? 1 : 0)
  }
  if (parsed.data.isArchived !== undefined) {
    updates.push('is_archived = ?')
    values.push(parsed.data.isArchived ? 1 : 0)
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'O\'zgartirish uchun maydon berilmadi' })
    return
  }

  const info = db
    .prepare(`UPDATE messages SET ${updates.join(', ')} WHERE id = ?`)
    .run(...(values as never[]), id)

  if (info.changes === 0) {
    res.status(404).json({ error: 'Xabar topilmadi' })
    return
  }
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as MessageRow
  res.json(toMessage(row))
})

adminRouter.delete('/messages/:id', (req, res) => {
  const info = db.prepare('DELETE FROM messages WHERE id = ?').run(Number(req.params.id))
  if (info.changes === 0) {
    res.status(404).json({ error: 'Xabar topilmadi' })
    return
  }
  res.json({ ok: true })
})
