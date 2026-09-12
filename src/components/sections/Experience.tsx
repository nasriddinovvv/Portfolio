import { useContent } from '../../contexts/ContentContext'
import { useLanguage } from '../../contexts/LanguageContext'
import Reveal from '../Reveal'

export default function Experience() {
  const { t, pick } = useLanguage()
  const { experiences } = useContent()

  if (experiences.length === 0) return null

  return (
    <section id="experience" className="section">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__label">{t('experience.label')}</span>
          <h2 className="section__title">{t('experience.title')}</h2>
          <p className="section__subtitle">{t('experience.subtitle')}</p>
        </Reveal>

        <ol className="timeline">
          {experiences.map((item, index) => (
            <Reveal key={item.id} as="li" delay={index * 90} className="timeline__item">
              <span className="timeline__dot" aria-hidden="true" />
              <span className="timeline__period">{item.period}</span>
              <h3 className="timeline__role">{pick(item.role)}</h3>
              <span className="timeline__company">{item.company}</span>
              <p className="timeline__text">{pick(item.description)}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
