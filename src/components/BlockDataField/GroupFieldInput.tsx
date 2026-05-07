'use client'

import React from 'react'
import type { GroupField } from '@/validation/types'
import { SchemaForm } from './SchemaForm'

type Props = {
  field: GroupField
  value: Record<string, unknown>
  onChange: (value: unknown) => void
  readOnly?: boolean
}

export function GroupFieldInput({ field, value, onChange, readOnly }: Props) {
  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150, #e5e7eb)',
        borderRadius: '0.375rem',
        padding: '0.75rem',
        background: 'var(--theme-elevation-50, #f9fafb)',
      }}
    >
      <SchemaForm
        schema={{ fields: field.fields }}
        value={value ?? {}}
        onChange={(updated) => onChange(updated)}
        readOnly={readOnly}
      />
    </div>
  )
}
