import type { Experience, Profile, Project, Skill } from '../lib/types'

/**
 * Static copies of the seeded content. The site renders these when the API is
 * unreachable, so the page is never blank during a backend outage.
 */

export const fallbackProfile: Profile = {
  name: 'Humoyun',
  fullName: 'Humoyun Nasriddinov',
  initials: 'HN',
  title: 'Frontend Developer',
  location: "O'zbekiston",
  email: 'xumoyunnasriddinov174@gmail.com',
  telegram: 'https://t.me/Qoraqoww',
  telegramUsername: '@Qoraqoww',
  github: 'https://github.com/nasriddinovvv',
  linkedin: 'https://www.linkedin.com/in/xumoyun-nasriddinov-9177b3424',
  experienceYears: 2,
  available: true,
}

const L = (uz: string, en: string, ru: string) => ({ uz, en, ru })

const baseProject = {
  coverUrl: null,
  liveUrl: null,
  published: true,
  createdAt: '',
  updatedAt: '',
}

export const fallbackProjects: Project[] = [
  {
    ...baseProject,
    id: 1,
    slug: 'adblogger-uz',
    title: L('AdBlogger.uz', 'AdBlogger.uz', 'AdBlogger.uz'),
    summary: L(
      "O'zbekistondagi ilk yirik influencer marketing platformasi — reklama beruvchilar va blogerlarni yagona raqamli makonda birlashtiradi.",
      "Uzbekistan's first major influencer marketing platform — connecting advertisers and content creators in a single digital space.",
      'Первая крупная платформа инфлюенсер-маркетинга в Узбекистане — объединяет рекламодателей и блогеров в едином цифровом пространстве.',
    ),
    description: L(
      "AdBlogger.uz — O'zbekistondagi ilk yirik influencer marketing (blogerlar) platformasi bo'lib, reklama beruvchilar va kontent yaratuvchilarni (Instagram, Telegram, YouTube, TikTok) yagona raqamli makonda birlashtiradi. Asosiy maqsadi: tadbirkorlar va brendlarga o'z mahsulotlari uchun mos blogerlarni tezkor topish, narxlarni solishtirish, xavfsiz shartnomalar tuzish va reklama kampaniyalarini boshqarish jarayonlarini soddalashtirishdan iborat.",
      "AdBlogger.uz is Uzbekistan's first major influencer marketing platform, connecting advertisers and content creators (Instagram, Telegram, YouTube, TikTok) in a single digital space. Its goal is to help businesses and brands quickly find the right bloggers for their products, compare prices, sign secure contracts, and simplify managing advertising campaigns.",
      'AdBlogger.uz — первая крупная платформа инфлюенсер-маркетинга в Узбекистане, объединяющая рекламодателей и создателей контента (Instagram, Telegram, YouTube, TikTok) в едином цифровом пространстве. Цель платформы — помочь бизнесу и брендам быстро находить подходящих блогеров, сравнивать цены, заключать безопасные договоры и упрощать управление рекламными кампаниями.',
    ),
    tags: ['React.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express.js', 'PostgreSQL', 'Axios', 'REST API'],
    liveUrl: 'https://www.adblogger.uz/',
    githubUrl: null,
    year: '2026',
    featured: true,
    sortOrder: 0,
  },
]

export const fallbackSkills: Skill[] = [
  { id: 1, name: 'React', category: 'frontend', level: 92, sortOrder: 0 },
  { id: 2, name: 'TypeScript', category: 'frontend', level: 88, sortOrder: 1 },
  { id: 3, name: 'JavaScript', category: 'frontend', level: 92, sortOrder: 2 },
  { id: 4, name: 'HTML / CSS', category: 'frontend', level: 95, sortOrder: 3 },
  { id: 5, name: 'Tailwind CSS', category: 'frontend', level: 85, sortOrder: 4 },
  { id: 6, name: 'Vite', category: 'frontend', level: 85, sortOrder: 5 },
  { id: 7, name: 'Node.js', category: 'backend', level: 78, sortOrder: 6 },
  { id: 8, name: 'Express', category: 'backend', level: 76, sortOrder: 7 },
  { id: 9, name: 'REST API', category: 'backend', level: 82, sortOrder: 8 },
  { id: 10, name: 'SQLite / SQL', category: 'backend', level: 72, sortOrder: 9 },
  { id: 11, name: 'PostgreSQL', category: 'backend', level: 65, sortOrder: 10 },
  { id: 12, name: 'Claude API', category: 'ai', level: 84, sortOrder: 11 },
  { id: 13, name: 'Prompt Engineering', category: 'ai', level: 88, sortOrder: 12 },
  { id: 14, name: 'AI Integration', category: 'ai', level: 82, sortOrder: 13 },
  { id: 15, name: 'Git / GitHub', category: 'tools', level: 88, sortOrder: 14 },
  { id: 16, name: 'Figma', category: 'tools', level: 70, sortOrder: 15 },
]

export const fallbackExperiences: Experience[] = [
  {
    id: 1,
    role: L('Frontend Developer', 'Frontend Developer', 'Frontend разработчик'),
    company: 'Freelance',
    period: `2024 — ${new Date().getFullYear()}`,
    description: L(
      'Mijozlar uchun React va TypeScript asosida veb-ilovalar ishlab chiqish.',
      'Building web apps for clients with React and TypeScript.',
      'Разработка веб-приложений для клиентов на React и TypeScript.',
    ),
    sortOrder: 0,
  },
  {
    id: 2,
    role: L('Web Developer', 'Web Developer', 'Веб-разработчик'),
    company: 'Personal Projects',
    period: '2023 — 2024',
    description: L(
      'Shaxsiy loyihalar orqali zamonaviy frontend stack va backend asoslarini o‘zlashtirish.',
      'Mastered the modern frontend stack and backend fundamentals through personal projects.',
      'Освоение современного фронтенд-стека и основ бэкенда через личные проекты.',
    ),
    sortOrder: 1,
  },
]

export const navLinks = [
  { href: '#home', key: 'nav.home' },
  { href: '#about', key: 'nav.about' },
  { href: '#skills', key: 'nav.skills' },
  { href: '#projects', key: 'nav.projects' },
  { href: '#experience', key: 'nav.experience' },
  { href: '#contact', key: 'nav.contact' },
]

/** Headline numbers that are not worth a database round trip. */
export const highlightStats = {
  projects: 15,
  clients: 10,
  commits: 900,
}
