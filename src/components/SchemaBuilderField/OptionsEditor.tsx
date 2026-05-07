'use client'

import React from 'react'

interface SelectOption {
  label: string
  value: string
}

type Props = {
  options: SelectOption[]
  onChange: (options: SelectOption[]) => void
  readOnly?: boolean
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.375rem 0.5rem',
  border: '1px solid var(--theme-elevation-200, #d1d5db)',
  borderRadius: '0.25rem',
  background: 'var(--theme-elevation-0, #fff)',
  fontSize: '0.8125rem',
  color: 'var(--theme-text, #111827)',
  outline: 'none',
  boxSizing: 'border-box',
}

export function OptionsEditor({ options, onChange, readOnly }: Props) {
  function addOption() {
    onChange([...options, { label: '', value: '' }])
  }

  function updateOption(index: number, key: keyof SelectOption, val: string) {
    const next = options.map((o, i) => (i === index ? { ...o, [key]: val } : o))
    onChange(next)
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--theme-elevation-500, #6b7280)',
          marginBottom: '0.375rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Options
      </div>

      {options.length === 0 && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--theme-elevation-400, #9ca3af)', marginBottom: '0.375rem' }}>
          No options yet.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              value={opt.label}
              placeholder="Label"
              disabled={readOnly}
              onChange={(e) => updateOption(i, 'label', e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              value={opt.value}
              placeholder="Value"
              disabled={readOnly}
              onChange={(e) => updateOption(i, 'value', e.target.value)}
              style={inputStyle}
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--theme-error-500, #ef4444)',
                  background: 'transparent',
                  border: '1px solid var(--theme-error-300, #fca5a5)',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={addOption}
          style={{
            marginTop: '0.375rem',
            padding: '0.25rem 0.625rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--theme-text, #111827)',
            background: 'transparent',
            border: '1px solid var(--theme-elevation-300, #d1d5db)',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          + Add Option
        </button>
      )}
    </div>
  )
}
