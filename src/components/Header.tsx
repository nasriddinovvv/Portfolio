import { useEffect, useState } from 'react'
import profilePhoto from '../assets/profile.jpg'
import { useLanguage } from '../contexts/LanguageContext'
import { useContent } from '../contexts/ContentContext'
import { useActiveSection, useScrolled } from '../hooks/useScroll'
import { navLinks } from '../data/portfolio'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'
import { IconClose, IconMenu } from './Icons'

const SECTION_IDS = navLinks.map((link) => link.href.slice(1))

export default function Header() {
  const { t } = useLanguage()
  const { profile } = useContent()
  const scrolled = useScrolled(20)
  const active = useActiveSection(SECTION_IDS)
  const [menuOpen, setMenuOpen] = useState(false)

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // A resize past the mobile breakpoint should not leave the drawer stuck open.
  useEffect(() => {
    const media = window.matchMedia('(min-width: 861px)')
    const onChange = () => media.matches && setMenuOpen(false)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="container header__inner">
          <a href="#home" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand__mark">
              <img src={profilePhoto} alt={profile.name} />
            </span>
            <span className="brand__name">
              {profile.name}
              <span className="brand__dot">.</span>
            </span>
          </a>

          <nav className="nav" aria-label={t('nav.aria')}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav__link ${
                  active === link.href.slice(1) ? 'nav__link--active' : ''
                }`}
                aria-current={active === link.href.slice(1) ? 'true' : undefined}
              >
                {t(link.key)}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <LanguageToggle />
            <ThemeToggle />
            <a href="#contact" className="btn btn--primary btn--sm nav-cta">
              {t('nav.cta')}
            </a>
            <button
              type="button"
              className="icon-btn header__burger"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? t('nav.menu.close') : t('nav.menu.open')}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="drawer" id="mobile-menu">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`drawer__link ${
                active === link.href.slice(1) ? 'drawer__link--active' : ''
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {t(link.key)}
            </a>
          ))}
          <a
            href="#contact"
            className="btn btn--primary btn--block drawer__cta"
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.cta')}
          </a>
        </div>
      )}
    </>
  )
}
