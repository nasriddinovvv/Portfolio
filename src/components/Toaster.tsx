import { useToast } from '../contexts/ToastContext'
import { IconAlert, IconCheck, IconClose, IconInfo } from './Icons'

const icons = {
  success: IconCheck,
  error: IconAlert,
  info: IconInfo,
}

/** Renders the toast queue. Mounted once, near the root. */
export default function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toaster" role="region" aria-live="polite" aria-label="Bildirishnomalar">
      {toasts.map((toast) => {
        const Glyph = icons[toast.tone]

        return (
          <div key={toast.id} className={`toast toast--${toast.tone}`} role="status">
            <Glyph className="toast__icon" size={18} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="toast__title">{toast.title}</p>
              {toast.description && <p className="toast__description">{toast.description}</p>}
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismiss(toast.id)}
              aria-label="Yopish"
            >
              <IconClose size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
