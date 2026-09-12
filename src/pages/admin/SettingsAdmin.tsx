import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { API_BASE, ApiError, adminApi } from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import { IconCheck, IconClose } from '../../components/Icons'

type Health = { ok: boolean; uptime: number; chatbot: boolean; email: boolean }

export default function SettingsAdmin() {
  const { push } = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [health, setHealth] = useState<Health | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((response) => response.json())
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return

    if (next.length < 8) {
      push({ tone: 'error', title: 'Yangi parol kamida 8 belgidan iborat bo\'lsin' })
      return
    }
    if (next !== confirm) {
      push({ tone: 'error', title: 'Parollar mos kelmadi' })
      return
    }

    setSaving(true)
    try {
      await adminApi.changePassword(current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      push({ tone: 'success', title: "Parol o'zgartirildi" })
    } catch (error) {
      push({ tone: 'error', title: (error as ApiError).message })
    } finally {
      setSaving(false)
    }
  }

  const services = [
    {
      label: 'AI chatbot',
      on: health?.chatbot ?? false,
      hint: 'server/.env → ANTHROPIC_API_KEY',
    },
    {
      label: 'Email bildirishnoma',
      on: health?.email ?? false,
      hint: 'server/.env → SMTP_HOST, SMTP_USER, NOTIFY_EMAIL',
    },
  ]

  return (
    <>
      <header className="admin__header">
        <div>
          <h1 className="admin__title">Sozlamalar</h1>
          <p className="admin__subtitle">Hisob xavfsizligi va server holati</p>
        </div>
      </header>

      <div className="panel-grid">
        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Parolni o'zgartirish</h2>
          </div>
          <div className="panel__body">
            <form className="admin-form" onSubmit={submit}>
              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="pw-current">
                  Joriy parol
                </label>
                <input
                  id="pw-current"
                  className="field__input"
                  type="password"
                  autoComplete="current-password"
                  value={current}
                  onChange={(event) => setCurrent(event.target.value)}
                  required
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="pw-new">
                  Yangi parol
                  <span className="field__optional">kamida 8 belgi</span>
                </label>
                <input
                  id="pw-new"
                  className="field__input"
                  type="password"
                  autoComplete="new-password"
                  value={next}
                  onChange={(event) => setNext(event.target.value)}
                  required
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field__label" htmlFor="pw-confirm">
                  Yangi parolni takrorlang
                </label>
                <input
                  id="pw-confirm"
                  className="field__input"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                />
              </div>

              <div className="admin-form__actions">
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saqlanmoqda...' : "Parolni o'zgartirish"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Server holati</h2>
            {health && (
              <span className="table__muted">
                Ishlash vaqti: {Math.floor(health.uptime / 60)} daq.
              </span>
            )}
          </div>
          <div className="panel__body">
            {!health ? (
              <p className="table__muted">Serverga ulanib bo'lmadi.</p>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {services.map((service) => (
                  <div key={service.label} style={{ display: 'flex', gap: 12 }}>
                    <span
                      className="kpi__icon"
                      style={{
                        width: 34,
                        height: 34,
                        color: service.on ? 'var(--ok)' : 'var(--text-faint)',
                        background: service.on
                          ? 'color-mix(in srgb, var(--ok) 14%, transparent)'
                          : 'var(--surface-strong)',
                      }}
                    >
                      {service.on ? <IconCheck size={17} /> : <IconClose size={17} />}
                    </span>
                    <div>
                      <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                        {service.label}{' '}
                        <span className={`badge ${service.on ? 'badge--on' : 'badge--off'}`}>
                          {service.on ? 'Yoqilgan' : "O'chiq"}
                        </span>
                      </p>
                      <p className="table__muted" style={{ fontFamily: 'var(--mono)' }}>
                        {service.hint}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
