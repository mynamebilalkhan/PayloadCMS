'use client'

import React, { useCallback } from 'react'
import type { FieldDef } from './index'
import { FieldRow } from './FieldRow'

type Props = {
  fields: FieldDef[]
  onChange: (fields: FieldDef[]) => void
  readOnly?: boolean
  depth?: number
}

export function NestedFieldsEditor({ fields, onChange, readOnly, depth = 1 }: Props) {
  const addField = useCallback(() => {
    onChange([...fields, { name: '', type: 'text', label: '', required: false }])
  }, [fields, onChange])

  const updateField = useCallback(
    (index: number, updated: FieldDef) => {
      onChange(fields.map((f, i) => (i === index ? updated : f)))
    },
    [fields, onChange],
  )

  const removeField = useCallback(
    (index: number) => {
      onChange(fields.filter((_, i) => i !== index))
    },
    [fields, onChange],
  )

  const moveField = useCallback(
    (index: number, dir: -1 | 1) => {
      const next = [...fields]
      const target = index + dir
      if (target < 0 || target >= next.length) return
      ;[next[index], next[target]] = [next[target], next[index]]
      onChange(next)
    },
    [fields, onChange],
  )

  return (
    <div
      style={{
        borderLeft: '2px solid var(--theme-elevation-200, #e5e7eb)',
        paddingLeft: '0.75rem',
        marginTop: '0.5rem',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--theme-elevation-500, #6b7280)',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Nested Fields
      </div>

      {fields.length === 0 && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--theme-elevation-400, #9ca3af)', marginBottom: '0.5rem' }}>
          No nested fields yet.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {fields.map((field, i) => (
          <FieldRow
            key={i}
            index={i}
            field={field}
            onChange={(updated) => updateField(i, updated)}
            onRemove={() => removeField(i)}
            onMoveUp={i > 0 ? () => moveField(i, -1) : undefined}
            onMoveDown={i < fields.length - 1 ? () => moveField(i, 1) : undefined}
            readOnly={readOnly}
            depth={depth}
          />
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={addField}
          style={{
            marginTop: '0.5rem',
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
          + Add Nested Field
        </button>
      )}
    </div>
  )
}
