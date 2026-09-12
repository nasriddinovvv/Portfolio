import { parseJson } from './db.ts'
import type { ExperienceRow, Localized, MessageRow, ProjectRow, SkillRow } from './db.ts'

const emptyLocalized: Localized = { uz: '', en: '', ru: '' }

/** Normalizes a JSON language column, filling missing languages from `uz`. */
function localized(raw: string | null | undefined): Localized {
  const parsed = parseJson<Partial<Localized>>(raw, {})
  const uz = parsed.uz ?? parsed.en ?? parsed.ru ?? ''
  return { uz, en: parsed.en || uz, ru: parsed.ru || uz }
}

export type ProjectDto = {
  id: number
  slug: string
  title: Localized
  summary: Localized
  description: Localized
  tags: string[]
  coverUrl: string | null
  liveUrl: string | null
  githubUrl: string | null
  year: string | null
  featured: boolean
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function toProject(row: ProjectRow): ProjectDto {
  return {
    id: row.id,
    slug: row.slug,
    title: localized(row.title),
    summary: localized(row.summary),
    description: localized(row.description),
    tags: parseJson<string[]>(row.tags, []),
    coverUrl: row.cover_url || null,
    liveUrl: row.live_url || null,
    githubUrl: row.github_url || null,
    year: row.year,
    featured: row.featured === 1,
    published: row.published === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export type SkillDto = {
  id: number
  name: string
  category: string
  level: number
  sortOrder: number
}

export function toSkill(row: SkillRow): SkillDto {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    level: row.level,
    sortOrder: row.sort_order,
  }
}

export type ExperienceDto = {
  id: number
  role: Localized
  company: string
  period: string
  description: Localized
  sortOrder: number
}

export function toExperience(row: ExperienceRow): ExperienceDto {
  return {
    id: row.id,
    role: localized(row.role),
    company: row.company,
    period: row.period,
    description: localized(row.description),
    sortOrder: row.sort_order,
  }
}

export type MessageDto = {
  id: number
  name: string
  email: string
  subject: string | null
  body: string
  isRead: boolean
  isArchived: boolean
  createdAt: string
}

export function toMessage(row: MessageRow): MessageDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    body: row.body,
    isRead: row.is_read === 1,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
  }
}

export { emptyLocalized }
