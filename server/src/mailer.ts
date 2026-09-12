import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { env } from './env.ts'

let transporter: Transporter | null = null

export const mailerEnabled = Boolean(env.smtp.host && env.smtp.user && env.smtp.to)

if (mailerEnabled) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  })
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  )

export type ContactNotification = {
  name: string
  email: string
  subject?: string | null
  body: string
}

/**
 * Sends the "new contact message" email. Never throws — a mail outage must not
 * fail the visitor's form submission, which is already persisted by then.
 */
export async function sendContactNotification(msg: ContactNotification): Promise<boolean> {
  if (!transporter) return false

  const subject = msg.subject?.trim() || 'Mavzusiz'

  try {
    await transporter.sendMail({
      from: env.smtp.from || env.smtp.user,
      to: env.smtp.to,
      replyTo: msg.email,
      subject: `Portfolio — yangi xabar: ${subject}`,
      text: [
        `Ism:   ${msg.name}`,
        `Email: ${msg.email}`,
        `Mavzu: ${subject}`,
        '',
        msg.body,
      ].join('\n'),
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#111">
          <h2 style="margin:0 0 16px">Portfolio saytidan yangi xabar</h2>
          <p style="margin:0 0 4px"><strong>Ism:</strong> ${escapeHtml(msg.name)}</p>
          <p style="margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
          <p style="margin:0 0 16px"><strong>Mavzu:</strong> ${escapeHtml(subject)}</p>
          <div style="padding:16px;background:#f4f4f5;border-radius:8px;white-space:pre-wrap">${escapeHtml(msg.body)}</div>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error('Email notification failed:', (error as Error).message)
    return false
  }
}
