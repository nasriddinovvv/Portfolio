import { useEffect, useState } from 'react'
import profilePhoto from '../../assets/profile.jpg'
import { useContent } from '../../contexts/ContentContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { prefersReducedMotion, useCountUp } from '../../hooks/useReveal'
import { highlightStats } from '../../data/portfolio'
import { IconArrowRight, IconMail } from '../Icons'

/** Types the role list out one character at a time, then swaps to the next. */
function useTypedRole(roles: string[]): string {
  const [text, setText] = useState(roles[0] ?? '')

  useEffect(() => {
    if (roles.length === 0) return

    // Reduced motion gets the first role, statically.
    if (prefersReducedMotion()) {
      setText(roles[0])
      return
    }

    let roleIndex = 0
    let charIndex = 0
    let deleting = false
    let timer = 0

    const tick = () => {
      const role = roles[roleIndex]
      charIndex += deleting ? -1 : 1
      setText(role.slice(0, charIndex))

      let delay = deleting ? 45 : 85

      if (!deleting && charIndex === role.length) {
        delay = 2000
        deleting = true
      } else if (deleting && charIndex === 0) {
        deleting = false
        roleIndex = (roleIndex + 1) % roles.length
        delay = 400
      }

      timer = window.setTimeout(tick, delay)
    }

    timer = window.setTimeout(tick, 700)
    return () => window.clearTimeout(timer)
  }, [roles])

  return text
}

function Stat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const { ref, value: shown } = useCountUp(value)

  return (
    <div>
      <span className="hero__stat-value" ref={ref}>
        {shown}
        {suffix}
      </span>
      <span className="hero__stat-label">{label}</span>
    </div>
  )
}

export default function Hero() {
  const { t, tList } = useLanguage()
  const { profile, skills } = useContent()
  const roles = tList('hero.roles')
  const typed = useTypedRole(roles)

  return (
    <section id="home" className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <div
            className={`status-pill ${profile.available ? '' : 'status-pill--busy'}`}
            style={{ marginBottom: 26 }}
          >
            <span className="status-pill__dot" />
            {profile.available ? t('hero.available') : t('hero.busy')}
          </div>

          <span className="hero__greeting">{t('hero.greeting')}</span>
          <h1 className="hero__name">
            <span className="gradient-text">{profile.fullName}</span>
          </h1>

          <p className="hero__role" aria-live="polite">
            <span>{typed}</span>
            <span className="hero__role-caret" aria-hidden="true" />
          </p>

          <p className="hero__tagline">{t('hero.tagline')}</p>

          <div className="hero__actions">
            <a href="#projects" className="btn btn--primary btn--lg">
              {t('hero.cta.projects')}
              <IconArrowRight size={17} />
            </a>
            <a href="#contact" className="btn btn--ghost btn--lg">
              <IconMail size={17} />
              {t('hero.cta.contact')}
            </a>
          </div>

          <div className="hero__stats">
            <Stat
              value={profile.experienceYears}
              suffix="+"
              label={t('hero.stat.experience')}
            />
            <Stat value={highlightStats.projects} suffix="+" label={t('hero.stat.projects')} />
            <Stat value={skills.length} suffix="+" label={t('hero.stat.tech')} />
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__ring" />
          <div className="hero__ring hero__ring--2" />
          <div className="hero__ring hero__ring--3" />
          <div className="hero__avatar">
            <img src={profilePhoto} alt={profile.fullName} />
          </div>

          <span className="hero__badge hero__badge--1">⚛ React</span>
          <span className="hero__badge hero__badge--2">TS TypeScript</span>
          <span className="hero__badge hero__badge--3">✦ Claude API</span>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>{t('hero.scroll')}</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
