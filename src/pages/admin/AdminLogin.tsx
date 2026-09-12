import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, adminApi, getToken, setToken } from '../../lib/api'
import { IconLock } from '../../components/Icons'
import '../../styles/admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // A still-valid token means there is nothing to log into.
  useEffect(() => {
    if (!getToken()) return
    adminApi
      .me()
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => setToken(null))
  }, [navigate])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setError('')

    try {
      const result = await adminApi.login(username.trim(), password)
      setToken(result.token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <span className="login__icon">
          <IconLock size={22} />
        </span>

        <h1 className="login__title">Admin panel</h1>
        <p className="login__subtitle">Davom etish uchun tizimga kiring.</p>

        {error && <p className="login__error">{error}</p>}

        <form onSubmit={onSubmit} className="admin-form">
          <div className="field" style={{ margin: 0 }}>
            <label className="field__label" htmlFor="login-username">
              Login
            </label>
            <input
              id="login-username"
              className="field__input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="field__label" htmlFor="login-password">
              Parol
            </label>
            <input
              id="login-password"
              className="field__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Tekshirilmoqda...' : 'Kirish'}
          </button>
        </form>

        <p className="login__hint">
          Boshlang'ich ma'lumotlar: <code>admin</code> / <code>admin12345</code>
          <br />
          Kirgandan keyin parolni Sozlamalar bo'limida o'zgartiring.
        </p>

        <Link to="/" className="login__back">
          ← Saytga qaytish
        </Link>
      </div>
    </div>
  )
}
