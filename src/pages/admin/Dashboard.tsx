import { useEffect, useState } from 'react'
import { ApiError, adminApi } from '../../lib/api'
import type { Stats } from '../../lib/types'
import { IconChat, IconEye, IconInbox, IconUsers } from '../../components/Icons'

const RANGES = [7, 30, 90]

function BarList({
  title,
  rows,
  empty,
}: {
  title: string
  rows: { label: string; value: number }[]
  empty: string
}) {
  const max = Math.max(1, ...rows.map((row) => row.value))

  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="admin-empty">{empty}</p>
      ) : (
        <div className="bar-list">
          {rows.map((row) => (
            <div key={row.label} className="bar-row">
              <div className="bar-row__head">
                <span className="bar-row__label">{row.label}</span>
                <span className="bar-row__value">{row.value}</span>
              </div>
              <div className="bar-row__track">
                <div
                  className="bar-row__fill"
                  style={{ width: `${Math.round((row.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [days, setDays] = useState(30)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')

    adminApi
      .stats(days)
      .then((result) => !cancelled && setStats(result))
      .catch((err) => !cancelled && setError((err as ApiError).message))

    return () => {
      cancelled = true
    }
  }, [days])

  if (error) {
    return (
      <div className="panel">
        <p className="admin-empty">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="admin-loading">
        <div>
          <div className="spinner" style={{ marginInline: 'auto' }} />
          Yuklanmoqda...
        </div>
      </div>
    )
  }

  const kpis = [
    { Icon: IconEye, value: stats.totals.views, label: `Jami ko'rishlar (bugun: ${stats.today.views})` },
    { Icon: IconUsers, value: stats.totals.visitors, label: `Tashrifchilar (bugun: ${stats.today.visitors})` },
    { Icon: IconInbox, value: stats.totals.messages, label: `Xabarlar (o'qilmagan: ${stats.totals.unreadMessages})` },
    { Icon: IconChat, value: stats.totals.chats, label: 'Chat suhbatlari' },
  ]

  const maxDaily = Math.max(1, ...stats.daily.map((day) => day.views))

  return (
    <>
      <header className="admin__header">
        <div>
          <h1 className="admin__title">Dashboard</h1>
          <p className="admin__subtitle">Sayt statistikasi va faollik</p>
        </div>

        <div className="filters" style={{ margin: 0 }}>
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              className={`filter ${days === range ? 'filter--active' : ''}`}
              onClick={() => setDays(range)}
            >
              {range} kun
            </button>
          ))}
        </div>
      </header>

      <div className="kpi-grid">
        {kpis.map(({ Icon, value, label }) => (
          <div key={label} className="kpi">
            <span className="kpi__icon">
              <Icon size={20} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p className="kpi__value">{value}</p>
              <p className="kpi__label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Kunlik ko'rishlar — oxirgi {days} kun</h2>
          <span className="table__muted">{stats.daily.length} kun ma'lumoti</span>
        </div>
        {stats.daily.length === 0 ? (
          <p className="admin-empty">Hozircha ma'lumot yo'q. Saytga tashrif buyuring.</p>
        ) : (
          <div className="chart">
            {stats.daily.map((day) => (
              <div
                key={day.date}
                className="chart__bar"
                style={{ height: `${Math.round((day.views / maxDaily) * 100)}%` }}
                title={`${day.date}: ${day.views} ko'rish, ${day.visitors} tashrifchi`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="panel-grid" style={{ marginTop: 16 }}>
        <BarList
          title="Eng ko'p ochilgan loyihalar"
          rows={stats.topProjects.map((row) => ({ label: row.title, value: row.clicks }))}
          empty="Hali hech kim loyihani ochmagan."
        />
        <BarList
          title="Hodisalar turi bo'yicha"
          rows={stats.byType.map((row) => ({ label: row.type, value: row.count }))}
          empty="Hodisalar qayd etilmagan."
        />
        <BarList
          title="Tillar bo'yicha"
          rows={stats.byLang.map((row) => ({ label: row.lang, value: row.count }))}
          empty="Til ma'lumoti yo'q."
        />
        <BarList
          title="Qayerdan kelishgan"
          rows={stats.topReferrers.map((row) => ({ label: row.referrer, value: row.count }))}
          empty="To'g'ridan-to'g'ri tashriflar."
        />
      </div>
    </>
  )
}
