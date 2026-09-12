import { useContent } from '../../contexts/ContentContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { highlightStats } from '../../data/portfolio'
import Reveal from '../Reveal'
import { IconArrowRight, IconMapPin, IconSparkles } from '../Icons'

export default function About() {
  const { t } = useLanguage()
  const { profile, projects } = useContent()

  const stats = [
    { value: `${profile.experienceYears}+`, label: t('about.stat.experience') },
    { value: `${Math.max(projects.length, highlightStats.projects)}+`, label: t('about.stat.projects') },
    { value: `${highlightStats.clients}+`, label: t('about.stat.clients') },
    { value: `${highlightStats.commits}+`, label: t('about.stat.commits') },
  ]

  return (
    <section id="about" className="section">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__label">{t('about.label')}</span>
          <h2 className="section__title">{t('about.title')}</h2>
        </Reveal>

        <div className="bento">
          <Reveal className="card card--spotlight bento__cell bento__cell--lead">
            <p className="bento__lead">{t('about.lead')}</p>
            <p className="bento__body">{t('about.body')}</p>
          </Reveal>

          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 70}
              className="card bento__cell bento__cell--stat"
            >
              <span className="bento__stat-value">{stat.value}</span>
              <span className="bento__stat-label">{stat.label}</span>
            </Reveal>
          ))}

          <Reveal delay={60} className="card card--spotlight bento__cell bento__cell--wide">
            <h3 className="bento__cell-title">
              <IconSparkles size={17} />
              {t('about.focus.title')}
            </h3>
            <p className="bento__cell-text">{t('about.focus.body')}</p>
          </Reveal>

          <Reveal delay={120} className="card bento__cell">
            <h3 className="bento__cell-title">
              <IconMapPin size={17} />
              {t('about.location')}
            </h3>
            <p className="bento__cell-text">{profile.location}</p>
          </Reveal>

          <Reveal delay={180} className="card card--spotlight bento__cell">
            <h3 className="bento__cell-title">{t('about.cta')}</h3>
            <a href="#contact" className="project__more" style={{ marginTop: 8 }}>
              {t('nav.cta')}
              <IconArrowRight size={15} />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
