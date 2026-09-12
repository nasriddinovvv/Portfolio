import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { checkEnv, env } from './env.ts'
import { seedIfEmpty } from './seed.ts'
import { profile } from './profile.ts'
import { mailerEnabled } from './mailer.ts'
import { contentRouter } from './routes/content.ts'
import { contactRouter } from './routes/contact.ts'
import { trackRouter } from './routes/track.ts'
import { chatRouter } from './routes/chat.ts'
import { adminRouter } from './routes/admin.ts'

const app = express()

// Needed so `req.ip` and the rate limiters see the real client behind a proxy.
app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and tools like curl send no Origin header.
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error(`Origin ${origin} ruxsat etilmagan`))
    },
    credentials: false,
  }),
)
app.use(express.json({ limit: '256kb' }))

// A broad backstop; individual routes add their own tighter limits.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 240,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    uptime: Math.round(process.uptime()),
    chatbot: Boolean(env.anthropicApiKey),
    email: mailerEnabled,
  })
})

app.get('/api/profile', (_req, res) => {
  res.json(profile)
})

app.use('/api', contentRouter)
app.use('/api', contactRouter)
app.use('/api', trackRouter)
app.use('/api', chatRouter)
app.use('/api/admin', adminRouter)

app.use((req, res) => {
  res.status(404).json({ error: `Topilmadi: ${req.method} ${req.path}` })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  if (res.headersSent) return
  res.status(500).json({
    error: env.isProd ? 'Serverda kutilmagan xatolik' : err.message,
  })
})

checkEnv()
const seeded = seedIfEmpty()

app.listen(env.port, () => {
  console.log(`\n  Portfolio API  →  http://localhost:${env.port}/api`)
  console.log(`  Database       →  ${env.databasePath}`)
  console.log(`  Chatbot        →  ${env.anthropicApiKey ? `enabled (${env.chatModel})` : 'disabled (no API key)'}`)
  console.log(`  Email notify   →  ${mailerEnabled ? 'enabled' : 'disabled'}`)
  if (seeded.admin) {
    console.log(`\n  Admin created  →  ${env.adminUsername} / ${env.adminPassword}`)
    console.log('  Change this password after your first login.\n')
  } else {
    console.log('')
  }
})
