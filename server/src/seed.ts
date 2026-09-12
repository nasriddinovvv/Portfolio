import bcrypt from 'bcryptjs'
import { db } from './db.ts'
import { env } from './env.ts'

type Seeded = { admin: boolean; projects: number; skills: number; experiences: number }

const L = (uz: string, en: string, ru: string) => JSON.stringify({ uz, en, ru })

const defaultProjects = [
  {
    slug: 'e-commerce-platform',
    title: L('E-Commerce Platforma', 'E-Commerce Platform', 'E-Commerce Платформа'),
    summary: L(
      "To'liq funksional onlayn do'kon — mahsulotlar katalogi, savat, to'lov va admin panel.",
      'A full-featured online store — product catalog, cart, checkout and admin panel.',
      'Полнофункциональный интернет-магазин — каталог, корзина, оплата и админ-панель.',
    ),
    description: L(
      "React va TypeScript asosidagi onlayn do'kon. Mahsulotlarni filtrlash va qidirish, savatga qo'shish, buyurtma berish va to'lov integratsiyasi mavjud. Admin panel orqali mahsulotlar va buyurtmalarni boshqarish mumkin. Backend Node.js va PostgreSQL-da qurilgan.",
      'An online store built with React and TypeScript. Includes product filtering and search, cart management, checkout with payment integration, and an admin panel for managing products and orders. The backend runs on Node.js with PostgreSQL.',
      'Интернет-магазин на React и TypeScript. Фильтрация и поиск товаров, корзина, оформление заказа с интеграцией оплаты и админ-панель. Бэкенд — Node.js и PostgreSQL.',
    ),
    tags: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe']),
    live_url: '',
    github_url: 'https://github.com/nasriddinovvv',
    year: '2025',
    featured: 1,
    sort_order: 1,
  },
  {
    slug: 'task-manager',
    title: L('Task Manager', 'Task Manager', 'Менеджер задач'),
    summary: L(
      "Vazifalarni boshqarish ilovasi — drag & drop, filtrlash va real-time yangilanish.",
      'Task management app — drag & drop boards, filtering and real-time updates.',
      'Приложение для управления задачами — drag & drop, фильтры и обновления в реальном времени.',
    ),
    description: L(
      "Kanban uslubidagi vazifa boshqaruvi. Ustunlar orasida drag & drop, teglar bo'yicha filtrlash, muddat belgilash va bir nechta foydalanuvchi bilan real vaqtda sinxronizatsiya. Firebase Firestore ma'lumotlar bazasi sifatida ishlatilgan.",
      'A Kanban-style task manager. Drag & drop between columns, tag filtering, due dates, and real-time sync across multiple users. Firebase Firestore is used as the database.',
      'Kanban-менеджер задач. Drag & drop между колонками, фильтрация по тегам, сроки и синхронизация в реальном времени между пользователями. База данных — Firebase Firestore.',
    ),
    tags: JSON.stringify(['React', 'Firebase', 'Zustand', 'CSS']),
    live_url: '',
    github_url: 'https://github.com/nasriddinovvv',
    year: '2025',
    featured: 1,
    sort_order: 2,
  },
  {
    slug: 'weather-dashboard',
    title: L('Ob-havo Dashboard', 'Weather Dashboard', 'Погодный дашборд'),
    summary: L(
      "Ob-havo ma'lumotlari dashboardi — 7 kunlik prognoz va interaktiv grafiklar.",
      'A weather dashboard — 7-day forecast and interactive charts.',
      'Погодный дашборд — прогноз на 7 дней и интерактивные графики.',
    ),
    description: L(
      "OpenWeather API orqali istalgan shahar uchun joriy ob-havo va 7 kunlik prognozni ko'rsatadi. Harorat, namlik va shamol tezligi grafiklarda aks etadi. Geolokatsiya orqali avtomatik shahar aniqlash qo'llab-quvvatlanadi.",
      'Shows current weather and a 7-day forecast for any city via the OpenWeather API. Temperature, humidity and wind speed are plotted as charts. Automatic city detection through geolocation is supported.',
      'Показывает текущую погоду и прогноз на 7 дней через OpenWeather API. Температура, влажность и скорость ветра отображаются на графиках. Поддерживается автоопределение города по геолокации.',
    ),
    tags: JSON.stringify(['React', 'REST API', 'Chart.js']),
    live_url: '',
    github_url: 'https://github.com/nasriddinovvv',
    year: '2024',
    featured: 0,
    sort_order: 3,
  },
  {
    slug: 'ai-portfolio',
    title: L('AI Portfolio Sayti', 'AI Portfolio Site', 'AI Портфолио-сайт'),
    summary: L(
      'Ushbu sayt — AI chatbot, admin panel va to‘liq backend bilan.',
      'This very site — with an AI chatbot, admin panel and a complete backend.',
      'Этот самый сайт — с AI-чатботом, админ-панелью и полноценным бэкендом.',
    ),
    description: L(
      "React 19, TypeScript va Vite asosidagi portfolio. Backend Express va SQLite-da ishlaydi: loyihalar API, aloqa formasi, tashriflar statistikasi va Claude API orqali striming AI chatbot. Admin panel JWT autentifikatsiya bilan himoyalangan.",
      'A portfolio built on React 19, TypeScript and Vite. The backend runs on Express and SQLite: a projects API, contact form, visit analytics, and a streaming AI chatbot powered by the Claude API. The admin panel is protected with JWT authentication.',
      'Портфолио на React 19, TypeScript и Vite. Бэкенд на Express и SQLite: API проектов, форма связи, аналитика посещений и стриминговый AI-чатбот на Claude API. Админ-панель защищена JWT-аутентификацией.',
    ),
    tags: JSON.stringify(['React 19', 'TypeScript', 'Express', 'SQLite', 'Claude API']),
    live_url: '',
    github_url: 'https://github.com/nasriddinovvv',
    year: '2026',
    featured: 1,
    sort_order: 0,
  },
]

const defaultSkills = [
  { name: 'React', category: 'frontend', level: 92 },
  { name: 'TypeScript', category: 'frontend', level: 88 },
  { name: 'JavaScript', category: 'frontend', level: 92 },
  { name: 'HTML / CSS', category: 'frontend', level: 95 },
  { name: 'Tailwind CSS', category: 'frontend', level: 85 },
  { name: 'Vite', category: 'frontend', level: 85 },
  { name: 'Node.js', category: 'backend', level: 78 },
  { name: 'Express', category: 'backend', level: 76 },
  { name: 'REST API', category: 'backend', level: 82 },
  { name: 'SQLite / SQL', category: 'backend', level: 72 },
  { name: 'PostgreSQL', category: 'backend', level: 65 },
  { name: 'Claude API', category: 'ai', level: 84 },
  { name: 'Prompt Engineering', category: 'ai', level: 88 },
  { name: 'AI Integration', category: 'ai', level: 82 },
  { name: 'Git / GitHub', category: 'tools', level: 88 },
  { name: 'Figma', category: 'tools', level: 70 },
]

const defaultExperiences = [
  {
    role: L('Frontend Developer', 'Frontend Developer', 'Frontend разработчик'),
    company: 'Freelance',
    period: '2024 — ' + new Date().getFullYear(),
    description: L(
      "Mijozlar uchun React va TypeScript asosida veb-ilovalar va landing sahifalar ishlab chiqish. Dizayndan to deploy-gacha to'liq sikl.",
      'Building web apps and landing pages for clients with React and TypeScript — the full cycle from design to deployment.',
      'Разработка веб-приложений и лендингов для клиентов на React и TypeScript — полный цикл от дизайна до деплоя.',
    ),
    sort_order: 0,
  },
  {
    role: L('Web Developer', 'Web Developer', 'Веб-разработчик'),
    company: 'Personal Projects',
    period: '2023 — 2024',
    description: L(
      "Shaxsiy loyihalar orqali zamonaviy frontend stack va backend asoslarini o'zlashtirish. 15+ loyiha yakunlandi.",
      'Mastered the modern frontend stack and backend fundamentals through personal projects. 15+ projects completed.',
      'Освоение современного фронтенд-стека и основ бэкенда через личные проекты. Завершено 15+ проектов.',
    ),
    sort_order: 1,
  },
]

/** Inserts starter content into any table that is still empty. Idempotent. */
export function seedIfEmpty(): Seeded {
  const result: Seeded = { admin: false, projects: 0, skills: 0, experiences: 0 }
  const count = (table: string) =>
    (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n

  if (count('admins') === 0) {
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(
      env.adminUsername,
      bcrypt.hashSync(env.adminPassword, 10),
    )
    result.admin = true
  }

  if (count('projects') === 0) {
    const insert = db.prepare(`
      INSERT INTO projects (slug, title, summary, description, tags, live_url, github_url, year, featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const p of defaultProjects) {
      insert.run(
        p.slug, p.title, p.summary, p.description, p.tags,
        p.live_url, p.github_url, p.year, p.featured, p.sort_order,
      )
    }
    result.projects = defaultProjects.length
  }

  if (count('skills') === 0) {
    const insert = db.prepare(
      'INSERT INTO skills (name, category, level, sort_order) VALUES (?, ?, ?, ?)',
    )
    defaultSkills.forEach((s, i) => insert.run(s.name, s.category, s.level, i))
    result.skills = defaultSkills.length
  }

  if (count('experiences') === 0) {
    const insert = db.prepare(
      'INSERT INTO experiences (role, company, period, description, sort_order) VALUES (?, ?, ?, ?, ?)',
    )
    for (const e of defaultExperiences) {
      insert.run(e.role, e.company, e.period, e.description, e.sort_order)
    }
    result.experiences = defaultExperiences.length
  }

  return result
}

// Allow `npm run seed` to report what it did.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const seeded = seedIfEmpty()
  console.log('Seed complete:', seeded)
}
