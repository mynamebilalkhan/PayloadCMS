'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'
import type { FieldType } from '@/validation/types'
import { FieldRow } from './FieldRow'

export interface FieldDef {
  name: string
  type: FieldType
  label: string
  required: boolean
  // select / multiselect
  options?: { label: string; value: string }[]
  // array / group
  fields?: FieldDef[]
  // number
  min?: number
  max?: number
  // text / textarea
  minLength?: number
  maxLength?: number
  // array
  minRows?: number
  maxRows?: number
  // relationship
  collection?: string
  hasMany?: boolean
  // file
  allowedMimeTypes?: string
  // date
  timeFormat?: boolean
  // admin
  admin?: {
    description?: string
    placeholder?: string
    readOnly?: boolean
    hidden?: boolean
  }
}

function parseSchema(raw: unknown): FieldDef[] {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!parsed) return []
    if (Array.isArray(parsed)) return parsed as FieldDef[]
    if (parsed?.fields && Array.isArray(parsed.fields)) return parsed.fields as FieldDef[]
  } catch {
    // ignore
  }
  return []
}

type Props = {
  path: string
  readOnly?: boolean
}

export function SchemaBuilderField({ path, readOnly }: Props) {
  const { value, setValue } = useField<unknown>({ path })

  const [fields, setFields] = useState<FieldDef[]>(() => parseSchema(value))

  // Create mode: value is null/undefined on mount → hydrate immediately so the sync effect works.
  // Edit mode:   value arrives from Payload after mount → parse it once, then hand off to sync effect.
  const hasExistingValue = value !== undefined && value !== null
  const [hydrated, setHydrated] = useState(!hasExistingValue) // true in create mode, false in edit mode

  useEffect(() => {
    if (hydrated) return // already ready
    if (value !== undefined && value !== null) {
      setFields(parseSchema(value))
      setHydrated(true)
    }
  }, [value, hydrated])

  // Sync state → Payload field on every change (only after hydration)
  useEffect(() => {
    if (!hydrated) return
    setValue({ fields })
  }, [fields, hydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  const addField = useCallback(() => {
    setFields((prev) => [
      ...prev,
      { name: '', type: 'text', label: '', required: false },
    ])
  }, [])

  const updateField = useCallback((index: number, updated: FieldDef) => {
    setFields((prev) => prev.map((f, i) => (i === index ? updated : f)))
  }, [])

  const removeField = useCallback((index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const moveField = useCallback((index: number, dir: -1 | 1) => {
    setFields((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Section label */}
      <div
        style={{
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
          color: 'var(--theme-elevation-500, #6b7280)',
        }}
      >
        Schema Fields
      </div>

      {fields.length === 0 && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--theme-elevation-400, #9ca3af)',
            marginBottom: '0.75rem',
          }}
        >
          No fields yet. Click &ldquo;Add Field&rdquo; to define the first field for this block.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
          />
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={addField}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--theme-text, #111827)',
            background: 'var(--theme-elevation-0, #fff)',
            border: '1px solid var(--theme-elevation-300, #d1d5db)',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          + Add Field
        </button>
      )}
    </div>
  )
}
