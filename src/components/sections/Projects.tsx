import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { useContent } from '../../contexts/ContentContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { api } from '../../lib/api'
import type { Project } from '../../lib/types'
import Reveal from '../Reveal'
import ProjectModal from '../ProjectModal'
import { IconArrowRight, IconExternal, IconGithub, IconLayers } from '../Icons'

/** Feeds the cursor position to the card's spotlight gradient. */
function trackSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
}

export default function Projects() {
  const { t, pick } = useLanguage()
  const { projects } = useContent()
  const [tag, setTag] = useState('all')
  const [selected, setSelected] = useState<Project | null>(null)

  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      for (const item of project.tags) counts.set(item, (counts.get(item) ?? 0) + 1)
    }
    // Most-used tags first, capped so the filter row stays readable.
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name]) => name)
  }, [projects])

  const visible = useMemo(
    () => (tag === 'all' ? projects : projects.filter((project) => project.tags.includes(tag))),
    [projects, tag],
  )

  const open = (project: Project) => {
    setSelected(project)
    api.track('project_open', { refId: String(project.id) })
  }

  return (
    <section id="projects" className="section">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__label">{t('projects.label')}</span>
          <h2 className="section__title">{t('projects.title')}</h2>
          <p className="section__subtitle">{t('projects.subtitle')}</p>
        </Reveal>

        {tags.length > 0 && (
          <Reveal className="filters">
            <button
              type="button"
              className={`filter ${tag === 'all' ? 'filter--active' : ''}`}
              onClick={() => setTag('all')}
              aria-pressed={tag === 'all'}
            >
              {t('projects.filter.all')}
            </button>
            {tags.map((item) => (
              <button
                key={item}
                type="button"
                className={`filter ${tag === item ? 'filter--active' : ''}`}
                onClick={() => setTag(item)}
                aria-pressed={tag === item}
              >
                {item}
              </button>
            ))}
          </Reveal>
        )}

        {visible.length === 0 ? (
          <p className="empty-state">{t('projects.empty')}</p>
        ) : (
          <div className="projects__grid">
            {visible.map((project, index) => (
              <Reveal
                key={project.id}
                delay={Math.min(index, 6) * 70}
                // The grid item is this wrapper, so the span lives here.
                className={project.featured ? 'project--featured' : ''}
              >
                <article
                  className="card card--spotlight project"
                  onMouseMove={trackSpotlight}
                  onClick={() => open(project)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      open(project)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${pick(project.title)} — ${t('projects.details')}`}
                >
                  <div className="project__top">
                    <span className="project__icon">
                      <IconLayers size={21} />
                    </span>
                    <div className="project__badges">
                      {project.featured && (
                        <span className="project__badge">{t('projects.featured')}</span>
                      )}
                      {project.year && (
                        <span className="project__badge project__badge--year">{project.year}</span>
                      )}
                    </div>
                  </div>

                  <h3 className="project__title">{pick(project.title)}</h3>
                  <p className="project__summary">{pick(project.summary)}</p>

                  <div className="project__tags">
                    {project.tags.slice(0, 5).map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="project__footer">
                    <span className="project__more">
                      {t('projects.details')}
                      <IconArrowRight size={15} />
                    </span>

                    <div className="project__links">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          className="icon-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${pick(project.title)} — ${t('projects.live')}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            api.track('project_click', { refId: String(project.id) })
                          }}
                        >
                          <IconExternal size={16} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          className="icon-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${pick(project.title)} — ${t('projects.github')}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            api.track('project_click', { refId: String(project.id) })
                          }}
                        >
                          <IconGithub size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
