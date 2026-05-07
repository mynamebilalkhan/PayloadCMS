'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import type { BlockSchema } from '@/validation/types'
import { SchemaForm } from './SchemaForm'

type Props = {
  path: string
  readOnly?: boolean
}

export function BlockDataField({ path, readOnly }: Props) {
  const { value, setValue } = useField<Record<string, unknown>>({ path })

  // Keep a ref so the fetch callback always sees the latest value without stale closures
  const valueRef = useRef(value)
  useEffect(() => { valueRef.current = value }, [value])

  // Derive sibling blockVersion path: "layout.0.data" → "layout.0.blockVersion"
  const versionPath = path.replace(/\.data$/, '.blockVersion')

  const blockVersionId = useFormFields(([fields]) => {
    const v = fields[versionPath]?.value
    if (!v) return null
    return typeof v === 'object' && v !== null && 'id' in v
      ? (v as { id: string }).id
      : (v as string)
  })

  const [schema, setSchema] = useState<BlockSchema | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!blockVersionId) {
      setSchema(null)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`/api/block-definition-versions/${blockVersionId}?depth=0`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((doc) => {
        if (!doc?.schema) { setError('Version has no schema.'); return }

        const newSchema = doc.schema as BlockSchema
        setSchema(newSchema)

        // Strip keys not defined in this schema so orphaned data never persists
        const allowed = new Set(newSchema.fields.map((f) => f.name))
        const current = valueRef.current ?? {}
        const cleaned: Record<string, unknown> = {}
        for (const key of Object.keys(current)) {
          if (allowed.has(key)) cleaned[key] = current[key]
        }
        setValue(cleaned)
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [blockVersionId])

  return (
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
          color: 'var(--theme-elevation-500, #6b7280)',
        }}
      >
        Block Data
      </div>

      {!blockVersionId && (
        <p style={{ color: 'var(--theme-elevation-400, #9ca3af)', fontSize: '0.875rem' }}>
          Select a Block Version above to reveal form fields.
        </p>
      )}

      {blockVersionId && loading && (
        <p style={{ color: 'var(--theme-elevation-400, #9ca3af)', fontSize: '0.875rem' }}>
          Loading schema…
        </p>
      )}

      {blockVersionId && error && (
        <p style={{ color: 'var(--theme-error-500, #ef4444)', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}

      {blockVersionId && !loading && schema && (
        <div
          style={{
            border: '1px solid var(--theme-elevation-150, #e5e7eb)',
            borderRadius: '0.375rem',
            padding: '1rem',
            background: 'var(--theme-elevation-50, #f9fafb)',
          }}
        >
          <SchemaForm
            schema={schema}
            value={value ?? {}}
            onChange={(next) => setValue(next)}
            readOnly={readOnly}
          />
        </div>
      )}
    </div>
  )
}
