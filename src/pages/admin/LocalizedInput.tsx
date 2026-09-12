import { useState } from 'react'
import type { Language } from '../../lib/types'

const TABS: { code: Language; label: string }[] = [
  { code: 'uz', label: 'UZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

type LocalizedInputProps = {
  label: string
  value: Record<Language, string>
  onChange: (value: Record<Language, string>) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
}

/**
 * One field with a UZ/EN/RU tab strip. A dot on the tab marks which languages
 * already have content, so it is obvious what is still missing.
 */
export default function LocalizedInput({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  placeholder,
}: LocalizedInputProps) {
  const [active, setActive] = useState<Language>('uz')

  const update = (text: string) => onChange({ ...value, [active]: text })

  return (
    <div className="field" style={{ margin: 0 }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
      >
        <label className="field__label">{label}</label>
        <div className="lang-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.code}
              type="button"
              className={`lang-tab ${active === tab.code ? 'lang-tab--active' : ''}`}
              onClick={() => setActive(tab.code)}
            >
              {tab.label}
              {value[tab.code]?.trim() ? ' •' : ''}
            </button>
          ))}
        </div>
      </div>

      {multiline ? (
        <textarea
          className="field__textarea"
          rows={rows}
          value={value[active] ?? ''}
          onChange={(event) => update(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="field__input"
          type="text"
          value={value[active] ?? ''}
          onChange={(event) => update(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}
