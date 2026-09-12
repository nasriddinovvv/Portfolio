import { useState } from 'react'
import type { FormEvent } from 'react'
import { useContent } from '../../contexts/ContentContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useToast } from '../../contexts/ToastContext'
import { ApiError, api } from '../../lib/api'
import Reveal from '../Reveal'
import { IconClock, IconMail, IconMapPin, IconSend, IconTelegram } from '../Icons'

type Fields = { name: string; email: string; subject: string; message: string; website: string }

const EMPTY: Fields = { name: '', email: '', subject: '', message: '', website: '' }

export default function Contact() {
  const { t } = useLanguage()
  const { profile } = useContent()
  const { push } = useToast()

  const [values, setValues] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [sending, setSending] = useState(false)

  const set = (key: keyof Fields, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
    // Clear the error as soon as the visitor starts fixing the field.
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  /** Mirrors the server's rules so the visitor gets feedback without a round trip. */
  const validate = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {}

    if (values.name.trim().length < 2) next.name = t('contact.form.name')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = t('contact.form.email')
    if (values.message.trim().length < 10) next.message = t('contact.form.message')

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (sending || !validate()) return

    setSending(true)
    try {
      await api.sendContact({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        website: values.website,
      })

      setValues(EMPTY)
      setErrors({})
      push({
        tone: 'success',
        title: t('contact.success.title'),
        description: t('contact.success.body'),
      })
    } catch (error) {
      const apiError = error as ApiError

      // The server returns per-field messages; surface them next to the inputs.
      if (apiError.fields) {
        setErrors(apiError.fields as Partial<Record<keyof Fields, string>>)
      }

      push({
        tone: 'error',
        title: t('contact.error.title'),
        description: apiError.message,
      })
    } finally {
      setSending(false)
    }
  }

  const methods = [
    {
      href: `mailto:${profile.email}`,
      Icon: IconMail,
      label: t('contact.email'),
      value: profile.email,
      external: false,
    },
    {
      href: profile.telegram,
      Icon: IconTelegram,
      label: t('contact.telegram'),
      value: profile.telegramUsername,
      external: true,
    },
  ]

  return (
    <section id="contact" className="section">
      <div className="container">
        <Reveal className="section__head section__head--center">
          <span className="section__label">{t('contact.label')}</span>
          <h2 className="section__title">{t('contact.title')}</h2>
          <p className="section__subtitle">{t('contact.subtitle')}</p>
        </Reveal>

        <div className="contact__grid">
          <Reveal className="card contact__form-card">
            <h3 className="contact__form-title">{t('contact.form.title')}</h3>

            <form onSubmit={onSubmit} noValidate>
              <div className="form-row">
                <div className={`field ${errors.name ? 'field--error' : ''}`}>
                  <label className="field__label" htmlFor="contact-name">
                    {t('contact.form.name')}
                  </label>
                  <input
                    id="contact-name"
                    className="field__input"
                    type="text"
                    autoComplete="name"
                    placeholder={t('contact.form.name.placeholder')}
                    value={values.name}
                    onChange={(event) => set('name', event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="field__error">{errors.name}</span>}
                </div>

                <div className={`field ${errors.email ? 'field--error' : ''}`}>
                  <label className="field__label" htmlFor="contact-email">
                    {t('contact.form.email')}
                  </label>
                  <input
                    id="contact-email"
                    className="field__input"
                    type="email"
                    autoComplete="email"
                    placeholder={t('contact.form.email.placeholder')}
                    value={values.email}
                    onChange={(event) => set('email', event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <span className="field__error">{errors.email}</span>}
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="contact-subject">
                  {t('contact.form.subject')}
                  <span className="field__optional">{t('contact.form.optional')}</span>
                </label>
                <input
                  id="contact-subject"
                  className="field__input"
                  type="text"
                  placeholder={t('contact.form.subject.placeholder')}
                  value={values.subject}
                  onChange={(event) => set('subject', event.target.value)}
                />
              </div>

              <div className={`field ${errors.message ? 'field--error' : ''}`}>
                <label className="field__label" htmlFor="contact-message">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="contact-message"
                  className="field__textarea"
                  placeholder={t('contact.form.message.placeholder')}
                  value={values.message}
                  onChange={(event) => set('message', event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <span className="field__error">{errors.message}</span>}
              </div>

              {/* Bot trap — hidden from people, tempting to naive scrapers. */}
              <div className="field field--honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(event) => set('website', event.target.value)}
                />
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
                {sending ? (
                  t('contact.form.sending')
                ) : (
                  <>
                    <IconSend size={16} />
                    {t('contact.form.submit')}
                  </>
                )}
              </button>
            </form>
          </Reveal>

          <Reveal delay={100} className="contact__aside">
            <h3 className="footer__col-title" style={{ marginBottom: 4 }}>
              {t('contact.direct')}
            </h3>

            {methods.map(({ href, Icon, label, value, external }) => (
              <a
                key={label}
                href={href}
                className="card contact__method"
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={() => api.track('social_click', { refId: label })}
              >
                <span className="contact__method-icon">
                  <Icon size={19} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="contact__method-label">{label}</span>
                  <span className="contact__method-value">{value}</span>
                </span>
              </a>
            ))}

            <div className="card contact__method">
              <span className="contact__method-icon">
                <IconMapPin size={19} />
              </span>
              <span>
                <span className="contact__method-label">{t('contact.location')}</span>
                <span className="contact__method-value">{profile.location}</span>
              </span>
            </div>

            <div className="card contact__method">
              <span className="contact__method-icon">
                <IconClock size={19} />
              </span>
              <span>
                <span className="contact__method-label">{t('contact.response')}</span>
                <span className="contact__method-value">{t('contact.response.value')}</span>
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
