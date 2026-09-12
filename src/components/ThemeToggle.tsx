import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { IconMoon, IconSun } from './Icons'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useLanguage()

  const next = theme === 'dark' ? t('theme.light') : t('theme.dark')

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={`${t('theme.toggle')} — ${next}`}
      title={next}
    >
      {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  )
}
