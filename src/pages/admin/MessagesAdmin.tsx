import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ApiError, adminApi } from '../../lib/api'
import type { ContactMessage } from '../../lib/types'
import { useToast } from '../../contexts/ToastContext'
import type { AdminOutletContext } from './AdminLayout'
import { IconCheck, IconInbox, IconMail, IconTrash } from '../../components/Icons'

const formatDate = (value: string) => {
  // SQLite stores "YYYY-MM-DD HH:MM:SS" in UTC; make it an ISO instant first.
  const date = new Date(value.replace(' ', 'T') + 'Z')
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessagesAdmin() {
  const { push } = useToast()
  const { refreshUnread } = useOutletContext<AdminOutletContext>()

  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [archived, setArchived] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    (showArchived: boolean) => {
      setLoading(true)
      adminApi
        .messages(showArchived)
        .then(setMessages)
        .catch((error) => push({ tone: 'error', title: (error as ApiError).message }))
        .finally(() => setLoading(false))
    },
    [push],
  )

  useEffect(() => load(archived), [archived, load])

  const patch = async (message: ContactMessage, changes: { isRead?: boolean; isArchived?: boolean }) => {
    try {
      const updated = await adminApi.updateMessage(message.id, changes)

      // An archived message leaves the current list; anything else updates in place.
      if (changes.isArchived !== undefined && changes.isArchived !== archived) {
        setMessages((current) => current.filter((item) => item.id !== message.id))
      } else {
        setMessages((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        )
      }
      refreshUnread()
    } catch (error) {
      push({ tone: 'error', title: (error as ApiError).message })
    }
  }

  const remove = async (message: ContactMessage) => {
    if (!window.confirm(`${message.name} yuborgan xabar butunlay o'chirilsinmi?`)) return

    try {
      await adminApi.deleteMessage(message.id)
      setMessages((current) => current.filter((item) => item.id !== message.id))
      refreshUnread()
      push({ tone: 'success', title: "Xabar o'chirildi" })
    } catch (error) {
      push({ tone: 'error', title: (error as ApiError).message })
    }
  }

  const unreadCount = messages.filter((message) => !message.isRead).length

  return (
    <>
      <header className="admin__header">
        <div>
          <h1 className="admin__title">Xabarlar</h1>
          <p className="admin__subtitle">
            {messages.length} ta xabar
            {!archived && unreadCount > 0 && ` · ${unreadCount} ta o'qilmagan`}
          </p>
        </div>

        <div className="filters" style={{ margin: 0 }}>
          <button
            type="button"
            className={`filter ${!archived ? 'filter--active' : ''}`}
            onClick={() => setArchived(false)}
          >
            Kiruvchi
          </button>
          <button
            type="button"
            className={`filter ${archived ? 'filter--active' : ''}`}
            onClick={() => setArchived(true)}
          >
            Arxiv
          </button>
        </div>
      </header>

      <section className="panel">
        {loading ? (
          <p className="admin-empty">Yuklanmoqda...</p>
        ) : messages.length === 0 ? (
          <div className="admin-empty">
            <IconInbox size={30} style={{ margin: '0 auto 10px' }} />
            {archived ? 'Arxiv bo\'sh.' : 'Hali xabar kelmagan.'}
          </div>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`message-item ${!message.isRead ? 'message-item--unread' : ''}`}
            >
              <div className="message-item__head">
                <span className="message-item__name">{message.name}</span>
                <a href={`mailto:${message.email}`} className="message-item__email">
                  {message.email}
                </a>
                <span className="message-item__date">{formatDate(message.createdAt)}</span>
              </div>

              {message.subject && <p className="message-item__subject">{message.subject}</p>}

              <p className="message-item__body">{message.body}</p>

              <div className="message-item__actions">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(
                    `Re: ${message.subject || 'Portfolio'}`,
                  )}`}
                  className="btn btn--ghost btn--sm"
                >
                  <IconMail size={14} />
                  Javob berish
                </a>

                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => patch(message, { isRead: !message.isRead })}
                >
                  <IconCheck size={14} />
                  {message.isRead ? "O'qilmagan deb belgilash" : "O'qildi"}
                </button>

                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => patch(message, { isArchived: !message.isArchived })}
                >
                  <IconInbox size={14} />
                  {message.isArchived ? 'Arxivdan chiqarish' : 'Arxivlash'}
                </button>

                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => remove(message)}
                  aria-label="O'chirish"
                >
                  <IconTrash size={15} />
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  )
}
