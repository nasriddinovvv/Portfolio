import { useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../lib/api'
import type { Project } from '../lib/types'
import { IconClose, IconExternal, IconGithub } from './Icons'

type ProjectModalProps = {
  project: Project
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { t, pick } = useLanguage()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const description = pick(project.description) || pick(project.summary)

  return (
    <div
      className="modal-overlay"
      // Only a click that starts and ends on the backdrop should dismiss.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <button
          ref={closeRef}
          type="button"
          className="icon-btn modal__close"
          onClick={onClose}
          aria-label={t('projects.modal.close')}
        >
          <IconClose size={18} />
        </button>

        {project.year && <span className="modal__year">{project.year}</span>}

        <h2 className="modal__title" id="project-modal-title">
          {pick(project.title)}
        </h2>

        <p className="modal__summary">{pick(project.summary)}</p>

        {description && (
          <>
            <h3 className="modal__section-title">{t('projects.modal.about')}</h3>
            <p className="modal__body">{description}</p>
          </>
        )}

        {project.tags.length > 0 && (
          <>
            <h3 className="modal__section-title">{t('projects.modal.tech')}</h3>
            <div className="modal__tags">
              {project.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="modal__actions">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              className="btn btn--primary"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => api.track('project_click', { refId: String(project.id) })}
            >
              <IconExternal size={16} />
              {t('projects.live')}
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              className="btn btn--ghost"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => api.track('project_click', { refId: String(project.id) })}
            >
              <IconGithub size={16} />
              {t('projects.github')}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
