# Humoyun Nasriddinov — Portfolio

To'liq stack portfolio sayti: React 19 frontend, Express backend, SQLite baza,
admin panel va Claude API asosidagi striming AI chatbot.

---

## Nima bor

**Sayt (public)**

- Zamonaviy dizayn — aurora fon, glass kartalar, kursorga ergashuvchi yorug'lik
- Qorong'u / yorug' mavzu (tizim sozlamasini ham kuzatadi, flash yo'q)
- Uch til: o'zbek, ingliz, rus — hammasi bir joyda tarjima qilingan
- Bo'limlar: Hero, Men haqimda (bento grid), Ko'nikmalar, Loyihalar, Tajriba, Aloqa
- Loyiha kartasini bosganda batafsil oyna ochiladi
- Ishlaydigan aloqa formasi — validatsiya, bot tuzog'i, bazaga saqlash
- AI chatbot — javob real vaqtda harf-harf oqib keladi
- Scroll-reveal animatsiyalar, `prefers-reduced-motion` hurmat qilinadi
- Telefon, planshet va desktopda to'liq moslashuvchan
- Backend o'chib qolsa ham sayt namunaviy ma'lumot bilan ishlaydi

**Admin panel** (`/admin`)

- JWT login, parolni o'zgartirish
- Dashboard: ko'rishlar, tashrifchilar, kunlik grafik, top loyihalar, tillar, referrerlar
- Loyihalar / Ko'nikmalar / Tajriba — to'liq qo'shish, tahrirlash, o'chirish
- Uch tilli maydonlar bitta joyda (UZ / EN / RU tab)
- Xabarlar: o'qildi belgilash, arxivlash, o'chirish, to'g'ridan-to'g'ri javob berish
- Server holati: chatbot va email yoqilganmi — ko'rinib turadi

**Backend** (`/api`)

- Express 5 + `node:sqlite` (Node 22.5+ ichida, kompilyatsiya kerak emas)
- Loyihalar, ko'nikmalar, tajriba uchun REST API
- Aloqa formasi: zod validatsiya + rate limiting + email bildirishnoma
- Tashriflar statistikasi — IP saqlanmaydi, faqat xeshlangan token
- Claude API orqali SSE striming chatbot; kontekst bazadan avtomatik quriladi
- helmet, CORS oq ro'yxati, bcrypt parol xeshi, har bir endpointda rate limit

---

## Texnologiyalar

| Qatlam   | Stack                                                            |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 8, React Router 7, sof CSS             |
| Backend  | Node 24, Express 5, `node:sqlite`, zod, JWT, bcrypt, nodemailer   |
| AI       | `@anthropic-ai/sdk` — `claude-opus-5`, striming                   |

---

## Ishga tushirish

### 1. Talablar

- **Node.js 22.5 yoki undan yuqori** (`node:sqlite` shu versiyadan mavjud)

```bash
node -v
```

### 2. Paketlarni o'rnatish

```bash
npm run setup
```

Bu frontend va backend paketlarini birdaniga o'rnatadi.

### 3. Server sozlamalari

```bash
cd server
cp .env.example .env
```

`server/.env` faylini oching va kamida quyidagilarni to'ldiring:

```env
# Tasodifiy uzun satr — quyidagi buyruq bilan yarating:
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=...
ANALYTICS_SALT=...

# AI chatbot uchun (https://console.anthropic.com/settings/keys)
ANTHROPIC_API_KEY=sk-ant-...
```

> Kalitsiz ham sayt to'liq ishlaydi — faqat chatbot o'rniga "sozlanmagan"
> xabari chiqadi.

### 4. Ishga tushirish

```bash
npm run dev
```

Bu ikkalasini birga ishga tushiradi:

- Sayt → http://localhost:5173
- API → http://localhost:4000/api
- Admin → http://localhost:5173/admin

**Birinchi kirish:** `admin` / `admin12345` — kirgandan keyin darhol
**Sozlamalar** bo'limida parolni o'zgartiring.

Baza `server/data/portfolio.db` faylida avtomatik yaratiladi va namunaviy
loyihalar bilan to'ldiriladi.

---

## Buyruqlar

| Buyruq                 | Vazifasi                                        |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Frontend + backend birga                        |
| `npm run dev:web`      | Faqat frontend                                  |
| `npm run dev:server`   | Faqat backend                                   |
| `npm run build`        | Frontendni production uchun yig'ish (`dist/`)   |
| `npm run preview`      | Yig'ilgan saytni ko'rish                        |
| `npm run typecheck`    | Frontend va backend TypeScript tekshiruvi       |
| `npm run lint`         | oxlint                                          |
| `npm start`            | Faqat backendni production rejimida ishga tushirish |

---

## API

### Ochiq endpointlar

| Metod | Yo'l                   | Tavsif                                |
| ----- | ---------------------- | ------------------------------------- |
| GET   | `/api/health`          | Server holati                          |
| GET   | `/api/profile`         | Shaxsiy ma'lumotlar                    |
| GET   | `/api/bootstrap`       | Loyiha + ko'nikma + tajriba (bir so'rov) |
| GET   | `/api/projects`        | Nashr qilingan loyihalar               |
| GET   | `/api/projects/:slug`  | Bitta loyiha                           |
| GET   | `/api/skills`          | Ko'nikmalar                            |
| GET   | `/api/experiences`     | Tajriba                                |
| POST  | `/api/contact`         | Aloqa formasi (15 daq / 5 so'rov)      |
| POST  | `/api/track`           | Analitika hodisasi                     |
| GET   | `/api/chat/status`     | Chatbot yoqilganmi                     |
| POST  | `/api/chat`            | AI javobi, SSE striming (10 daq / 25)  |

### Admin endpointlari

Barchasi `Authorization: Bearer <token>` talab qiladi.

| Metod  | Yo'l                         | Tavsif                     |
| ------ | ---------------------------- | -------------------------- |
| POST   | `/api/admin/login`           | Token olish                |
| GET    | `/api/admin/me`              | Joriy admin                |
| POST   | `/api/admin/password`        | Parolni o'zgartirish       |
| GET    | `/api/admin/stats?days=30`   | Statistika                 |
| CRUD   | `/api/admin/projects`        | Loyihalar                  |
| CRUD   | `/api/admin/skills`          | Ko'nikmalar                |
| CRUD   | `/api/admin/experiences`     | Tajriba                    |
| GET    | `/api/admin/messages`        | Xabarlar                   |
| PATCH  | `/api/admin/messages/:id`    | O'qildi / arxivlash        |
| DELETE | `/api/admin/messages/:id`    | O'chirish                  |

---

## Email bildirishnoma (ixtiyoriy)

Yangi xabar kelganda emailingizga xabar tushishi uchun `server/.env` da:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sizning@gmail.com
SMTP_PASS=app-password
SMTP_FROM=sizning@gmail.com
NOTIFY_EMAIL=sizning@gmail.com
```

Gmail uchun oddiy parol emas, **App Password** kerak:
https://myaccount.google.com/apppasswords

Email yuborilmasa ham forma ishlaydi — xabar baribir bazaga saqlanadi.

---

## Ma'lumotlar bazasi

SQLite, `server/data/portfolio.db`. Jadvallar birinchi ishga tushirishda
avtomatik yaratiladi.

| Jadval          | Nima saqlaydi                             |
| --------------- | ----------------------------------------- |
| `admins`        | Admin hisoblari (bcrypt xesh)             |
| `projects`      | Loyihalar (sarlavha/tavsif JSON — 3 til)  |
| `skills`        | Ko'nikmalar va darajalar                  |
| `experiences`   | Ish tajribasi                             |
| `messages`      | Aloqa formasidagi xabarlar                |
| `events`        | Analitika hodisalari (xeshlangan tashrifchi) |
| `chat_messages` | Chat tarixi (sessiya bo'yicha)            |

Bazani noldan boshlash uchun `server/data/` papkasini o'chiring — keyingi
ishga tushirishda qaytadan yaratiladi.

---

## Production

### Frontend

```bash
npm run build
```

`dist/` papkasini Vercel, Netlify yoki Nginx orqali tarqating.
API boshqa domenda bo'lsa, build qilishdan oldin `.env` da
`VITE_API_URL=https://api.sizningdomen.uz/api` ni belgilang.

> SPA routing: `/admin` sahifasi ishlashi uchun serverda barcha yo'llarni
> `index.html` ga yo'naltiring (Netlify `_redirects`, Nginx `try_files`).

### Backend

```bash
cd server
NODE_ENV=production npm start
```

Production uchun majburiy:

- `JWT_SECRET` — noyob, uzun satr (aks holda server ishga tushmaydi)
- `ADMIN_PASSWORD` — standart paroldan boshqa
- `CORS_ORIGINS` — frontend domeningiz

---

## Xavfsizlik

- Parollar bcrypt bilan xeshlanadi, hech qachon ochiq saqlanmaydi
- Anthropic API kaliti faqat serverda — brauzerga hech qachon chiqmaydi
- Barcha kirish ma'lumotlari zod orqali serverda qayta tekshiriladi
- Login, aloqa formasi va chat alohida rate limiterlar ostida
- Analitikada xom IP saqlanmaydi — faqat tuzlangan SHA-256 xesh
- helmet xavfsizlik sarlavhalari, CORS oq ro'yxat bo'yicha
