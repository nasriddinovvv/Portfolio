import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'
import { db } from './db.ts'
import { env } from './env.ts'

export type AdminPayload = { id: number; username: string }

/** A request that has passed `requireAdmin`. */
export type AuthedRequest = Request & { admin?: AdminPayload }

type AdminRow = { id: number; username: string; password_hash: string }

export function signToken(admin: AdminPayload): string {
  return jwt.sign(admin, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions)
}

/** Returns the admin payload for valid credentials, or null. */
export function verifyCredentials(username: string, password: string): AdminPayload | null {
  const row = db
    .prepare('SELECT id, username, password_hash FROM admins WHERE username = ?')
    .get(username) as AdminRow | undefined

  // Always run a hash comparison so a missing user and a wrong password
  // take a similar amount of time.
  const hash = row?.password_hash ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu'
  const ok = bcrypt.compareSync(password, hash)

  if (!row || !ok) return null
  return { id: row.id, username: row.username }
}

export function changePassword(adminId: number, newPassword: string): void {
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(
    bcrypt.hashSync(newPassword, 10),
    adminId,
  )
}

/** Rejects the request unless it carries a valid admin bearer token. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' })
    return
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AdminPayload
    ;(req as AuthedRequest).admin = { id: payload.id, username: payload.username }
    next()
  } catch {
    res.status(401).json({ error: 'Token yaroqsiz yoki muddati tugagan' })
  }
}
