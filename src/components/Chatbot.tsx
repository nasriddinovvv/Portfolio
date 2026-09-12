import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useContent } from '../contexts/ContentContext'
import { useLanguage } from '../contexts/LanguageContext'
import { API_BASE, api } from '../lib/api'
import { IconAlert, IconChat, IconClose, IconRefresh, IconSend } from './Icons'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'error'
  text: string
}

const SESSION_KEY = 'portfolio.chat.session'

/** `crypto.randomUUID` needs a secure context; fall back on plain HTTP hosts. */
function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/** A per-tab conversation id, so history survives closing and reopening the panel. */
function getSessionId(): string {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) return saved
    const fresh = randomId()
    sessionStorage.setItem(SESSION_KEY, fresh)
    return fresh
  } catch {
    return randomId()
  }
}

export default function Chatbot() {
  const { t, tList, language } = useLanguage()
  const { profile } = useContent()

  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)

  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sessionRef = useRef<string>('')
  const abortRef = useRef<AbortController | null>(null)

  if (!sessionRef.current) sessionRef.current = getSessionId()

  // Ask the server whether a key is configured before offering the widget.
  useEffect(() => {
    const controller = new AbortController()
    api
      .chatStatus(controller.signal)
      .then((status) => setEnabled(status.enabled))
      .catch(() => setEnabled(false))
    return () => controller.abort()
  }, [])

  // Abort any in-flight stream when the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || streaming) return

      const userMessage: ChatMessage = { id: `u${Date.now()}`, role: 'user', text: trimmed }
      const replyId = `a${Date.now()}`

      setMessages((current) => [
        ...current,
        userMessage,
        { id: replyId, role: 'assistant', text: '' },
      ])
      setInput('')
      setStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      const fail = (message: string) => {
        setMessages((current) => [
          // Drop the empty placeholder before showing the error.
          ...current.filter((item) => !(item.id === replyId && item.text === '')),
          { id: `e${Date.now()}`, role: 'error', text: message },
        ])
      }

      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionRef.current,
            message: trimmed,
            lang: language,
          }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          const payload = await response.json().catch(() => ({}))
          fail(typeof payload.error === 'string' ? payload.error : t('chatbot.error'))
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        // Server-sent events: records separated by a blank line.
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const records = buffer.split('\n\n')
          buffer = records.pop() ?? ''

          for (const record of records) {
            const line = record.split('\n').find((part) => part.startsWith('data: '))
            if (!line) continue

            let event: { type: string; text?: string; message?: string }
            try {
              event = JSON.parse(line.slice(6))
            } catch {
              continue
            }

            if (event.type === 'delta' && event.text) {
              const chunk = event.text
              setMessages((current) =>
                current.map((item) =>
                  item.id === replyId ? { ...item, text: item.text + chunk } : item,
                ),
              )
            } else if (event.type === 'replace' && event.text) {
              const replacement = event.text
              setMessages((current) =>
                current.map((item) =>
                  item.id === replyId ? { ...item, text: replacement } : item,
                ),
              )
            } else if (event.type === 'error') {
              fail(event.message ?? t('chatbot.error'))
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') fail(t('chatbot.error'))
      } finally {
        setStreaming(false)
        abortRef.current = null
      }
    },
    [language, streaming, t],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send(input)
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setMessages([])
    try {
      // A fresh id gives the server a clean history too.
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
    sessionRef.current = getSessionId()
  }

  const toggle = () => {
    setOpen((value) => {
      if (!value) api.track('chat_open')
      return !value
    })
  }

  // Hide the widget entirely while the status check is pending.
  if (enabled === null) return null

  const showSuggestions = messages.length === 0 && enabled

  return (
    <>
      <button
        type="button"
        className="chat-fab"
        onClick={toggle}
        aria-label={open ? t('chatbot.close') : t('chatbot.open')}
        aria-expanded={open}
      >
        {!open && <span className="chat-fab__ping" aria-hidden="true" />}
        {open ? <IconClose size={22} /> : <IconChat size={22} />}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label={t('chatbot.title')}>
          <div className="chat-panel__header">
            <span className="chat-panel__avatar">{profile.initials}</span>
            <div className="chat-panel__meta">
              <p className="chat-panel__title">{t('chatbot.title')}</p>
              <p className="chat-panel__status">
                {enabled ? t('chatbot.online') : t('chatbot.subtitle')}
              </p>
            </div>
            <div className="chat-panel__actions">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="chat-panel__icon-btn"
                  onClick={reset}
                  aria-label={t('chatbot.clear')}
                  title={t('chatbot.clear')}
                >
                  <IconRefresh size={16} />
                </button>
              )}
              <button
                type="button"
                className="chat-panel__icon-btn"
                onClick={() => setOpen(false)}
                aria-label={t('chatbot.close')}
              >
                <IconClose size={17} />
              </button>
            </div>
          </div>

          {!enabled ? (
            <div className="chat-disabled">
              <span className="chat-disabled__icon">
                <IconAlert size={24} />
              </span>
              <p className="chat-disabled__title">{t('chatbot.disabled.title')}</p>
              <p className="chat-disabled__body">{t('chatbot.disabled.body')}</p>
              <code className="chat-disabled__code">ANTHROPIC_API_KEY=sk-ant-...</code>
            </div>
          ) : (
            <>
              <div className="chat-panel__body" ref={bodyRef}>
                <div className="chat-msg chat-msg--bot">{t('chatbot.greeting')}</div>

                {messages.map((message) => {
                  if (message.role === 'error') {
                    return (
                      <div key={message.id} className="chat-msg chat-msg--error">
                        {message.text}
                      </div>
                    )
                  }

                  // An empty assistant bubble means the stream hasn't produced text yet.
                  if (message.role === 'assistant' && !message.text) {
                    return (
                      <div key={message.id} className="chat-typing" aria-label={t('chatbot.thinking')}>
                        <span />
                        <span />
                        <span />
                      </div>
                    )
                  }

                  return (
                    <div
                      key={message.id}
                      className={`chat-msg chat-msg--${message.role === 'user' ? 'user' : 'bot'}`}
                    >
                      {message.text}
                    </div>
                  )
                })}
              </div>

              {showSuggestions && (
                <div className="chat-suggestions">
                  {tList('chatbot.suggestions').map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="chat-suggestion"
                      onClick={() => send(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="chat-panel__footer">
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  rows={1}
                  placeholder={t('chatbot.placeholder')}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={streaming}
                />
                <button
                  type="button"
                  className="chat-send"
                  onClick={() => send(input)}
                  disabled={!input.trim() || streaming}
                  aria-label={t('chatbot.send')}
                >
                  <IconSend size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
