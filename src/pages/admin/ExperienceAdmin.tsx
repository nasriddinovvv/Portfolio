import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, adminApi } from '../../lib/api'
import type { ExperienceInput } from '../../lib/api'
import type { Experience, Language } from '../../lib/types'
import { useToast } from '../../contexts/ToastContext'
import LocalizedInput from './LocalizedInput'
import { IconClose, IconEdit, IconPlus, IconTrash } from '../../components/Icons'

const emptyLocalized = (): Record<Language, string> => ({ uz: '', en: '', ru: '' })

const emptyExperience = (sortOrder: number): ExperienceInput => ({
  role: emptyLocalized(),
  company: '',
  period: '',
  description: emptyLocalized(),
  sortOrder,
})

export default function ExperienceAdmin() {
  const { push } = useToast()
  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: number | null; data: ExperienceInput } | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi
      .experiences()
      .then(setItems)
      .catch((error) => push({ tone: 'error', title: (error as ApiError).message }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const patch = (changes: Partial<ExperienceInput>) => {
    setEditing((current) =>
      current ? { ...current, data: { ...current.data, ...changes } } : current,
    )
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!editing || saving) return

    if (!editing.data.company.trim() || !editing.data.period.trim()) {
      push({ tone: 'error', title: 'Kompaniya va davr majburiy' })
      return
    }

    setSaving(true)
    try {
      if (editing.id === null) {
        await adminApi.createExperience(editing.data)
        push({ tone: 'success', title: "Tajriba qo'shildi" })
      } else {
        await adminApi.updateExperience(editing.id, editing.data)
        push({ tone: 'success', title: 'Tajriba yangilandi' })
      }
      setEditing(null)
      load()
    } catch (error) {
      push({ tone: 'error', title: 'Saqlanmadi', description: (error as ApiError).message })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: Experience) => {
    if (!window.confirm(`"${item.company}" yozuvi o'chirilsinmi?`)) return

    try {
      await adminApi.deleteExperience(item.id)
      push({ tone: 'success', title: "Tajriba o'chirildi" })
      load()
    } catch (error) {
      push({ tone: 'error', title: (error as ApiError).message })
    }
  }

  return (
    <>
      <header className="admin__header">
        <div>
          <h1 className="admin__title">Tajriba</h1>
          <p className="admin__subtitle">{items.length} ta yozuv</p>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setEditing({ id: null, data: emptyExperience(items.length) })}
        >
          <IconPlus size={16} />
          Yangi yozuv
        </button>
      </header>

      <section className="panel">
        {loading ? (
          <p className="admin-empty">Yuklanmoqda...</p>
        ) : items.length === 0 ? (
          <p className="admin-empty">Hali tajriba qo'shilmagan.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Lavozim</th>
                  <th>Kompaniya</th>
                  <th>Davr</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table__primary">{item.role.uz || item.role.en}</div>
                      <div className="table__muted">{item.description.uz.slice(0, 60)}</div>
                    </td>
                    <td>{item.company}</td>
                    <td className="table__muted">{item.period}</td>
                    <td>
                      <div className="table__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() =>
                            setEditing({
                              id: item.id,
                              data: {
                                role: item.role,
                                company: item.company,
                                period: item.period,
                                description: item.description,
                                sortOrder: item.sortOrder,
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
                          onClick={() => remove(item)}
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
                {editing.id === null ? 'Yangi tajriba' : 'Tajribani tahrirlash'}
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
                label="Lavozim"
                value={editing.data.role}
                onChange={(role) => patch({ role })}
                placeholder="Frontend Developer"
              />

              <div className="admin-form__row">
                <div className="field" style={{ margin: 0 }}>
                  <label className="field__label" htmlFor="exp-company">
                    Kompaniya
                  </label>
                  <input
                    id="exp-company"
                    className="field__input"
                    type="text"
                    value={editing.data.company}
                    onChange={(event) => patch({ company: event.target.value })}
                    placeholder="Freelance"
                  />
                </div>

                <div className="field" style={{ margin: 0 }}>
                  <label className="field__label" htmlFor="exp-period">
                    Davr
                  </label>
                  <input
                    id="exp-period"
                    className="field__input"
                    type="text"
                    value={editing.data.period}
                    onChange={(event) => patch({ period: event.target.value })}
                    placeholder="2024 — hozir"
                  />
                </div>
              </div>

              <LocalizedInput
                label="Tavsif"
                value={editing.data.description}
                onChange={(description) => patch({ description })}
                multiline
                rows={4}
              />

              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="exp-order">
                  Tartib raqami
                  <span className="field__optional">kichik raqam yuqorida</span>
                </label>
                <input
                  id="exp-order"
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
