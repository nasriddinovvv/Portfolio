import type {
  Bootstrap,
  ContactMessage,
  EventType,
  Experience,
  Language,
  Profile,
  Project,
  Skill,
  Stats,
} from './types'

/** Vite proxies `/api` to the backend in dev; set VITE_API_URL for other hosts. */
export const API_BASE = import.meta.env.VITE_API_URL || '/api'

const TOKEN_KEY = 'portfolio.admin.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode — the session simply won't persist */
  }
}

export class ApiError extends Error {
  status: number
  fields?: Record<string, string>

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error
    throw new ApiError('Serverga ulanib bo\'lmadi. Backend ishlayotganini tekshiring.', 0)
  }

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => ({}) as Record<string, unknown>)

  if (!response.ok) {
    // An expired admin session should not leave a stale token behind.
    if (response.status === 401 && auth) setToken(null)

    throw new ApiError(
      typeof payload.error === 'string' ? payload.error : `Xatolik (${response.status})`,
      response.status,
      payload.fields as Record<string, string> | undefined,
    )
  }

  return payload as T
}

/* ------------------------------------------------------------- public ---- */

export const api = {
  bootstrap: (signal?: AbortSignal) => request<Bootstrap>('/bootstrap', { signal }),
  profile: (signal?: AbortSignal) => request<Profile>('/profile', { signal }),
  projects: (signal?: AbortSignal) => request<Project[]>('/projects', { signal }),
  skills: (signal?: AbortSignal) => request<Skill[]>('/skills', { signal }),
  experiences: (signal?: AbortSignal) => request<Experience[]>('/experiences', { signal }),

  chatStatus: (signal?: AbortSignal) =>
    request<{ enabled: boolean; model: string | null }>('/chat/status', { signal }),

  sendContact: (body: {
    name: string
    email: string
    subject?: string
    message: string
    website?: string
  }) => request<{ ok: true; id: number; emailed: boolean }>('/contact', { method: 'POST', body }),

  /** Fire-and-forget analytics beacon. Failures are intentionally ignored. */
  track: (type: EventType, extra: { path?: string; refId?: string; lang?: Language } = {}) => {
    const payload = JSON.stringify({
      type,
      path: extra.path ?? window.location.pathname,
      refId: extra.refId,
      lang: extra.lang,
      referrer: document.referrer || undefined,
    })

    // `keepalive` lets the beacon survive a page unload.
    fetch(`${API_BASE}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  },
}

/* -------------------------------------------------------------- admin ---- */

export const adminApi = {
  login: (username: string, password: string) =>
    request<{ token: string; admin: { id: number; username: string } }>('/admin/login', {
      method: 'POST',
      body: { username, password },
    }),

  me: () => request<{ admin: { id: number; username: string } }>('/admin/me', { auth: true }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>('/admin/password', {
      method: 'POST',
      body: { currentPassword, newPassword },
      auth: true,
    }),

  stats: (days = 30) => request<Stats>(`/admin/stats?days=${days}`, { auth: true }),

  projects: () => request<Project[]>('/admin/projects', { auth: true }),
  createProject: (body: ProjectInput) =>
    request<Project>('/admin/projects', { method: 'POST', body, auth: true }),
  updateProject: (id: number, body: ProjectInput) =>
    request<Project>(`/admin/projects/${id}`, { method: 'PUT', body, auth: true }),
  deleteProject: (id: number) =>
    request<{ ok: true }>(`/admin/projects/${id}`, { method: 'DELETE', auth: true }),

  skills: () => request<Skill[]>('/admin/skills', { auth: true }),
  createSkill: (body: SkillInput) =>
    request<Skill>('/admin/skills', { method: 'POST', body, auth: true }),
  updateSkill: (id: number, body: SkillInput) =>
    request<Skill>(`/admin/skills/${id}`, { method: 'PUT', body, auth: true }),
  deleteSkill: (id: number) =>
    request<{ ok: true }>(`/admin/skills/${id}`, { method: 'DELETE', auth: true }),

  experiences: () => request<Experience[]>('/admin/experiences', { auth: true }),
  createExperience: (body: ExperienceInput) =>
    request<Experience>('/admin/experiences', { method: 'POST', body, auth: true }),
  updateExperience: (id: number, body: ExperienceInput) =>
    request<Experience>(`/admin/experiences/${id}`, { method: 'PUT', body, auth: true }),
  deleteExperience: (id: number) =>
    request<{ ok: true }>(`/admin/experiences/${id}`, { method: 'DELETE', auth: true }),

  messages: (archived = false) =>
    request<ContactMessage[]>(`/admin/messages?archived=${archived}`, { auth: true }),
  updateMessage: (id: number, body: { isRead?: boolean; isArchived?: boolean }) =>
    request<ContactMessage>(`/admin/messages/${id}`, { method: 'PATCH', body, auth: true }),
  deleteMessage: (id: number) =>
    request<{ ok: true }>(`/admin/messages/${id}`, { method: 'DELETE', auth: true }),
}

export type ProjectInput = {
  slug: string
  title: Record<Language, string>
  summary: Record<Language, string>
  description: Record<Language, string>
  tags: string[]
  coverUrl: string
  liveUrl: string
  githubUrl: string
  year: string
  featured: boolean
  published: boolean
  sortOrder: number
}

export type SkillInput = {
  name: string
  category: string
  level: number
  sortOrder: number
}

export type ExperienceInput = {
  role: Record<Language, string>
  company: string
  period: string
  description: Record<Language, string>
  sortOrder: number
}
