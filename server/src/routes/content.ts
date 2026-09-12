import { Router } from 'express'
import { db } from '../db.ts'
import type { ExperienceRow, ProjectRow, SkillRow } from '../db.ts'
import { toExperience, toProject, toSkill } from '../mappers.ts'

export const contentRouter: Router = Router()

/** Published projects, newest-first within the manual sort order. */
contentRouter.get('/projects', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, id DESC')
    .all() as ProjectRow[]

  res.json(rows.map(toProject))
})

contentRouter.get('/projects/:slug', (req, res) => {
  const row = db
    .prepare('SELECT * FROM projects WHERE slug = ? AND published = 1')
    .get(req.params.slug) as ProjectRow | undefined

  if (!row) {
    res.status(404).json({ error: 'Loyiha topilmadi' })
    return
  }
  res.json(toProject(row))
})

contentRouter.get('/skills', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM skills ORDER BY sort_order ASC, id ASC')
    .all() as SkillRow[]

  res.json(rows.map(toSkill))
})

contentRouter.get('/experiences', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM experiences ORDER BY sort_order ASC, id ASC')
    .all() as ExperienceRow[]

  res.json(rows.map(toExperience))
})

/** Everything the landing page needs, in a single round trip. */
contentRouter.get('/bootstrap', (_req, res) => {
  const projects = db
    .prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, id DESC')
    .all() as ProjectRow[]
  const skills = db
    .prepare('SELECT * FROM skills ORDER BY sort_order ASC, id ASC')
    .all() as SkillRow[]
  const experiences = db
    .prepare('SELECT * FROM experiences ORDER BY sort_order ASC, id ASC')
    .all() as ExperienceRow[]

  res.json({
    projects: projects.map(toProject),
    skills: skills.map(toSkill),
    experiences: experiences.map(toExperience),
  })
})
