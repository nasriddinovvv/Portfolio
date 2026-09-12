import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useContent } from '../../contexts/ContentContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useReveal } from '../../hooks/useReveal'
import type { Skill } from '../../lib/types'
import Reveal from '../Reveal'

const CATEGORIES = ['all', 'frontend', 'backend', 'ai', 'tools'] as const

function SkillCard({ skill, delay }: { skill: Skill; delay: number }) {
  const { ref, revealed } = useReveal<HTMLDivElement>(0.3)

  return (
    <div
      ref={ref}
      className={`card skill ${revealed ? 'skill--revealed' : ''}`}
      style={{ '--level': skill.level / 100, transitionDelay: `${delay}ms` } as CSSProperties}
    >
      <div className="skill__head">
        <span className="skill__name">{skill.name}</span>
        <span className="skill__level">{skill.level}%</span>
      </div>
      <div
        className="skill__track"
        role="meter"
        aria-label={skill.name}
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="skill__fill" />
      </div>
    </div>
  )
}

export default function Skills() {
  const { t } = useLanguage()
  const { skills } = useContent()
  const [category, setCategory] = useState<string>('all')

  // Only offer a tab when at least one skill actually sits in that category.
  const available = useMemo(() => {
    const present = new Set(skills.map((skill) => skill.category))
    return CATEGORIES.filter((item) => item === 'all' || present.has(item))
  }, [skills])

  const visible = useMemo(
    () => (category === 'all' ? skills : skills.filter((skill) => skill.category === category)),
    [skills, category],
  )

  // Duplicated once so the marquee can loop seamlessly at -50%.
  const marqueeItems = [...skills, ...skills]

  return (
    <section id="skills" className="section">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__label">{t('skills.label')}</span>
          <h2 className="section__title">{t('skills.title')}</h2>
          <p className="section__subtitle">{t('skills.subtitle')}</p>
        </Reveal>

        <Reveal className="filters">
          {available.map((item) => (
            <button
              key={item}
              type="button"
              className={`filter ${category === item ? 'filter--active' : ''}`}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {t(`skills.cat.${item}`)}
            </button>
          ))}
        </Reveal>

        <div className="skills__grid">
          {visible.map((skill, index) => (
            <SkillCard key={skill.id} skill={skill} delay={Math.min(index, 8) * 50} />
          ))}
        </div>

        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {marqueeItems.map((skill, index) => (
              <span key={`${skill.id}-${index}`} className="marquee__item">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
