import crypto from 'node:crypto'
import type { Request } from 'express'
import { db } from './db.ts'
import { env } from './env.ts'

export const EVENT_TYPES = [
  'page_view',
  'section_view',
  'project_click',
  'project_open',
  'chat_open',
  'chat_message',
  'resume_download',
  'contact_submit',
  'social_click',
] as const

export type EventType = (typeof EVENT_TYPES)[number]

/**
 * A stable per-visitor token. Derived from IP + user agent with a server-side
 * salt, so unique visitors can be counted without ever storing a raw IP.
 */
export function visitorHash(req: Request): string {
  return crypto
    .createHash('sha256')
    .update(`${env.analyticsSalt}|${req.ip ?? ''}|${req.get('user-agent') ?? ''}`)
    .digest('hex')
    .slice(0, 32)
}

export type EventInput = {
  type: string
  path?: string | null
  refId?: string | null
  lang?: string | null
  referrer?: string | null
}

const insertEvent = db.prepare(
  'INSERT INTO events (type, path, ref_id, lang, referrer, visitor) VALUES (?, ?, ?, ?, ?, ?)',
)

/** Fire-and-forget: analytics must never break the request it rides along with. */
export function recordEvent(req: Request, event: EventInput): void {
  if (!(EVENT_TYPES as readonly string[]).includes(event.type)) return

  try {
    insertEvent.run(
      event.type,
      event.path?.slice(0, 200) ?? null,
      event.refId?.slice(0, 120) ?? null,
      event.lang?.slice(0, 8) ?? null,
      event.referrer?.slice(0, 300) ?? null,
      visitorHash(req),
    )
  } catch (error) {
    console.error('Analytics write failed:', (error as Error).message)
  }
}

export type AnalyticsSummary = {
  totals: { views: number; visitors: number; messages: number; unreadMessages: number; chats: number }
  today: { views: number; visitors: number }
  daily: { date: string; views: number; visitors: number }[]
  topProjects: { refId: string; title: string; clicks: number }[]
  byType: { type: string; count: number }[]
  byLang: { lang: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
}

/** Aggregates the dashboard numbers over the trailing `days` window. */
export function analyticsSummary(days = 30): AnalyticsSummary {
  const since = `-${Math.max(1, Math.min(days, 365))} days`
  const one = <T>(sql: string, ...params: unknown[]) =>
    db.prepare(sql).get(...(params as never[])) as T

  const totals = {
    views: one<{ n: number }>("SELECT COUNT(*) AS n FROM events WHERE type = 'page_view'").n,
    visitors: one<{ n: number }>('SELECT COUNT(DISTINCT visitor) AS n FROM events').n,
    messages: one<{ n: number }>('SELECT COUNT(*) AS n FROM messages').n,
    unreadMessages: one<{ n: number }>('SELECT COUNT(*) AS n FROM messages WHERE is_read = 0').n,
    chats: one<{ n: number }>("SELECT COUNT(DISTINCT session_id) AS n FROM chat_messages").n,
  }

  const today = {
    views: one<{ n: number }>(
      "SELECT COUNT(*) AS n FROM events WHERE type = 'page_view' AND date(created_at) = date('now')",
    ).n,
    visitors: one<{ n: number }>(
      "SELECT COUNT(DISTINCT visitor) AS n FROM events WHERE date(created_at) = date('now')",
    ).n,
  }

  const daily = db
    .prepare(
      `SELECT date(created_at) AS date,
              SUM(CASE WHEN type = 'page_view' THEN 1 ELSE 0 END) AS views,
              COUNT(DISTINCT visitor) AS visitors
       FROM events
       WHERE created_at >= datetime('now', ?)
       GROUP BY date(created_at)
       ORDER BY date ASC`,
    )
    .all(since) as { date: string; views: number; visitors: number }[]

  const topProjects = db
    .prepare(
      `SELECT e.ref_id AS refId,
              COALESCE(json_extract(p.title, '$.uz'), e.ref_id) AS title,
              COUNT(*) AS clicks
       FROM events e
       LEFT JOIN projects p ON CAST(p.id AS TEXT) = e.ref_id
       WHERE e.type IN ('project_click', 'project_open') AND e.ref_id IS NOT NULL
       GROUP BY e.ref_id
       ORDER BY clicks DESC
       LIMIT 8`,
    )
    .all() as { refId: string; title: string; clicks: number }[]

  const byType = db
    .prepare(
      `SELECT type, COUNT(*) AS count FROM events
       WHERE created_at >= datetime('now', ?)
       GROUP BY type ORDER BY count DESC`,
    )
    .all(since) as { type: string; count: number }[]

  const byLang = db
    .prepare(
      `SELECT COALESCE(lang, 'unknown') AS lang, COUNT(*) AS count FROM events
       WHERE type = 'page_view' AND created_at >= datetime('now', ?)
       GROUP BY lang ORDER BY count DESC`,
    )
    .all(since) as { lang: string; count: number }[]

  const topReferrers = db
    .prepare(
      `SELECT referrer, COUNT(*) AS count FROM events
       WHERE referrer IS NOT NULL AND referrer != '' AND created_at >= datetime('now', ?)
       GROUP BY referrer ORDER BY count DESC LIMIT 8`,
    )
    .all(since) as { referrer: string; count: number }[]

  return { totals, today, daily, topProjects, byType, byLang, topReferrers }
}
