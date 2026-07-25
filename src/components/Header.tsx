import { useEffect, useState } from 'react'
import { navLinks, profile } from '../data/portfolio'
import { useScrollSpy } from '../hooks/useScroll'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const activeId = useScrollSpy(navLinks.map((link) => link.href))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="container header__inner">
          <a href="#home" className="header__logo" onClick={closeMenu}>
            <span className="header__avatar">{profile.initials}</span>
            <span className="header__logo-text">{profile.name}</span>
          </a>

          <nav
            id="site-nav"
            className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}
            aria-label="Asosiy navigatsiya"
          >
            <ul className="header__links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={activeId === link.href ? 'is-active' : ''}
                    onClick={closeMenu}
                    aria-current={activeId === link.href ? 'page' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href="#contact" className="btn btn--primary header__cta-mobile" onClick={closeMenu}>
              Bog'lanish
            </a>
          </nav>

          <a href="#contact" className="btn btn--primary header__cta">
            Bog'lanish
          </a>

          <button
            type="button"
            className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
            aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <button
        type="button"
        className={`header__overlay ${menuOpen ? 'header__overlay--visible' : ''}`}
        aria-label="Menyuni yopish"
        onClick={closeMenu}
      />
    </>
  )
}
