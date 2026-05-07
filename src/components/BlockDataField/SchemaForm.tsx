'use client'

import React from 'react'
import type { BlockSchema, BlockField } from '@/validation/types'
import { FieldInput } from './FieldInput'

type Props = {
  schema: BlockSchema
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  readOnly?: boolean
}

export function SchemaForm({ schema, value, onChange, readOnly }: Props) {
  function handleFieldChange(fieldName: string, fieldValue: unknown) {
    onChange({ ...value, [fieldName]: fieldValue })
  }

  const visibleFields = schema.fields.filter((f) => !f.admin?.hidden)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {visibleFields.map((field: BlockField) => (
        <FieldInput
          key={field.name}
          field={field}
          value={value[field.name]}
          onChange={(v) => handleFieldChange(field.name, v)}
          readOnly={readOnly || field.admin?.readOnly}
        />
      ))}
    </div>
  )
}
