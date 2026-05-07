'use client'

import React from 'react'
import type { BlockField, SelectField, MultiSelectField, ArrayField, GroupField } from '@/validation/types'
import { ArrayFieldInput } from './ArrayFieldInput'
import { GroupFieldInput } from './GroupFieldInput'
import { MediaPickerInput } from './MediaPickerInput'

type Props = {
  field: BlockField
  value: unknown
  onChange: (value: unknown) => void
  readOnly?: boolean
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--theme-elevation-200, #d1d5db)',
  borderRadius: '0.25rem',
  background: 'var(--theme-elevation-0, #fff)',
  fontSize: '0.875rem',
  color: 'var(--theme-text, #111827)',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 500,
  fontSize: '0.8125rem',
  marginBottom: '0.25rem',
  color: 'var(--theme-text, #374151)',
}

const descStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--theme-elevation-500, #6b7280)',
  marginTop: '0.25rem',
}

function FieldWrapper({
  label,
  required,
  description,
  children,
}: {
  label?: string
  required?: boolean
  description?: string
  children: React.ReactNode
}) {
  return (
    <div>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && (
            <span style={{ color: 'var(--theme-error-500, #ef4444)', marginLeft: '0.25rem' }}>*</span>
          )}
        </label>
      )}
      {children}
      {description && <p style={descStyle}>{description}</p>}
    </div>
  )
}

export function FieldInput({ field, value, onChange, readOnly }: Props) {
  const disabled = readOnly || false

  switch (field.type) {
    case 'text':
    case 'url':
    case 'email':
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <input
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            value={typeof value === 'string' ? value : ''}
            placeholder={field.admin?.placeholder ?? ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
        </FieldWrapper>
      )

    case 'color':
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              value={typeof value === 'string' ? value : '#000000'}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              style={{ width: '2.5rem', height: '2.5rem', padding: '0.125rem', border: '1px solid var(--theme-elevation-200, #d1d5db)', borderRadius: '0.25rem', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={typeof value === 'string' ? value : ''}
              placeholder="#000000"
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </FieldWrapper>
      )

    case 'textarea':
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <textarea
            value={typeof value === 'string' ? value : ''}
            placeholder={field.admin?.placeholder ?? ''}
            disabled={disabled}
            rows={4}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </FieldWrapper>
      )

    case 'richtext':
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <textarea
            value={typeof value === 'string' ? value : ''}
            placeholder={field.admin?.placeholder ?? 'Enter HTML or plain text…'}
            disabled={disabled}
            rows={6}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8125rem' }}
          />
          <p style={descStyle}>Rich text — HTML accepted.</p>
        </FieldWrapper>
      )

    case 'number':
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <input
            type="number"
            value={typeof value === 'number' ? value : ''}
            min={'min' in field ? field.min : undefined}
            max={'max' in field ? field.max : undefined}
            placeholder={field.admin?.placeholder ?? ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            style={inputStyle}
          />
        </FieldWrapper>
      )

    case 'checkbox':
      return (
        <FieldWrapper description={field.admin?.description}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={typeof value === 'boolean' ? value : false}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', color: 'var(--theme-text, #374151)', fontWeight: 500 }}>
              {field.label}
              {field.required && (
                <span style={{ color: 'var(--theme-error-500, #ef4444)', marginLeft: '0.25rem' }}>*</span>
              )}
            </span>
          </label>
        </FieldWrapper>
      )

    case 'date':
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <input
            type={'timeFormat' in field && field.timeFormat ? 'datetime-local' : 'date'}
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
        </FieldWrapper>
      )

    case 'select': {
      const sf = field as SelectField
      return (
        <FieldWrapper label={sf.label} required={sf.required} description={sf.admin?.description}>
          <select
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value || null)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">— Select —</option>
            {sf.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FieldWrapper>
      )
    }

    case 'multiselect': {
      const msf = field as MultiSelectField
      const selected: string[] = Array.isArray(value) ? (value as string[]) : []
      function toggle(v: string) {
        onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
      }
      return (
        <FieldWrapper label={msf.label} required={msf.required} description={msf.admin?.description}>
          <div
            style={{
              border: '1px solid var(--theme-elevation-200, #d1d5db)',
              borderRadius: '0.25rem',
              padding: '0.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {msf.options.map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  cursor: disabled ? 'default' : 'pointer',
                  fontSize: '0.875rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: selected.includes(opt.value)
                    ? 'var(--theme-success-100, #d1fae5)'
                    : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  disabled={disabled}
                  onChange={() => toggle(opt.value)}
                  style={{ cursor: 'pointer' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </FieldWrapper>
      )
    }

    case 'image':
    case 'file': {
      const mediaId =
        typeof value === 'object' && value !== null && 'id' in value
          ? (value as { id: string | number }).id
          : typeof value === 'string' || typeof value === 'number'
            ? value
            : null

      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <MediaPickerInput
            value={mediaId}
            onChange={(id) => onChange(id)}
            readOnly={disabled}
            fieldType={field.type as 'image' | 'file'}
          />
        </FieldWrapper>
      )
    }

    case 'relationship': {
      const relValue =
        typeof value === 'object' && value !== null && 'id' in value
          ? String((value as { id: string }).id)
          : typeof value === 'string'
            ? value
            : ''

      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <input
            type="text"
            value={relValue}
            placeholder="Document ID"
            disabled={disabled}
            onChange={(e) => onChange(e.target.value || null)}
            style={inputStyle}
          />
          <p style={descStyle}>
            Enter the ID of a document from the{' '}
            <strong>{'collection' in field ? field.collection : ''}</strong> collection.
          </p>
        </FieldWrapper>
      )
    }

    case 'json': {
      let display = ''
      try {
        display = typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2)
      } catch {
        display = ''
      }
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <textarea
            value={display}
            placeholder="{}"
            disabled={disabled}
            rows={5}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {
                onChange(e.target.value)
              }
            }}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8125rem' }}
          />
        </FieldWrapper>
      )
    }

    case 'array':
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <ArrayFieldInput
            field={field as ArrayField}
            value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
            onChange={onChange}
            readOnly={disabled}
          />
        </FieldWrapper>
      )

    case 'group':
      return (
        <FieldWrapper label={field.label} required={field.required} description={field.admin?.description}>
          <GroupFieldInput
            field={field as GroupField}
            value={typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}}
            onChange={onChange}
            readOnly={disabled}
          />
        </FieldWrapper>
      )

    default:
      return null
  }
}
