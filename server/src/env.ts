import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
export const SERVER_ROOT = path.resolve(here, '..')

config({ path: path.join(SERVER_ROOT, '.env'), quiet: true })

function str(key: string, fallback: string): string {
  const value = process.env[key]
  return value === undefined || value === '' ? fallback : value
}

function num(key: string, fallback: number): number {
  const parsed = Number(process.env[key])
  return Number.isFinite(parsed) ? parsed : fallback
}

function list(key: string, fallback: string[]): string[] {
  const value = process.env[key]
  if (!value) return fallback
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const env = {
  nodeEnv: str('NODE_ENV', 'development'),
  port: num('PORT', 4000),
  isProd: str('NODE_ENV', 'development') === 'production',

  /** SQLite file location. Created automatically on first boot. */
  databasePath: path.resolve(SERVER_ROOT, str('DATABASE_PATH', 'data/portfolio.db')),

  /** Origins allowed to call the API. */
  corsOrigins: list('CORS_ORIGINS', [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
  ]),

  /** Secret used to sign admin JWTs. Must be overridden in production. */
  jwtSecret: str('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
  jwtExpiresIn: str('JWT_EXPIRES_IN', '7d'),

  /** Seeded on first boot only. */
  adminUsername: str('ADMIN_USERNAME', 'admin'),
  adminPassword: str('ADMIN_PASSWORD', 'admin12345'),

  /** Salt mixed into visitor hashes so raw IPs are never stored. */
  analyticsSalt: str('ANALYTICS_SALT', 'portfolio-analytics-salt'),

  anthropicApiKey: str('ANTHROPIC_API_KEY', ''),
  chatModel: str('CHAT_MODEL', 'claude-opus-5'),
  chatMaxTokens: num('CHAT_MAX_TOKENS', 1024),

  smtp: {
    host: str('SMTP_HOST', ''),
    port: num('SMTP_PORT', 587),
    secure: str('SMTP_SECURE', 'false') === 'true',
    user: str('SMTP_USER', ''),
    pass: str('SMTP_PASS', ''),
    from: str('SMTP_FROM', ''),
    to: str('NOTIFY_EMAIL', ''),
  },
}

/** Warnings printed once at boot so misconfiguration is never silent. */
export function checkEnv(): void {
  const warn = (msg: string) => console.warn(`  ⚠  ${msg}`)

  if (!env.anthropicApiKey) {
    warn('ANTHROPIC_API_KEY not set — the AI chatbot endpoint will return 503.')
  }
  if (!env.smtp.host || !env.smtp.to) {
    warn('SMTP not configured — contact messages are saved but no email is sent.')
  }
  if (env.isProd && env.jwtSecret === 'dev-only-insecure-secret-change-me') {
    throw new Error('JWT_SECRET must be set to a unique value in production.')
  }
  if (env.isProd && env.adminPassword === 'admin12345') {
    warn('ADMIN_PASSWORD is still the default — change it and re-seed.')
  }
}
