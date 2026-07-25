import { profile } from '../data/portfolio'

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <div className="contact__card">
          <div className="contact__glow" aria-hidden="true" />

          <div className="section__header section__header--center">
            <span className="section__label">Aloqa</span>
            <h2 className="section__title">Keling, birgalikda ishlaymiz</h2>
            <p className="contact__subtitle">
              Yangi loyiha yoki hamkorlik bo'yicha gaplashish uchun bemalol yozing.
            </p>
          </div>

          <div className="contact__methods">
            <a href={`mailto:${profile.email}`} className="contact__method">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div>
                <span className="contact__method-label">Email</span>
                <span className="contact__method-value">{profile.email}</span>
              </div>
            </a>

            <a href={profile.telegram} target="_blank" rel="noopener noreferrer" className="contact__method">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <div>
                <span className="contact__method-label">Telegram</span>
                <span className="contact__method-value">@nasriddinovv_x</span>
              </div>
            </a>

            <div className="contact__method contact__method--static">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div>
                <span className="contact__method-label">Manzil</span>
                <span className="contact__method-value">{profile.location}</span>
              </div>
            </div>
          </div>

          <a href={`mailto:${profile.email}`} className="btn btn--primary btn--large">
            Xabar yuborish
          </a>
        </div>
      </div>
    </section>
  )
}
