import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { EVENT_TYPES, recordEvent } from '../analytics.ts'

export const trackRouter: Router = Router()

const trackSchema = z.object({
  type: z.enum(EVENT_TYPES),
  path: z.string().max(200).optional(),
  refId: z.string().max(120).optional(),
  lang: z.string().max(8).optional(),
  referrer: z.string().max(300).optional(),
})

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // A flood of beacons is not worth an error body.
  handler: (_req, res) => res.status(204).end(),
})

trackRouter.post('/track', trackLimiter, (req, res) => {
  const parsed = trackSchema.safeParse(req.body ?? {})
  if (parsed.success) recordEvent(req, parsed.data)

  // Beacons never read the response; always answer cheaply.
  res.status(204).end()
})
