import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import { env } from './env.ts'

fs.mkdirSync(path.dirname(env.databasePath), { recursive: true })

export const db = new DatabaseSync(env.databasePath)

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL DEFAULT '{}',
  summary     TEXT NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '{}',
  tags        TEXT NOT NULL DEFAULT '[]',
  cover_url   TEXT,
  live_url    TEXT,
  github_url  TEXT,
  year        TEXT,
  featured    INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skills (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'other',
  level      INTEGER NOT NULL DEFAULT 50,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experiences (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  role        TEXT NOT NULL DEFAULT '{}',
  company     TEXT NOT NULL,
  period      TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '{}',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  body        TEXT NOT NULL,
  ip          TEXT,
  user_agent  TEXT,
  is_read     INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT NOT NULL,
  path       TEXT,
  ref_id     TEXT,
  lang       TEXT,
  referrer   TEXT,
  visitor    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_created  ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_type     ON events(type);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_order  ON projects(sort_order, id);
CREATE INDEX IF NOT EXISTS idx_chat_session    ON chat_messages(session_id, id);
`)

/** A translated string stored as a JSON column. */
export type Localized = { uz: string; en: string; ru: string }

export type ProjectRow = {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  tags: string
  cover_url: string | null
  live_url: string | null
  github_url: string | null
  year: string | null
  featured: number
  published: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type SkillRow = {
  id: number
  name: string
  category: string
  level: number
  sort_order: number
}

export type ExperienceRow = {
  id: number
  role: string
  company: string
  period: string
  description: string
  sort_order: number
}

export type MessageRow = {
  id: number
  name: string
  email: string
  subject: string | null
  body: string
  ip: string | null
  user_agent: string | null
  is_read: number
  is_archived: number
  created_at: string
}

/** Parses a JSON column, falling back to `fallback` on malformed data. */
export function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
