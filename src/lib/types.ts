export type Language = 'uz' | 'en' | 'ru'

export type Localized = Record<Language, string>

export type Project = {
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

export type SkillCategory = 'frontend' | 'backend' | 'ai' | 'tools' | 'other'

export type Skill = {
  id: number
  name: string
  category: SkillCategory
  level: number
  sortOrder: number
}

export type Experience = {
  id: number
  role: Localized
  company: string
  period: string
  description: Localized
  sortOrder: number
}

export type ContactMessage = {
  id: number
  name: string
  email: string
  subject: string | null
  body: string
  isRead: boolean
  isArchived: boolean
  createdAt: string
}

export type Profile = {
  name: string
  fullName: string
  initials: string
  title: string
  location: string
  email: string
  telegram: string
  telegramUsername: string
  github: string
  linkedin: string
  experienceYears: number
  available: boolean
}

export type Bootstrap = {
  projects: Project[]
  skills: Skill[]
  experiences: Experience[]
}

export type Stats = {
  totals: {
    views: number
    visitors: number
    messages: number
    unreadMessages: number
    chats: number
  }
  today: { views: number; visitors: number }
  daily: { date: string; views: number; visitors: number }[]
  topProjects: { refId: string; title: string; clicks: number }[]
  byType: { type: string; count: number }[]
  byLang: { lang: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
}

export type EventType =
  | 'page_view'
  | 'section_view'
  | 'project_click'
  | 'project_open'
  | 'chat_open'
  | 'chat_message'
  | 'resume_download'
  | 'contact_submit'
  | 'social_click'
