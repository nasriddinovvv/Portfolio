/**
 * Static owner details. Shared by the chatbot's system prompt and the
 * `/api/profile` endpoint so the site and the assistant never disagree.
 */
export const profile = {
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

export type Profile = typeof profile
