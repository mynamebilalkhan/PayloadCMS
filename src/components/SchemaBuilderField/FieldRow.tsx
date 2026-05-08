'use client'

import React, { useEffect, useState } from 'react'
import type { FieldType, ConditionOperator, ConditionRule, ValidationRules, UIMetadata } from '@/validation/types'
import type { FieldDef } from './index'
import { OptionsEditor } from './OptionsEditor'
import { NestedFieldsEditor } from './NestedFieldsEditor'

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'richtext', label: 'Rich Text' },
  { value: 'number', label: 'Number' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Select (single)' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'date', label: 'Date' },
  { value: 'image', label: 'Image' },
  { value: 'file', label: 'File' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'color', label: 'Color' },
  { value: 'array', label: 'Array (repeatable)' },
  { value: 'group', label: 'Group (object)' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'json', label: 'JSON' },
  { value: 'blocks', label: 'Blocks (nested)' },
]

const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'not contains' },
  { value: 'greater_than', label: '>' },
  { value: 'less_than', label: '<' },
  { value: 'in', label: 'in (array)' },
  { value: 'not_in', label: 'not in (array)' },
  { value: 'exists', label: 'exists' },
  { value: 'empty', label: 'is empty' },
]

// Operators that don't need a value input
const NO_VALUE_OPERATORS = new Set<ConditionOperator>(['exists', 'empty'])

const ALWAYS_SHOW_CONFIG = new Set<FieldType>(['select', 'multiselect', 'array', 'group', 'blocks'])
const HAS_OPTIONS = new Set<FieldType>(['select', 'multiselect'])
const HAS_NESTED = new Set<FieldType>(['array', 'group'])

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: '0.375rem 0.5rem',
  border: '1px solid var(--theme-elevation-200, #d1d5db)',
  borderRadius: '0.25rem',
  background: 'var(--theme-elevation-0, #fff)',
  fontSize: '0.8125rem',
  color: 'var(--theme-text, #111827)',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'var(--theme-elevation-500, #6b7280)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'block',
  marginBottom: '0.2rem',
}

const subSectionStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--theme-elevation-600, #4b5563)',
  marginBottom: '0.5rem',
  paddingBottom: '0.25rem',
  borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)',
}

const iconBtn: React.CSSProperties = {
  padding: '0.125rem 0.375rem',
  fontSize: '0.75rem',
  background: 'transparent',
  border: '1px solid var(--theme-elevation-200, #e5e7eb)',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  lineHeight: 1.4,
  color: 'var(--theme-elevation-700, #374151)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1')
    .replace(/__+/g, '_')
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  index: number
  field: FieldDef
  onChange: (field: FieldDef) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  readOnly?: boolean
  depth?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FieldRow({
  index,
  field,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  readOnly,
  depth = 0,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (ALWAYS_SHOW_CONFIG.has(field.type)) {
      // primary config is always visible below — no need to force-expand
    }
  }, [field.type])

  // ── Setters ─────────────────────────────────────────────────────────────────

  function set<K extends keyof FieldDef>(key: K, val: FieldDef[K]) {
    onChange({ ...field, [key]: val })
  }

  function setAdmin(key: keyof NonNullable<FieldDef['admin']>, val: unknown) {
    onChange({ ...field, admin: { ...field.admin, [key]: val } })
  }

  function setValidation(key: keyof ValidationRules, val: unknown) {
    const next = { ...field.validation, [key]: val }
    if (val === undefined) delete (next as Record<string, unknown>)[key]
    onChange({ ...field, validation: Object.keys(next).length > 0 ? next : undefined })
  }

  function setUI(key: keyof UIMetadata, val: unknown) {
    const next = { ...field.ui, [key]: val }
    if (val === undefined) delete (next as Record<string, unknown>)[key]
    onChange({ ...field, ui: Object.keys(next).length > 0 ? (next as UIMetadata) : undefined })
  }

  // ── Conditions ───────────────────────────────────────────────────────────────

  const conditions = field.conditions ?? []

  function addCondition() {
    set('conditions', [
      ...conditions,
      { field: '', operator: 'equals' as ConditionOperator, value: '' },
    ])
  }

  function removeCondition(ci: number) {
    const next = conditions.filter((_, i) => i !== ci)
    onChange({ ...field, conditions: next.length > 0 ? next : undefined })
  }

  function updateCondition(ci: number, key: keyof ConditionRule, val: unknown) {
    const next = conditions.map((c, i) => (i === ci ? { ...c, [key]: val } : c))
    set('conditions', next)
  }

  // ── Type change ──────────────────────────────────────────────────────────────

  function handleTypeChange(newType: FieldType) {
    const next: FieldDef = {
      name: field.name,
      type: newType,
      label: field.label,
      required: field.required,
      admin: field.admin,
      // Preserve cross-type props
      conditions: field.conditions,
      conditionMode: field.conditionMode,
      validation: field.validation,
      ui: field.ui,
    }
    onChange(next)
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const hasOptions = HAS_OPTIONS.has(field.type)
  const hasNested = HAS_NESTED.has(field.type)
  const isBlocks = field.type === 'blocks'

  const accentColor = isBlocks
    ? 'var(--theme-info-500, #3b82f6)'
    : hasNested
      ? 'var(--theme-warning-500, #f59e0b)'
      : hasOptions
        ? 'var(--theme-info-500, #3b82f6)'
        : depth === 0
          ? 'var(--theme-success-500, #10b981)'
          : 'var(--theme-elevation-400, #9ca3af)'

  const typeLabel = FIELD_TYPES.find((t) => t.value === field.type)?.label ?? field.type

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-200, #e5e7eb)',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        background: 'var(--theme-elevation-0, #fff)',
      }}
    >
      {/* ── Header bar ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--theme-elevation-100, #f3f4f6)',
          borderBottom: '1px solid var(--theme-elevation-150, #e5e7eb)',
        }}
      >
        {/* Index + type badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
            minWidth: '2.25rem',
          }}
        >
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: accentColor }}>
            #{index + 1}
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              color: accentColor,
              whiteSpace: 'nowrap',
              opacity: 0.8,
            }}
          >
            {typeLabel}
          </span>
        </div>

        {/* Name */}
        <div style={{ flex: '0 0 150px' }}>
          <input
            type="text"
            value={field.name}
            placeholder="field_name"
            disabled={readOnly}
            onChange={(e) => set('name', slugify(e.target.value))}
            style={{ ...inputStyle, width: '100%', fontFamily: 'monospace' }}
          />
        </div>

        {/* Type */}
        <div style={{ flex: '0 0 165px' }}>
          <select
            value={field.type}
            disabled={readOnly}
            onChange={(e) => handleTypeChange(e.target.value as FieldType)}
            style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Label */}
        <input
          type="text"
          value={field.label}
          placeholder="Field Label"
          disabled={readOnly}
          onChange={(e) => set('label', e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 0 }}
        />

        {/* Required */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            color: 'var(--theme-elevation-600, #4b5563)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <input
            type="checkbox"
            checked={field.required ?? false}
            disabled={readOnly}
            onChange={(e) => set('required', e.target.checked)}
          />
          Req
        </label>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          {onMoveUp && !readOnly && (
            <button type="button" onClick={onMoveUp} title="Move up" style={iconBtn}>
              ↑
            </button>
          )}
          {onMoveDown && !readOnly && (
            <button type="button" onClick={onMoveDown} title="Move down" style={iconBtn}>
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? 'Hide options' : 'Show options'}
            style={{ ...iconBtn, color: 'var(--theme-elevation-500, #6b7280)' }}
          >
            {expanded ? '▲' : '▼'}
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={onRemove}
              title="Remove field"
              style={{ ...iconBtn, color: 'var(--theme-error-500, #ef4444)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Always-visible: Options (select/multiselect) ─ */}
      {hasOptions && (
        <div
          style={{
            padding: '0.625rem 0.75rem',
            borderBottom: '1px solid var(--theme-elevation-150, #e5e7eb)',
            background: 'var(--theme-elevation-50, #f9fafb)',
          }}
        >
          <OptionsEditor
            options={field.options ?? []}
            onChange={(opts) => set('options', opts)}
            readOnly={readOnly}
          />
        </div>
      )}

      {/* ── Always-visible: Nested fields (array/group) ── */}
      {hasNested && depth < 3 && (
        <div
          style={{
            padding: '0.625rem 0.75rem',
            borderBottom: '1px solid var(--theme-elevation-150, #e5e7eb)',
            background: 'var(--theme-elevation-50, #f9fafb)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: accentColor,
              }}
            >
              {field.type === 'array' ? '↻ Repeatable Sub-fields' : '⊞ Group Sub-fields'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--theme-elevation-400, #9ca3af)' }}>
              {field.type === 'array'
                ? '— each row will contain these fields'
                : '— nested object with these fields'}
            </span>
          </div>
          <NestedFieldsEditor
            fields={field.fields ?? []}
            onChange={(nested) => set('fields', nested)}
            readOnly={readOnly}
            depth={depth + 1}
          />
        </div>
      )}

      {/* ── Always-visible: Blocks — allowed slugs config ── */}
      {isBlocks && (
        <div
          style={{
            padding: '0.625rem 0.75rem',
            borderBottom: '1px solid var(--theme-elevation-150, #e5e7eb)',
            background: 'var(--theme-elevation-50, #f9fafb)',
          }}
        >
          <label style={labelStyle}>Allowed Block Slugs (comma-separated)</label>
          <input
            type="text"
            value={(field.allowedBlocks ?? []).join(', ')}
            placeholder="e.g. hero-banner, rich-text, card-grid"
            disabled={readOnly}
            onChange={(e) => {
              const slugs = e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
              set('allowedBlocks', slugs.length > 0 ? slugs : undefined)
            }}
            style={{ ...inputStyle, width: '100%' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Min blocks</label>
              <input
                type="number"
                value={field.minBlocks ?? ''}
                min={0}
                disabled={readOnly}
                onChange={(e) =>
                  set('minBlocks', e.target.value === '' ? undefined : Number(e.target.value))
                }
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Max blocks</label>
              <input
                type="number"
                value={field.maxBlocks ?? ''}
                min={0}
                disabled={readOnly}
                onChange={(e) =>
                  set('maxBlocks', e.target.value === '' ? undefined : Number(e.target.value))
                }
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Collapsible: Advanced options ─────────────────── */}
      {expanded && (
        <div
          style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {/* ── Admin: Description ─────────────────────────── */}
          <div>
            <label style={labelStyle}>Description (shown below field)</label>
            <textarea
              value={field.admin?.description ?? ''}
              placeholder="Help text for editors…"
              disabled={readOnly}
              rows={2}
              onChange={(e) => setAdmin('description', e.target.value || undefined)}
              style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* ── Admin: Placeholder ─────────────────────────── */}
          {['text', 'textarea', 'number', 'url', 'email', 'richtext'].includes(field.type) && (
            <div>
              <label style={labelStyle}>Placeholder</label>
              <input
                type="text"
                value={field.admin?.placeholder ?? ''}
                placeholder="Placeholder text…"
                disabled={readOnly}
                onChange={(e) => setAdmin('placeholder', e.target.value || undefined)}
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
          )}

          {/* ── Number: min / max (existing) ──────────────── */}
          {field.type === 'number' && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Min value</label>
                <input
                  type="number"
                  value={field.min ?? ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    set('min', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Max value</label>
                <input
                  type="number"
                  value={field.max ?? ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    set('max', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* ── Text / Textarea: minLength / maxLength ─────── */}
          {(field.type === 'text' || field.type === 'textarea') && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Min length</label>
                <input
                  type="number"
                  value={field.minLength ?? ''}
                  min={0}
                  disabled={readOnly}
                  onChange={(e) =>
                    set('minLength', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Max length</label>
                <input
                  type="number"
                  value={field.maxLength ?? ''}
                  min={0}
                  disabled={readOnly}
                  onChange={(e) =>
                    set('maxLength', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* ── Array: minRows / maxRows ───────────────────── */}
          {field.type === 'array' && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Min rows</label>
                <input
                  type="number"
                  value={field.minRows ?? ''}
                  min={0}
                  disabled={readOnly}
                  onChange={(e) =>
                    set('minRows', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Max rows</label>
                <input
                  type="number"
                  value={field.maxRows ?? ''}
                  min={0}
                  disabled={readOnly}
                  onChange={(e) =>
                    set('maxRows', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* ── Date: timeFormat ──────────────────────────── */}
          {field.type === 'date' && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={field.timeFormat ?? false}
                disabled={readOnly}
                onChange={(e) => set('timeFormat', e.target.checked)}
              />
              Include time (datetime-local)
            </label>
          )}

          {/* ── Relationship: collection + hasMany ────────── */}
          {field.type === 'relationship' && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Collection slug</label>
                <input
                  type="text"
                  value={field.collection ?? ''}
                  placeholder="e.g. media, pages"
                  disabled={readOnly}
                  onChange={(e) => set('collection', e.target.value || undefined)}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  paddingBottom: '0.4rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={field.hasMany ?? false}
                  disabled={readOnly}
                  onChange={(e) => set('hasMany', e.target.checked)}
                />
                Has many
              </label>
            </div>
          )}

          {/* ── File: allowedMimeTypes ─────────────────────── */}
          {field.type === 'file' && (
            <div>
              <label style={labelStyle}>Allowed MIME types (comma-separated)</label>
              <input
                type="text"
                value={field.allowedMimeTypes ?? ''}
                placeholder="image/*, application/pdf"
                disabled={readOnly}
                onChange={(e) => set('allowedMimeTypes', e.target.value || undefined)}
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
          )}

          {/* ── Feature 2: Advanced Validation ────────────── */}
          <div>
            <p style={subSectionStyle}>Validation Rules</p>

            {/* Regex (text, textarea, url, email) */}
            {['text', 'textarea', 'url', 'email'].includes(field.type) && (
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Regex pattern (value must match)</label>
                <input
                  type="text"
                  value={field.validation?.regex ?? ''}
                  placeholder="^[a-z]+$"
                  disabled={readOnly}
                  onChange={(e) => setValidation('regex', e.target.value || undefined)}
                  style={{ ...inputStyle, width: '100%', fontFamily: 'monospace' }}
                />
              </div>
            )}

            {/* Number: step + integerOnly */}
            {field.type === 'number' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Step</label>
                  <input
                    type="number"
                    value={field.validation?.step ?? ''}
                    min={0}
                    step="any"
                    disabled={readOnly}
                    onChange={(e) =>
                      setValidation('step', e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.8125rem',
                    paddingBottom: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={field.validation?.integerOnly ?? false}
                    disabled={readOnly}
                    onChange={(e) => setValidation('integerOnly', e.target.checked || undefined)}
                  />
                  Integer only
                </label>
              </div>
            )}

            {/* Multiselect: maxSelections */}
            {field.type === 'multiselect' && (
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Max selections</label>
                <input
                  type="number"
                  value={field.validation?.maxSelections ?? ''}
                  min={1}
                  disabled={readOnly}
                  onChange={(e) =>
                    setValidation('maxSelections', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            )}

            {/* Array: uniqueItems */}
            {field.type === 'array' && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={field.validation?.uniqueItems ?? false}
                  disabled={readOnly}
                  onChange={(e) => setValidation('uniqueItems', e.target.checked || undefined)}
                />
                Enforce unique items (no duplicate rows)
              </label>
            )}

            {/* File / Image: maxFileSize */}
            {(field.type === 'file' || field.type === 'image') && (
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Max file size (bytes)</label>
                <input
                  type="number"
                  value={field.validation?.maxFileSize ?? ''}
                  min={0}
                  disabled={readOnly}
                  onChange={(e) =>
                    setValidation('maxFileSize', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            )}
          </div>

          {/* ── Feature 3: UI Metadata ─────────────────────── */}
          <div>
            <p style={subSectionStyle}>UI Layout</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={labelStyle}>Tab</label>
                <input
                  type="text"
                  value={field.ui?.tab ?? ''}
                  placeholder="e.g. SEO, Settings"
                  disabled={readOnly}
                  onChange={(e) => setUI('tab', e.target.value || undefined)}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Section</label>
                <input
                  type="text"
                  value={field.ui?.section ?? ''}
                  placeholder="e.g. Metadata"
                  disabled={readOnly}
                  onChange={(e) => setUI('section', e.target.value || undefined)}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Width</label>
                <select
                  value={field.ui?.width ?? ''}
                  disabled={readOnly}
                  onChange={(e) => setUI('width', e.target.value || undefined)}
                  style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                >
                  <option value="">Full (default)</option>
                  <option value="half">Half (50%)</option>
                  <option value="third">Third (33%)</option>
                  <option value="quarter">Quarter (25%)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Order</label>
                <input
                  type="number"
                  value={field.ui?.order ?? ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    setUI('order', e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                marginTop: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={field.ui?.collapsed ?? false}
                disabled={readOnly}
                onChange={(e) => setUI('collapsed', e.target.checked || undefined)}
              />
              Collapsed by default (section)
            </label>
          </div>

          {/* ── Feature 1: Conditional Visibility ─────────── */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <p style={{ ...subSectionStyle, marginBottom: 0 }}>Conditional Visibility</p>
              {conditions.length > 1 && (
                <select
                  value={field.conditionMode ?? 'AND'}
                  disabled={readOnly}
                  onChange={(e) =>
                    set('conditionMode', e.target.value as 'AND' | 'OR')
                  }
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="AND">AND (all must pass)</option>
                  <option value="OR">OR (any must pass)</option>
                </select>
              )}
            </div>

            {conditions.length === 0 && (
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--theme-elevation-400, #9ca3af)',
                  marginBottom: '0.375rem',
                }}
              >
                Always visible. Add a condition to show this field only when criteria are met.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {conditions.map((cond, ci) => (
                <div
                  key={ci}
                  style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}
                >
                  {/* Field name */}
                  <input
                    type="text"
                    value={cond.field}
                    placeholder="field_name"
                    disabled={readOnly}
                    onChange={(e) => updateCondition(ci, 'field', e.target.value)}
                    style={{ ...inputStyle, flex: '1 1 100px', minWidth: 0, fontFamily: 'monospace' }}
                  />
                  {/* Operator */}
                  <select
                    value={cond.operator}
                    disabled={readOnly}
                    onChange={(e) =>
                      updateCondition(ci, 'operator', e.target.value as ConditionOperator)
                    }
                    style={{ ...inputStyle, flex: '0 0 115px', cursor: 'pointer' }}
                  >
                    {CONDITION_OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  {/* Value (hidden for exists/empty) */}
                  {!NO_VALUE_OPERATORS.has(cond.operator) && (
                    <input
                      type="text"
                      value={cond.value !== undefined ? String(cond.value) : ''}
                      placeholder="value"
                      disabled={readOnly}
                      onChange={(e) => updateCondition(ci, 'value', e.target.value)}
                      style={{ ...inputStyle, flex: '1 1 80px', minWidth: 0 }}
                    />
                  )}
                  {/* Remove */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeCondition(ci)}
                      title="Remove condition"
                      style={{ ...iconBtn, color: 'var(--theme-error-500, #ef4444)', flexShrink: 0 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={addCondition}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.625rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: 'transparent',
                  border: '1px dashed var(--theme-elevation-300, #d1d5db)',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  color: 'var(--theme-elevation-500, #6b7280)',
                }}
              >
                + Add Condition
              </button>
            )}
          </div>

          {/* ── Admin flags ─────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={field.admin?.readOnly ?? false}
                disabled={readOnly}
                onChange={(e) => setAdmin('readOnly', e.target.checked || undefined)}
              />
              Read-only
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={field.admin?.hidden ?? false}
                disabled={readOnly}
                onChange={(e) => setAdmin('hidden', e.target.checked || undefined)}
              />
              Hidden
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
