import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, adminApi } from '../../lib/api'
import type { ProjectInput } from '../../lib/api'
import type { Language, Project } from '../../lib/types'
import { useToast } from '../../contexts/ToastContext'
import LocalizedInput from './LocalizedInput'
import { IconClose, IconEdit, IconPlus, IconTrash } from '../../components/Icons'

const emptyLocalized = (): Record<Language, string> => ({ uz: '', en: '', ru: '' })

const emptyProject = (): ProjectInput => ({
  slug: '',
  title: emptyLocalized(),
  summary: emptyLocalized(),
  description: emptyLocalized(),
  tags: [],
  coverUrl: '',
  liveUrl: '',
  githubUrl: '',
  year: String(new Date().getFullYear()),
  featured: false,
  published: true,
  sortOrder: 0,
})

/** Turns a title into a URL-safe slug the API will accept. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export default function ProjectsAdmin() {
  const { push } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: number | null; data: ProjectInput } | null>(null)
  const [saving, setSaving] = useState(false)
  const [tagText, setTagText] = useState('')

  const load = () => {
    setLoading(true)
    adminApi
      .projects()
      .then(setProjects)
      .catch((error) => push({ tone: 'error', title: (error as ApiError).message }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing({ id: null, data: emptyProject() })
    setTagText('')
  }

  const openEdit = (project: Project) => {
    setEditing({
      id: project.id,
      data: {
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        description: project.description,
        tags: project.tags,
        coverUrl: project.coverUrl ?? '',
        liveUrl: project.liveUrl ?? '',
        githubUrl: project.githubUrl ?? '',
        year: project.year ?? '',
        featured: project.featured,
        published: project.published,
        sortOrder: project.sortOrder,
      },
    })
    setTagText(project.tags.join(', '))
  }

  const patch = (changes: Partial<ProjectInput>) => {
    setEditing((current) => (current ? { ...current, data: { ...current.data, ...changes } } : current))
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!editing || saving) return

    const tags = tagText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 12)

    const payload: ProjectInput = {
      ...editing.data,
      slug: editing.data.slug.trim() || slugify(editing.data.title.uz || editing.data.title.en),
      tags,
    }

    if (!payload.slug) {
      push({ tone: 'error', title: 'Slug bo\'sh', description: 'Avval sarlavhani to\'ldiring.' })
      return
    }

    setSaving(true)
    try {
      if (editing.id === null) {
        await adminApi.createProject(payload)
        push({ tone: 'success', title: "Loyiha qo'shildi" })
      } else {
        await adminApi.updateProject(editing.id, payload)
        push({ tone: 'success', title: 'Loyiha yangilandi' })
      }
      setEditing(null)
      load()
    } catch (error) {
      push({ tone: 'error', title: 'Saqlanmadi', description: (error as ApiError).message })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (project: Project) => {
    if (!window.confirm(`"${project.title.uz || project.slug}" loyihasi o'chirilsinmi?`)) return

    try {
      await adminApi.deleteProject(project.id)
      push({ tone: 'success', title: "Loyiha o'chirildi" })
      load()
    } catch (error) {
      push({ tone: 'error', title: (error as ApiError).message })
    }
  }

  return (
    <>
      <header className="admin__header">
        <div>
          <h1 className="admin__title">Loyihalar</h1>
          <p className="admin__subtitle">{projects.length} ta loyiha</p>
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
          <IconPlus size={16} />
          Yangi loyiha
        </button>
      </header>

      <section className="panel">
        {loading ? (
          <p className="admin-empty">Yuklanmoqda...</p>
        ) : projects.length === 0 ? (
          <p className="admin-empty">Hali loyiha qo'shilmagan.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Loyiha</th>
                  <th>Teglar</th>
                  <th>Yil</th>
                  <th>Holat</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div className="table__primary">{project.title.uz || project.slug}</div>
                      <div className="table__muted">/{project.slug}</div>
                    </td>
                    <td>
                      <div className="table__tags">
                        {project.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="chip">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table__muted">{project.year || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span className={`badge ${project.published ? 'badge--on' : 'badge--off'}`}>
                          {project.published ? 'Nashr' : 'Yashirin'}
                        </span>
                        {project.featured && <span className="badge badge--accent">Tanlangan</span>}
                      </div>
                    </td>
                    <td>
                      <div className="table__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => openEdit(project)}
                          aria-label="Tahrirlash"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => remove(project)}
                          aria-label="O'chirish"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null)
          }}
        >
          <div className="admin-dialog" role="dialog" aria-modal="true">
            <div className="admin-dialog__head">
              <h2 className="admin-dialog__title">
                {editing.id === null ? 'Yangi loyiha' : 'Loyihani tahrirlash'}
              </h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditing(null)}
                aria-label="Yopish"
              >
                <IconClose size={18} />
              </button>
            </div>

            <form className="admin-form" onSubmit={save}>
              <LocalizedInput
                label="Sarlavha"
                value={editing.data.title}
                onChange={(title) => patch({ title })}
              />

              <LocalizedInput
                label="Qisqa tavsif"
                value={editing.data.summary}
                onChange={(summary) => patch({ summary })}
                multiline
                rows={2}
              />

              <LocalizedInput
                label="To'liq tavsif"
                value={editing.data.description}
                onChange={(description) => patch({ description })}
                multiline
                rows={5}
              />

              <div className="admin-form__row">
                <div className="field" style={{ margin: 0 }}>
                  <label className="field__label" htmlFor="project-slug">
                    Slug
                  </label>
                  <input
                    id="project-slug"
                    className="field__input"
                    type="text"
                    value={editing.data.slug}
                    onChange={(event) => patch({ slug: slugify(event.target.value) })}
                    placeholder={slugify(editing.data.title.uz) || 'loyiha-nomi'}
                  />
                </div>

                <div className="field" style={{ margin: 0 }}>
                  <label className="field__label" htmlFor="project-year">
                    Yil
                  </label>
                  <input
                    id="project-year"
                    className="field__input"
                    type="text"
                    value={editing.data.year}
                    onChange={(event) => patch({ year: event.target.value })}
                  />
                </div>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="project-tags">
                  Teglar
                  <span className="field__optional">vergul bilan ajrating</span>
                </label>
                <input
                  id="project-tags"
                  className="field__input"
                  type="text"
                  value={tagText}
                  onChange={(event) => setTagText(event.target.value)}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div className="admin-form__row">
                <div className="field" style={{ margin: 0 }}>
                  <label className="field__label" htmlFor="project-live">
                    Demo havolasi
                  </label>
                  <input
                    id="project-live"
                    className="field__input"
                    type="url"
                    value={editing.data.liveUrl}
                    onChange={(event) => patch({ liveUrl: event.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="field" style={{ margin: 0 }}>
                  <label className="field__label" htmlFor="project-github">
                    GitHub havolasi
                  </label>
                  <input
                    id="project-github"
                    className="field__input"
                    type="url"
                    value={editing.data.githubUrl}
                    onChange={(event) => patch({ githubUrl: event.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="admin-form__row">
                <div className="field" style={{ margin: 0 }}>
                  <label className="field__label" htmlFor="project-order">
                    Tartib raqami
                    <span className="field__optional">kichik raqam yuqorida</span>
                  </label>
                  <input
                    id="project-order"
                    className="field__input"
                    type="number"
                    min={0}
                    value={editing.data.sortOrder}
                    onChange={(event) => patch({ sortOrder: Number(event.target.value) || 0 })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                  <label className="admin-form__check">
                    <input
                      type="checkbox"
                      checked={editing.data.featured}
                      onChange={(event) => patch({ featured: event.target.checked })}
                    />
                    Tanlangan loyiha
                  </label>
                  <label className="admin-form__check">
                    <input
                      type="checkbox"
                      checked={editing.data.published}
                      onChange={(event) => patch({ published: event.target.checked })}
                    />
                    Saytda ko'rsatilsin
                  </label>
                </div>
              </div>

              <div className="admin-form__actions">
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
