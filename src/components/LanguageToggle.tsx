import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, useLanguage } from '../contexts/LanguageContext'
import { IconCheck, IconGlobe } from './Icons'

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on an outside click or Escape.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const current = LANGUAGES.find((item) => item.code === language)

  return (
    <div className="lang" ref={containerRef}>
      <button
        type="button"
        className="lang__current"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('lang.toggle')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <IconGlobe size={15} />
        {current?.short}
      </button>

      {open && (
        <div className="lang__menu" role="menu">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              role="menuitem"
              className={`lang__option ${item.code === language ? 'lang__option--active' : ''}`}
              onClick={() => {
                setLanguage(item.code)
                setOpen(false)
              }}
            >
              {item.label}
              {item.code === language && <IconCheck size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
