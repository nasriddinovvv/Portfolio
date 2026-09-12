import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Language, Localized } from '../lib/types'

export const LANGUAGES: { code: Language; label: string; short: string }[] = [
  { code: 'uz', label: "O'zbekcha", short: 'UZ' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'RU' },
]

type Dictionary = Record<string, string | string[]>

const uz: Dictionary = {
  'nav.home': 'Bosh sahifa',
  'nav.about': 'Men haqimda',
  'nav.skills': "Ko'nikmalar",
  'nav.projects': 'Loyihalar',
  'nav.experience': 'Tajriba',
  'nav.contact': 'Aloqa',
  'nav.aria': 'Asosiy navigatsiya',
  'nav.menu.open': 'Menyuni ochish',
  'nav.menu.close': 'Menyuni yopish',
  'nav.cta': "Bog'lanish",
  'nav.skip': 'Asosiy kontentga o\'tish',

  'theme.toggle': 'Mavzuni almashtirish',
  'theme.light': 'Yorug‘ rejim',
  'theme.dark': 'Qorong‘u rejim',
  'lang.toggle': 'Tilni tanlash',

  'hero.greeting': 'Salom, men',
  'hero.roles': [
    'Frontend Developer',
    'React mutaxassisi',
    'TypeScript ishqibozi',
    'AI integratsiya ustasi',
  ],
  'hero.tagline':
    'Zamonaviy veb-ilovalar yarataman — tez ishlaydigan, chiroyli va foydalanuvchiga qulay.',
  'hero.available': 'Yangi loyihalar uchun ochiqman',
  'hero.busy': 'Hozircha bandman',
  'hero.cta.projects': 'Loyihalarni ko‘rish',
  'hero.cta.contact': 'Menga yozing',
  'hero.scroll': 'Pastga suring',
  'hero.stat.experience': 'yil tajriba',
  'hero.stat.projects': 'tugallangan loyiha',
  'hero.stat.tech': 'texnologiya',

  'about.label': 'Men haqimda',
  'about.title': 'Kod orqali muammolarni yechaman',
  'about.lead':
    'Men React va TypeScript bilan zamonaviy veb-saytlar va ilovalar yarataman. Har bir loyihada foydalanuvchi tajribasi, toza kod va tezlik — asosiy mezonlarim.',
  'about.body':
    'Dizayndan to deploy-gacha bo‘lgan butun jarayonni o‘zim olib boraman: interfeys tuzilishi, komponentlar arxitekturasi, backend API va ishga tushirish. Yangi texnologiyalarni tez o‘rganaman va ularni amaliy loyihalarda sinab ko‘raman.',
  'about.stat.experience': 'yillik tajriba',
  'about.stat.projects': 'loyiha',
  'about.stat.clients': 'mijoz',
  'about.stat.commits': 'commit',
  'about.focus.title': 'Hozirgi diqqat markazim',
  'about.focus.body': 'AI integratsiyalari va React ilovalarining unumdorligini oshirish.',
  'about.location': 'Joylashuv',
  'about.cta': 'Birgalikda ishlaymizmi?',

  'skills.label': "Ko'nikmalar",
  'skills.title': 'Men ishlatadigan texnologiyalar',
  'skills.subtitle':
    'Kundalik ishimda tayanadigan asosiy vositalar. Daraja — amaliy loyihalardagi tajribamga asoslangan.',
  'skills.cat.all': 'Hammasi',
  'skills.cat.frontend': 'Frontend',
  'skills.cat.backend': 'Backend',
  'skills.cat.ai': 'AI',
  'skills.cat.tools': 'Vositalar',
  'skills.cat.other': 'Boshqa',

  'projects.label': 'Portfolio',
  'projects.title': 'Tanlangan loyihalar',
  'projects.subtitle':
    'Har bir loyiha — real muammoga topilgan yechim. Batafsil ko‘rish uchun kartani bosing.',
  'projects.filter.all': 'Barchasi',
  'projects.featured': 'Tanlangan',
  'projects.live': 'Jonli demo',
  'projects.github': 'Kod',
  'projects.details': 'Batafsil',
  'projects.empty': 'Bu filtr bo‘yicha loyiha topilmadi.',
  'projects.modal.about': 'Loyiha haqida',
  'projects.modal.tech': 'Texnologiyalar',
  'projects.modal.year': 'Yil',
  'projects.modal.close': 'Yopish',

  'experience.label': 'Yo‘lim',
  'experience.title': 'Tajriba',
  'experience.subtitle': 'Shu paytgacha bosib o‘tgan bosqichlarim.',

  'contact.label': 'Aloqa',
  'contact.title': 'Keling, birgalikda ishlaymiz',
  'contact.subtitle':
    'Yangi loyiha, hamkorlik yoki oddiy savol — bemalol yozing. Odatda bir kun ichida javob beraman.',
  'contact.form.title': 'Xabar yuborish',
  'contact.form.name': 'Ismingiz',
  'contact.form.name.placeholder': 'Ism familiyangiz',
  'contact.form.email': 'Email',
  'contact.form.email.placeholder': 'siz@example.com',
  'contact.form.subject': 'Mavzu',
  'contact.form.subject.placeholder': 'Nima haqida gaplashamiz?',
  'contact.form.message': 'Xabar',
  'contact.form.message.placeholder': 'Loyihangiz haqida qisqacha yozing...',
  'contact.form.submit': 'Xabarni yuborish',
  'contact.form.sending': 'Yuborilmoqda...',
  'contact.form.optional': 'ixtiyoriy',
  'contact.success.title': 'Xabaringiz yuborildi',
  'contact.success.body': 'Rahmat! Tez orada siz bilan bog‘lanaman.',
  'contact.error.title': 'Yuborib bo‘lmadi',
  'contact.direct': 'To‘g‘ridan-to‘g‘ri aloqa',
  'contact.email': 'Email',
  'contact.telegram': 'Telegram',
  'contact.location': 'Manzil',
  'contact.response': 'Javob berish vaqti',
  'contact.response.value': 'Odatda 24 soat ichida',

  'chatbot.title': 'AI Yordamchi',
  'chatbot.subtitle': 'Humoyun haqida so‘rang',
  'chatbot.online': 'Onlayn',
  'chatbot.greeting':
    'Salom! Men Humoyunning AI yordamchisiman. Uning loyihalari, ko‘nikmalari yoki tajribasi haqida so‘rashingiz mumkin.',
  'chatbot.placeholder': 'Savolingizni yozing...',
  'chatbot.send': 'Yuborish',
  'chatbot.close': 'Chatni yopish',
  'chatbot.open': 'Chatni ochish',
  'chatbot.clear': 'Suhbatni tozalash',
  'chatbot.thinking': 'Yozmoqda',
  'chatbot.disabled.title': 'AI yordamchi sozlanmagan',
  'chatbot.disabled.body':
    'Chatbotni ishga tushirish uchun server/.env faylida ANTHROPIC_API_KEY ni belgilang.',
  'chatbot.error': 'Xatolik yuz berdi. Qayta urinib ko‘ring.',
  'chatbot.suggestions': [
    'Qanday texnologiyalarni biladi?',
    'Eng yaxshi loyihasi qaysi?',
    'U bilan qanday bog‘lansam bo‘ladi?',
  ],

  'footer.tagline': 'Zamonaviy veb-ilovalar ishlab chiqaman.',
  'footer.nav': 'Sahifalar',
  'footer.social': 'Ijtimoiy tarmoqlar',
  'footer.rights': 'Barcha huquqlar himoyalangan.',
  'footer.built': 'React, TypeScript va Claude API yordamida qurilgan.',
  'footer.top': 'Yuqoriga',

  'common.loading': 'Yuklanmoqda...',
  'common.error': 'Ma’lumotni yuklab bo‘lmadi',
  'common.retry': 'Qayta urinish',
  'common.offline.title': 'Backend ishlamayapti',
  'common.offline.body':
    'Sayt namunaviy ma’lumotlar bilan ko‘rsatilmoqda. To‘liq ishlashi uchun serverni ishga tushiring: npm run dev:server',
}

const en: Dictionary = {
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.skills': 'Skills',
  'nav.projects': 'Projects',
  'nav.experience': 'Experience',
  'nav.contact': 'Contact',
  'nav.aria': 'Main navigation',
  'nav.menu.open': 'Open menu',
  'nav.menu.close': 'Close menu',
  'nav.cta': 'Get in touch',
  'nav.skip': 'Skip to main content',

  'theme.toggle': 'Toggle theme',
  'theme.light': 'Light mode',
  'theme.dark': 'Dark mode',
  'lang.toggle': 'Choose language',

  'hero.greeting': "Hi, I'm",
  'hero.roles': [
    'Frontend Developer',
    'React specialist',
    'TypeScript enthusiast',
    'AI integration builder',
  ],
  'hero.tagline':
    'I build modern web applications — fast, beautiful, and genuinely pleasant to use.',
  'hero.available': 'Available for new projects',
  'hero.busy': 'Currently busy',
  'hero.cta.projects': 'View projects',
  'hero.cta.contact': 'Get in touch',
  'hero.scroll': 'Scroll down',
  'hero.stat.experience': 'years of experience',
  'hero.stat.projects': 'projects shipped',
  'hero.stat.tech': 'technologies',

  'about.label': 'About me',
  'about.title': 'I solve problems with code',
  'about.lead':
    'I build modern websites and applications with React and TypeScript. Every project comes down to three things for me: user experience, clean code, and speed.',
  'about.body':
    'I handle the whole path from design to deployment — interface structure, component architecture, backend APIs, and shipping. I pick up new technology quickly and put it to work in real projects.',
  'about.stat.experience': 'years experience',
  'about.stat.projects': 'projects',
  'about.stat.clients': 'clients',
  'about.stat.commits': 'commits',
  'about.focus.title': 'Current focus',
  'about.focus.body': 'AI integrations and squeezing more performance out of React apps.',
  'about.location': 'Location',
  'about.cta': 'Want to work together?',

  'skills.label': 'Skills',
  'skills.title': 'Technologies I work with',
  'skills.subtitle':
    'The tools I reach for day to day. Levels reflect hands-on project experience, not certificates.',
  'skills.cat.all': 'All',
  'skills.cat.frontend': 'Frontend',
  'skills.cat.backend': 'Backend',
  'skills.cat.ai': 'AI',
  'skills.cat.tools': 'Tools',
  'skills.cat.other': 'Other',

  'projects.label': 'Portfolio',
  'projects.title': 'Selected work',
  'projects.subtitle':
    'Each project solves a real problem. Click a card to read the full story.',
  'projects.filter.all': 'All',
  'projects.featured': 'Featured',
  'projects.live': 'Live demo',
  'projects.github': 'Code',
  'projects.details': 'Details',
  'projects.empty': 'No projects match this filter.',
  'projects.modal.about': 'About the project',
  'projects.modal.tech': 'Technologies',
  'projects.modal.year': 'Year',
  'projects.modal.close': 'Close',

  'experience.label': 'Journey',
  'experience.title': 'Experience',
  'experience.subtitle': 'The path that got me here.',

  'contact.label': 'Contact',
  'contact.title': "Let's work together",
  'contact.subtitle':
    'A new project, a collaboration, or just a question — write to me. I usually reply within a day.',
  'contact.form.title': 'Send a message',
  'contact.form.name': 'Your name',
  'contact.form.name.placeholder': 'Jane Doe',
  'contact.form.email': 'Email',
  'contact.form.email.placeholder': 'you@example.com',
  'contact.form.subject': 'Subject',
  'contact.form.subject.placeholder': 'What should we talk about?',
  'contact.form.message': 'Message',
  'contact.form.message.placeholder': 'Tell me a bit about your project...',
  'contact.form.submit': 'Send message',
  'contact.form.sending': 'Sending...',
  'contact.form.optional': 'optional',
  'contact.success.title': 'Message sent',
  'contact.success.body': "Thank you! I'll get back to you shortly.",
  'contact.error.title': "Couldn't send",
  'contact.direct': 'Direct contact',
  'contact.email': 'Email',
  'contact.telegram': 'Telegram',
  'contact.location': 'Location',
  'contact.response': 'Response time',
  'contact.response.value': 'Usually within 24 hours',

  'chatbot.title': 'AI Assistant',
  'chatbot.subtitle': 'Ask about Humoyun',
  'chatbot.online': 'Online',
  'chatbot.greeting':
    "Hi! I'm Humoyun's AI assistant. Ask me about his projects, skills, or experience.",
  'chatbot.placeholder': 'Type your question...',
  'chatbot.send': 'Send',
  'chatbot.close': 'Close chat',
  'chatbot.open': 'Open chat',
  'chatbot.clear': 'Clear conversation',
  'chatbot.thinking': 'Typing',
  'chatbot.disabled.title': 'AI assistant not configured',
  'chatbot.disabled.body':
    'Set ANTHROPIC_API_KEY in server/.env to enable the chatbot.',
  'chatbot.error': 'Something went wrong. Please try again.',
  'chatbot.suggestions': [
    'What technologies does he know?',
    'What is his best project?',
    'How can I reach him?',
  ],

  'footer.tagline': 'I build modern web applications.',
  'footer.nav': 'Pages',
  'footer.social': 'Social',
  'footer.rights': 'All rights reserved.',
  'footer.built': 'Built with React, TypeScript and the Claude API.',
  'footer.top': 'Back to top',

  'common.loading': 'Loading...',
  'common.error': "Couldn't load the data",
  'common.retry': 'Try again',
  'common.offline.title': 'Backend is not running',
  'common.offline.body':
    'The site is showing sample data. Start the server for the full experience: npm run dev:server',
}

const ru: Dictionary = {
  'nav.home': 'Главная',
  'nav.about': 'Обо мне',
  'nav.skills': 'Навыки',
  'nav.projects': 'Проекты',
  'nav.experience': 'Опыт',
  'nav.contact': 'Контакты',
  'nav.aria': 'Основная навигация',
  'nav.menu.open': 'Открыть меню',
  'nav.menu.close': 'Закрыть меню',
  'nav.cta': 'Связаться',
  'nav.skip': 'Перейти к содержимому',

  'theme.toggle': 'Сменить тему',
  'theme.light': 'Светлая тема',
  'theme.dark': 'Тёмная тема',
  'lang.toggle': 'Выбрать язык',

  'hero.greeting': 'Привет, я',
  'hero.roles': [
    'Frontend разработчик',
    'React специалист',
    'Энтузиаст TypeScript',
    'Разработчик AI-интеграций',
  ],
  'hero.tagline':
    'Создаю современные веб-приложения — быстрые, красивые и удобные для пользователя.',
  'hero.available': 'Открыт для новых проектов',
  'hero.busy': 'Сейчас занят',
  'hero.cta.projects': 'Смотреть проекты',
  'hero.cta.contact': 'Написать мне',
  'hero.scroll': 'Листайте вниз',
  'hero.stat.experience': 'года опыта',
  'hero.stat.projects': 'проектов',
  'hero.stat.tech': 'технологий',

  'about.label': 'Обо мне',
  'about.title': 'Решаю задачи с помощью кода',
  'about.lead':
    'Создаю современные сайты и приложения на React и TypeScript. В каждом проекте для меня важны три вещи: удобство пользователя, чистый код и скорость.',
  'about.body':
    'Веду весь путь от дизайна до деплоя: структура интерфейса, архитектура компонентов, backend API и запуск. Быстро осваиваю новые технологии и сразу применяю их в реальных проектах.',
  'about.stat.experience': 'года опыта',
  'about.stat.projects': 'проектов',
  'about.stat.clients': 'клиентов',
  'about.stat.commits': 'коммитов',
  'about.focus.title': 'Сейчас в фокусе',
  'about.focus.body': 'AI-интеграции и производительность React-приложений.',
  'about.location': 'Локация',
  'about.cta': 'Поработаем вместе?',

  'skills.label': 'Навыки',
  'skills.title': 'Технологии, с которыми работаю',
  'skills.subtitle':
    'Инструменты, которыми пользуюсь каждый день. Уровень отражает практический опыт в проектах.',
  'skills.cat.all': 'Все',
  'skills.cat.frontend': 'Frontend',
  'skills.cat.backend': 'Backend',
  'skills.cat.ai': 'AI',
  'skills.cat.tools': 'Инструменты',
  'skills.cat.other': 'Другое',

  'projects.label': 'Портфолио',
  'projects.title': 'Избранные работы',
  'projects.subtitle':
    'Каждый проект решает реальную задачу. Нажмите на карточку, чтобы узнать подробности.',
  'projects.filter.all': 'Все',
  'projects.featured': 'Избранное',
  'projects.live': 'Демо',
  'projects.github': 'Код',
  'projects.details': 'Подробнее',
  'projects.empty': 'По этому фильтру проектов нет.',
  'projects.modal.about': 'О проекте',
  'projects.modal.tech': 'Технологии',
  'projects.modal.year': 'Год',
  'projects.modal.close': 'Закрыть',

  'experience.label': 'Путь',
  'experience.title': 'Опыт',
  'experience.subtitle': 'Этапы, которые привели меня сюда.',

  'contact.label': 'Контакты',
  'contact.title': 'Давайте работать вместе',
  'contact.subtitle':
    'Новый проект, сотрудничество или просто вопрос — напишите мне. Обычно отвечаю в течение дня.',
  'contact.form.title': 'Отправить сообщение',
  'contact.form.name': 'Ваше имя',
  'contact.form.name.placeholder': 'Имя и фамилия',
  'contact.form.email': 'Email',
  'contact.form.email.placeholder': 'you@example.com',
  'contact.form.subject': 'Тема',
  'contact.form.subject.placeholder': 'О чём поговорим?',
  'contact.form.message': 'Сообщение',
  'contact.form.message.placeholder': 'Расскажите немного о вашем проекте...',
  'contact.form.submit': 'Отправить',
  'contact.form.sending': 'Отправка...',
  'contact.form.optional': 'необязательно',
  'contact.success.title': 'Сообщение отправлено',
  'contact.success.body': 'Спасибо! Свяжусь с вами в ближайшее время.',
  'contact.error.title': 'Не удалось отправить',
  'contact.direct': 'Прямая связь',
  'contact.email': 'Email',
  'contact.telegram': 'Telegram',
  'contact.location': 'Локация',
  'contact.response': 'Время ответа',
  'contact.response.value': 'Обычно в течение 24 часов',

  'chatbot.title': 'AI Ассистент',
  'chatbot.subtitle': 'Спросите о Хумоюне',
  'chatbot.online': 'Онлайн',
  'chatbot.greeting':
    'Привет! Я AI-ассистент Хумоюна. Спросите меня о его проектах, навыках или опыте.',
  'chatbot.placeholder': 'Напишите вопрос...',
  'chatbot.send': 'Отправить',
  'chatbot.close': 'Закрыть чат',
  'chatbot.open': 'Открыть чат',
  'chatbot.clear': 'Очистить переписку',
  'chatbot.thinking': 'Печатает',
  'chatbot.disabled.title': 'AI-ассистент не настроен',
  'chatbot.disabled.body':
    'Укажите ANTHROPIC_API_KEY в server/.env, чтобы включить чатбот.',
  'chatbot.error': 'Произошла ошибка. Попробуйте ещё раз.',
  'chatbot.suggestions': [
    'Какими технологиями он владеет?',
    'Какой его лучший проект?',
    'Как с ним связаться?',
  ],

  'footer.tagline': 'Создаю современные веб-приложения.',
  'footer.nav': 'Страницы',
  'footer.social': 'Соцсети',
  'footer.rights': 'Все права защищены.',
  'footer.built': 'Собрано на React, TypeScript и Claude API.',
  'footer.top': 'Наверх',

  'common.loading': 'Загрузка...',
  'common.error': 'Не удалось загрузить данные',
  'common.retry': 'Повторить',
  'common.offline.title': 'Бэкенд не запущен',
  'common.offline.body':
    'Сайт показывает демо-данные. Запустите сервер для полной работы: npm run dev:server',
}

const dictionaries: Record<Language, Dictionary> = { uz, en, ru }

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  /** Looks up a string key; returns the key itself when missing. */
  t: (key: string) => string
  /** Looks up a list key (hero roles, chat suggestions). */
  tList: (key: string) => string[]
  /** Picks the active language out of a `{uz, en, ru}` column. */
  pick: (value: Localized | undefined) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = 'portfolio.language'

function readStored(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'uz' || saved === 'en' || saved === 'ru') return saved
  } catch {
    /* ignore */
  }

  const browser = navigator.language.slice(0, 2)
  if (browser === 'ru') return 'ru'
  if (browser === 'en') return 'en'
  return 'uz'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStored)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary = dictionaries[language]

    return {
      language,
      setLanguage,
      t: (key) => {
        const entry = dictionary[key] ?? dictionaries.en[key]
        return typeof entry === 'string' ? entry : key
      },
      tList: (key) => {
        const entry = dictionary[key] ?? dictionaries.en[key]
        return Array.isArray(entry) ? entry : []
      },
      pick: (localizedValue) => {
        if (!localizedValue) return ''
        return localizedValue[language] || localizedValue.uz || localizedValue.en || ''
      },
    }
  }, [language, setLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
