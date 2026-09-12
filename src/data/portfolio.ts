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
    slug: 'ai-portfolio',
    title: L('AI Portfolio Sayti', 'AI Portfolio Site', 'AI Портфолио-сайт'),
    summary: L(
      'Ushbu sayt — AI chatbot, admin panel va to‘liq backend bilan.',
      'This very site — with an AI chatbot, admin panel and a complete backend.',
      'Этот самый сайт — с AI-чатботом, админ-панелью и полноценным бэкендом.',
    ),
    description: L(
      'React 19, TypeScript va Vite asosidagi portfolio. Backend Express va SQLite-da ishlaydi.',
      'A portfolio built on React 19, TypeScript and Vite, with an Express + SQLite backend.',
      'Портфолио на React 19, TypeScript и Vite с бэкендом на Express и SQLite.',
    ),
    tags: ['React 19', 'TypeScript', 'Express', 'SQLite', 'Claude API'],
    githubUrl: 'https://github.com/nasriddinovvv',
    year: '2026',
    featured: true,
    sortOrder: 0,
  },
  {
    ...baseProject,
    id: 2,
    slug: 'e-commerce-platform',
    title: L('E-Commerce Platforma', 'E-Commerce Platform', 'E-Commerce Платформа'),
    summary: L(
      "To'liq funksional onlayn do'kon — katalog, savat, to'lov va admin panel.",
      'A full-featured online store — catalog, cart, checkout and admin panel.',
      'Полнофункциональный интернет-магазин — каталог, корзина, оплата и админ-панель.',
    ),
    description: L(
      'React va TypeScript asosidagi onlayn do‘kon, Node.js va PostgreSQL backend bilan.',
      'An online store built with React and TypeScript, backed by Node.js and PostgreSQL.',
      'Интернет-магазин на React и TypeScript с бэкендом на Node.js и PostgreSQL.',
    ),
    tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'],
    githubUrl: 'https://github.com/nasriddinovvv',
    year: '2025',
    featured: true,
    sortOrder: 1,
  },
  {
    ...baseProject,
    id: 3,
    slug: 'task-manager',
    title: L('Task Manager', 'Task Manager', 'Менеджер задач'),
    summary: L(
      'Vazifalarni boshqarish ilovasi — drag & drop va real-time yangilanish.',
      'Task management app — drag & drop boards and real-time updates.',
      'Приложение для управления задачами — drag & drop и обновления в реальном времени.',
    ),
    description: L(
      'Kanban uslubidagi vazifa boshqaruvi, Firebase Firestore bilan real vaqt sinxronizatsiyasi.',
      'A Kanban-style task manager with real-time sync through Firebase Firestore.',
      'Kanban-менеджер задач с синхронизацией в реальном времени через Firebase Firestore.',
    ),
    tags: ['React', 'Firebase', 'Zustand'],
    githubUrl: 'https://github.com/nasriddinovvv',
    year: '2025',
    featured: true,
    sortOrder: 2,
  },
  {
    ...baseProject,
    id: 4,
    slug: 'weather-dashboard',
    title: L('Ob-havo Dashboard', 'Weather Dashboard', 'Погодный дашборд'),
    summary: L(
      'Ob-havo dashboardi — 7 kunlik prognoz va interaktiv grafiklar.',
      'A weather dashboard — 7-day forecast and interactive charts.',
      'Погодный дашборд — прогноз на 7 дней и интерактивные графики.',
    ),
    description: L(
      'OpenWeather API orqali joriy ob-havo va 7 kunlik prognoz.',
      'Current weather and a 7-day forecast via the OpenWeather API.',
      'Текущая погода и прогноз на 7 дней через OpenWeather API.',
    ),
    tags: ['React', 'REST API', 'Chart.js'],
    githubUrl: 'https://github.com/nasriddinovvv',
    year: '2024',
    featured: false,
    sortOrder: 3,
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
