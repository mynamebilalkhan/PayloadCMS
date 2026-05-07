'use client'

import React from 'react'
import type { ArrayField } from '@/validation/types'
import { SchemaForm } from './SchemaForm'

type Props = {
  field: ArrayField
  value: Record<string, unknown>[]
  onChange: (value: unknown) => void
  readOnly?: boolean
}

export function ArrayFieldInput({ field, value, onChange, readOnly }: Props) {
  const rows = value ?? []

  function addRow() {
    onChange([...rows, {}])
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }

  function updateRow(index: number, updated: Record<string, unknown>) {
    const next = [...rows]
    next[index] = updated
    onChange(next)
  }

  const atMax = field.maxRows != null && rows.length >= field.maxRows

  return (
    <div>
      {rows.length === 0 && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--theme-elevation-400, #9ca3af)',
            marginBottom: '0.5rem',
          }}
        >
          No rows yet. Click &ldquo;Add Row&rdquo; to add one.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--theme-elevation-150, #e5e7eb)',
              borderRadius: '0.375rem',
              overflow: 'hidden',
            }}
          >
            {/* Row header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                background: 'var(--theme-elevation-100, #f3f4f6)',
                borderBottom: '1px solid var(--theme-elevation-150, #e5e7eb)',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--theme-elevation-600, #4b5563)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Row {i + 1}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  style={{
                    padding: '0.125rem 0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--theme-error-500, #ef4444)',
                    background: 'transparent',
                    border: '1px solid var(--theme-error-300, #fca5a5)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Row fields */}
            <div style={{ padding: '0.75rem' }}>
              <SchemaForm
                schema={{ fields: field.fields }}
                value={row}
                onChange={(updated) => updateRow(i, updated)}
                readOnly={readOnly}
              />
            </div>
          </div>
        ))}
      </div>

      {!readOnly && !atMax && (
        <button
          type="button"
          onClick={addRow}
          style={{
            marginTop: '0.75rem',
            padding: '0.375rem 0.875rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--theme-text, #111827)',
            background: 'var(--theme-elevation-0, #fff)',
            border: '1px solid var(--theme-elevation-300, #d1d5db)',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          + Add Row
        </button>
      )}

      {atMax && (
        <p style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-400, #9ca3af)', marginTop: '0.5rem' }}>
          Maximum {field.maxRows} row{field.maxRows === 1 ? '' : 's'} reached.
        </p>
      )}
    </div>
  )
}
