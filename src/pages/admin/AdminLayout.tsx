import { useCallback, useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { adminApi, getToken, setToken } from '../../lib/api'
import ThemeToggle from '../../components/ThemeToggle'
import {
  IconBriefcase,
  IconClose,
  IconDashboard,
  IconExternal,
  IconInbox,
  IconLayers,
  IconLock,
  IconLogout,
  IconMenu,
  IconSparkles,
} from '../../components/Icons'
import '../../styles/admin.css'

const NAV = [
  { to: '/admin', label: 'Dashboard', Icon: IconDashboard, end: true },
  { to: '/admin/projects', label: 'Loyihalar', Icon: IconLayers, end: false },
  { to: '/admin/skills', label: "Ko'nikmalar", Icon: IconSparkles, end: false },
  { to: '/admin/experience', label: 'Tajriba', Icon: IconBriefcase, end: false },
  { to: '/admin/messages', label: 'Xabarlar', Icon: IconInbox, end: false },
  { to: '/admin/settings', label: 'Sozlamalar', Icon: IconLock, end: false },
]

/** Shape shared with the nested pages through `Outlet` context. */
export type AdminOutletContext = {
  refreshUnread: () => void
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [checked, setChecked] = useState(false)
  const [admin, setAdmin] = useState<{ id: number; username: string } | null>(null)
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  // Verify the stored token against the server before rendering anything.
  useEffect(() => {
    if (!getToken()) {
      setChecked(true)
      return
    }

    adminApi
      .me()
      .then((result) => setAdmin(result.admin))
      .catch(() => setToken(null))
      .finally(() => setChecked(true))
  }, [])

  const refreshUnread = useCallback(() => {
    if (!getToken()) return
    adminApi
      .stats(1)
      .then((stats) => setUnread(stats.totals.unreadMessages))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (admin) refreshUnread()
  }, [admin, refreshUnread, location.pathname])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const logout = () => {
    setToken(null)
    navigate('/admin/login', { replace: true })
  }

  if (!checked) {
    return (
      <div className="admin-loading">
        <div>
          <div className="spinner" style={{ marginInline: 'auto' }} />
          Tekshirilmoqda...
        </div>
      </div>
    )
  }

  if (!admin) return <Navigate to="/admin/login" replace />

  return (
    <div className="admin">
      {menuOpen && (
        <div className="admin__scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <aside className={`admin__sidebar ${menuOpen ? 'admin__sidebar--open' : ''}`}>
        <div className="admin__brand">
          <span className="brand__mark">A</span>
          <span>
            Admin
            <span className="admin__brand-sub">Portfolio CMS</span>
          </span>
        </div>

        <nav>
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin__nav-link ${isActive ? 'admin__nav-link--active' : ''}`
              }
            >
              <Icon size={17} />
              {label}
              {to === '/admin/messages' && unread > 0 && (
                <span className="admin__nav-badge">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="admin__sidebar-footer">
          <div className="admin__user">
            <span className="admin__user-avatar">
              {admin.username.slice(0, 2).toUpperCase()}
            </span>
            {admin.username}
          </div>

          <a href="/" className="admin__nav-link" target="_blank" rel="noopener noreferrer">
            <IconExternal size={17} />
            Saytni ko'rish
          </a>

          <button type="button" className="admin__nav-link" onClick={logout}>
            <IconLogout size={17} />
            Chiqish
          </button>
        </div>
      </aside>

      <main className="admin__main">
        <div className="admin__mobile-bar">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
          >
            {menuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
          <strong style={{ fontSize: '0.95rem' }}>Admin</strong>
          <div style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
          </div>
        </div>

        <Outlet context={{ refreshUnread } satisfies AdminOutletContext} />
      </main>
    </div>
  )
}
