import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, adminApi } from '../../lib/api'
import type { SkillInput } from '../../lib/api'
import type { Skill } from '../../lib/types'
import { useToast } from '../../contexts/ToastContext'
import { IconClose, IconEdit, IconPlus, IconTrash } from '../../components/Icons'

const CATEGORIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'ai', label: 'AI' },
  { value: 'tools', label: 'Vositalar' },
  { value: 'other', label: 'Boshqa' },
]

const emptySkill = (sortOrder: number): SkillInput => ({
  name: '',
  category: 'frontend',
  level: 75,
  sortOrder,
})

export default function SkillsAdmin() {
  const { push } = useToast()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: number | null; data: SkillInput } | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi
      .skills()
      .then(setSkills)
      .catch((error) => push({ tone: 'error', title: (error as ApiError).message }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const patch = (changes: Partial<SkillInput>) => {
    setEditing((current) =>
      current ? { ...current, data: { ...current.data, ...changes } } : current,
    )
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!editing || saving) return

    if (!editing.data.name.trim()) {
      push({ tone: 'error', title: 'Nomi kiritilmagan' })
      return
    }

    setSaving(true)
    try {
      if (editing.id === null) {
        await adminApi.createSkill(editing.data)
        push({ tone: 'success', title: "Ko'nikma qo'shildi" })
      } else {
        await adminApi.updateSkill(editing.id, editing.data)
        push({ tone: 'success', title: "Ko'nikma yangilandi" })
      }
      setEditing(null)
      load()
    } catch (error) {
      push({ tone: 'error', title: 'Saqlanmadi', description: (error as ApiError).message })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (skill: Skill) => {
    if (!window.confirm(`"${skill.name}" o'chirilsinmi?`)) return

    try {
      await adminApi.deleteSkill(skill.id)
      push({ tone: 'success', title: "Ko'nikma o'chirildi" })
      load()
    } catch (error) {
      push({ tone: 'error', title: (error as ApiError).message })
    }
  }

  return (
    <>
      <header className="admin__header">
        <div>
          <h1 className="admin__title">Ko'nikmalar</h1>
          <p className="admin__subtitle">{skills.length} ta ko'nikma</p>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setEditing({ id: null, data: emptySkill(skills.length) })}
        >
          <IconPlus size={16} />
          Yangi ko'nikma
        </button>
      </header>

      <section className="panel">
        {loading ? (
          <p className="admin-empty">Yuklanmoqda...</p>
        ) : skills.length === 0 ? (
          <p className="admin-empty">Hali ko'nikma qo'shilmagan.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th>Kategoriya</th>
                  <th style={{ width: '32%' }}>Daraja</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id}>
                    <td className="table__primary">{skill.name}</td>
                    <td>
                      <span className="badge badge--off">
                        {CATEGORIES.find((item) => item.value === skill.category)?.label ??
                          skill.category}
                      </span>
                    </td>
                    <td>
                      <div className="bar-row">
                        <div className="bar-row__head">
                          <span className="bar-row__value">{skill.level}%</span>
                        </div>
                        <div className="bar-row__track">
                          <div className="bar-row__fill" style={{ width: `${skill.level}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() =>
                            setEditing({
                              id: skill.id,
                              data: {
                                name: skill.name,
                                category: skill.category,
                                level: skill.level,
                                sortOrder: skill.sortOrder,
                              },
                            })
                          }
                          aria-label="Tahrirlash"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => remove(skill)}
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
          <div className="admin-dialog" style={{ maxWidth: 460 }} role="dialog" aria-modal="true">
            <div className="admin-dialog__head">
              <h2 className="admin-dialog__title">
                {editing.id === null ? "Yangi ko'nikma" : "Ko'nikmani tahrirlash"}
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
              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="skill-name">
                  Nomi
                </label>
                <input
                  id="skill-name"
                  className="field__input"
                  type="text"
                  value={editing.data.name}
                  onChange={(event) => patch({ name: event.target.value })}
                  placeholder="React"
                  autoFocus
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="skill-category">
                  Kategoriya
                </label>
                <select
                  id="skill-category"
                  className="field__input"
                  value={editing.data.category}
                  onChange={(event) => patch({ category: event.target.value })}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="skill-level">
                  Daraja
                  <span className="field__optional">{editing.data.level}%</span>
                </label>
                <input
                  id="skill-level"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={editing.data.level}
                  onChange={(event) => patch({ level: Number(event.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="skill-order">
                  Tartib raqami
                </label>
                <input
                  id="skill-order"
                  className="field__input"
                  type="number"
                  min={0}
                  value={editing.data.sortOrder}
                  onChange={(event) => patch({ sortOrder: Number(event.target.value) || 0 })}
                />
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
