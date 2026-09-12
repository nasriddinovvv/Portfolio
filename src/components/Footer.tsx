import { useContent } from '../contexts/ContentContext'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../lib/api'
import { navLinks } from '../data/portfolio'
import { IconArrowUp, IconGithub, IconLinkedin, IconMail, IconTelegram } from './Icons'

export default function Footer() {
  const { t } = useLanguage()
  const { profile } = useContent()

  const socials = [
    { href: profile.github, label: 'GitHub', Icon: IconGithub },
    { href: profile.linkedin, label: 'LinkedIn', Icon: IconLinkedin },
    { href: profile.telegram, label: 'Telegram', Icon: IconTelegram },
    { href: `mailto:${profile.email}`, label: 'Email', Icon: IconMail },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <a href="#home" className="brand">
              <span className="brand__mark">{profile.initials}</span>
              <span className="brand__name">
                {profile.fullName}
                <span className="brand__dot">.</span>
              </span>
            </a>
            <p className="footer__tagline">{t('footer.tagline')}</p>
          </div>

          <div>
            <h3 className="footer__col-title">{t('footer.nav')}</h3>
            <ul className="footer__links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer__link">
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer__col-title">{t('footer.social')}</h3>
            <ul className="footer__links">
              {socials.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="footer__link"
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    onClick={() => api.track('social_click', { refId: label })}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} {profile.fullName}. {t('footer.rights')}
          </p>

          <div className="footer__socials">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                className="icon-btn"
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                onClick={() => api.track('social_click', { refId: label })}
              >
                <Icon size={17} />
              </a>
            ))}
            <a href="#home" className="icon-btn" aria-label={t('footer.top')}>
              <IconArrowUp size={17} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
