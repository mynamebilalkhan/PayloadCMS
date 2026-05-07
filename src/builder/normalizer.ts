import type { RawFieldInput, RawSchemaInput } from './types'
import type { BlockSchema, BlockField, SelectOption, FieldType } from '@/validation/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KNOWN_TYPES: Set<FieldType> = new Set([
  'text',
  'textarea',
  'richtext',
  'number',
  'checkbox',
  'select',
  'multiselect',
  'date',
  'image',
  'file',
  'url',
  'email',
  'color',
  'array',
  'group',
  'relationship',
  'json',
])

/**
 * Normalise a string option (shorthand) or an option object.
 */
function normaliseOption(opt: unknown): SelectOption {
  if (typeof opt === 'string') {
    return { label: opt, value: opt.toLowerCase().replace(/\s+/g, '-') }
  }
  if (opt && typeof opt === 'object') {
    const o = opt as Record<string, unknown>
    const value = String(o.value ?? o.label ?? '').toLowerCase().replace(/\s+/g, '-')
    const label = String(o.label ?? o.value ?? value)
    return { label, value }
  }
  return { label: String(opt), value: String(opt) }
}

/**
 * Strip undefined / null top-level keys and unknown extras from a field.
 */
function pickFieldProps(
  raw: RawFieldInput,
  allowed: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of allowed) {
    const v = raw[key]
    if (v !== undefined && v !== null) {
      out[key] = v
    }
  }
  return out
}

// ─── Field normaliser ──────────────────────────────────────────────────────────

function normaliseField(raw: RawFieldInput): BlockField {
  const type = (raw.type ?? 'text') as FieldType

  // Fall back to 'text' for unknown types (normaliser is lenient; validator is strict)
  const resolvedType: FieldType = KNOWN_TYPES.has(type) ? type : 'text'

  const base: Record<string, unknown> = {
    name: String(raw.name ?? '').trim(),
    type: resolvedType,
  }

  if (raw.label) base.label = String(raw.label)
  if (raw.required !== undefined) base.required = Boolean(raw.required)
  if (raw.admin && typeof raw.admin === 'object') base.admin = raw.admin

  switch (resolvedType) {
    case 'text':
    case 'textarea': {
      if (raw.minLength !== undefined) base.minLength = Number(raw.minLength)
      if (raw.maxLength !== undefined) base.maxLength = Number(raw.maxLength)
      if (raw.defaultValue !== undefined) base.defaultValue = raw.defaultValue
      break
    }

    case 'number': {
      if (raw.min !== undefined) base.min = Number(raw.min)
      if (raw.max !== undefined) base.max = Number(raw.max)
      if (raw.defaultValue !== undefined) base.defaultValue = raw.defaultValue
      break
    }

    case 'checkbox': {
      if (raw.defaultValue !== undefined) base.defaultValue = Boolean(raw.defaultValue)
      break
    }

    case 'select':
    case 'multiselect': {
      const rawOpts = Array.isArray(raw.options) ? raw.options : []
      base.options = rawOpts.map(normaliseOption)
      if (raw.defaultValue !== undefined) base.defaultValue = raw.defaultValue
      break
    }

    case 'date': {
      if (raw.timeFormat !== undefined) base.timeFormat = Boolean(raw.timeFormat)
      break
    }

    case 'array': {
      const subFields = Array.isArray(raw.fields)
        ? raw.fields.map(normaliseField)
        : []
      base.fields = subFields
      if (raw.minRows !== undefined) base.minRows = Number(raw.minRows)
      if (raw.maxRows !== undefined) base.maxRows = Number(raw.maxRows)
      break
    }

    case 'group': {
      const subFields = Array.isArray(raw.fields)
        ? raw.fields.map(normaliseField)
        : []
      base.fields = subFields
      break
    }

    case 'relationship': {
      if (raw.collection) base.collection = String(raw.collection)
      if (raw.hasMany !== undefined) base.hasMany = Boolean(raw.hasMany)
      break
    }

    case 'file': {
      if (Array.isArray(raw.allowedMimeTypes)) base.allowedMimeTypes = raw.allowedMimeTypes
      break
    }
  }

  return base as unknown as BlockField
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Normalise a raw builder schema input into a clean BlockSchema.
 * Does not throw — returns the best-effort normalised schema.
 * Run validateBlockSchema() afterwards for strict checking.
 */
export function normaliseSchema(raw: RawSchemaInput): BlockSchema {
  const fields = Array.isArray(raw.fields) ? raw.fields.map(normaliseField) : []

  const schema: BlockSchema = { fields }

  if (raw.layout === 'sidebar' || raw.layout === 'tabs') {
    schema.layout = raw.layout
  } else {
    schema.layout = 'default'
  }

  return schema
}
