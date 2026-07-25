import { profile } from '../data/portfolio'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copy">
          © {year} {profile.fullName}. Barcha huquqlar himoyalangan.
        </p>

        <div className="footer__links">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            LinkedIn
          </a>
          <a href={profile.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            Telegram
          </a>
        </div>
      </div>
    </footer>
  )
}
