import type {
  BlockSchema,
  BlockField,
  ValidationResult,
  FieldType,
} from './types'

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_FIELD_TYPES: Set<FieldType> = new Set([
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

const CONTAINER_TYPES = new Set<FieldType>(['array', 'group'])
const LEAF_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_]*$/

// ─── Internal helpers ─────────────────────────────────────────────────────────

function validateField(field: unknown, path: string, errors: string[], warnings: string[]): void {
  if (!field || typeof field !== 'object' || Array.isArray(field)) {
    errors.push(`${path}: must be a non-array object.`)
    return
  }

  const f = field as Record<string, unknown>

  // name
  if (typeof f.name !== 'string' || !f.name.trim()) {
    errors.push(`${path}: "name" is required and must be a non-empty string.`)
  } else if (!LEAF_NAME_RE.test(f.name)) {
    errors.push(
      `${path}.name "${f.name}": must start with a letter and contain only letters, digits, or underscores.`,
    )
  }

  // type
  if (typeof f.type !== 'string') {
    errors.push(`${path}: "type" is required.`)
    return // cannot continue without a valid type
  }

  if (!VALID_FIELD_TYPES.has(f.type as FieldType)) {
    errors.push(`${path}: unknown field type "${f.type}".`)
    return
  }

  const type = f.type as FieldType

  // label (optional but recommended)
  if (f.label !== undefined && typeof f.label !== 'string') {
    errors.push(`${path}: "label" must be a string.`)
  } else if (f.label === undefined) {
    warnings.push(`${path}: no "label" defined; consider adding one for admin UX.`)
  }

  // required
  if (f.required !== undefined && typeof f.required !== 'boolean') {
    errors.push(`${path}: "required" must be a boolean.`)
  }

  // ── type-specific rules ──────────────────────────────────────────────────

  if (type === 'select' || type === 'multiselect') {
    if (!Array.isArray(f.options) || f.options.length === 0) {
      errors.push(`${path}: "${type}" fields must have a non-empty "options" array.`)
    } else {
      ;(f.options as unknown[]).forEach((opt, i) => {
        if (!opt || typeof opt !== 'object') {
          errors.push(`${path}.options[${i}]: must be an object.`)
          return
        }
        const o = opt as Record<string, unknown>
        if (typeof o.label !== 'string' || !o.label.trim()) {
          errors.push(`${path}.options[${i}]: "label" is required.`)
        }
        if (typeof o.value !== 'string' || !o.value.trim()) {
          errors.push(`${path}.options[${i}]: "value" is required.`)
        }
      })
    }
  }

  if (type === 'number') {
    if (f.min !== undefined && typeof f.min !== 'number') {
      errors.push(`${path}: "min" must be a number.`)
    }
    if (f.max !== undefined && typeof f.max !== 'number') {
      errors.push(`${path}: "max" must be a number.`)
    }
    if (
      typeof f.min === 'number' &&
      typeof f.max === 'number' &&
      f.min > f.max
    ) {
      errors.push(`${path}: "min" (${f.min}) must be ≤ "max" (${f.max}).`)
    }
  }

  if (type === 'text' || type === 'textarea') {
    if (f.minLength !== undefined && typeof f.minLength !== 'number') {
      errors.push(`${path}: "minLength" must be a number.`)
    }
    if (f.maxLength !== undefined && typeof f.maxLength !== 'number') {
      errors.push(`${path}: "maxLength" must be a number.`)
    }
  }

  if (type === 'relationship') {
    if (typeof f.collection !== 'string' || !f.collection.trim()) {
      errors.push(`${path}: "relationship" fields require a non-empty "collection" string.`)
    }
  }

  // ── containers – recurse ─────────────────────────────────────────────────

  if (CONTAINER_TYPES.has(type)) {
    if (!Array.isArray(f.fields) || f.fields.length === 0) {
      errors.push(`${path}: "${type}" fields must have a non-empty "fields" array.`)
    } else {
      validateFields(f.fields as unknown[], `${path}.fields`, errors, warnings)
    }

    if (type === 'array') {
      if (f.minRows !== undefined && typeof f.minRows !== 'number') {
        errors.push(`${path}: "minRows" must be a number.`)
      }
      if (f.maxRows !== undefined && typeof f.maxRows !== 'number') {
        errors.push(`${path}: "maxRows" must be a number.`)
      }
    }
  }
}

function validateFields(
  fields: unknown[],
  path: string,
  errors: string[],
  warnings: string[],
): void {
  const names = new Set<string>()

  fields.forEach((field, index) => {
    const fieldPath = `${path}[${index}]`
    validateField(field, fieldPath, errors, warnings)

    // Duplicate name detection at the same level
    const f = field as Record<string, unknown>
    if (typeof f.name === 'string' && f.name) {
      if (names.has(f.name)) {
        errors.push(`${path}: duplicate field name "${f.name}".`)
      }
      names.add(f.name)
    }
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validates a BlockSchema object.
 * Returns a ValidationResult with errors (blocking) and warnings (non-blocking).
 */
export function validateBlockSchema(schema: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return {
      valid: false,
      errors: ['Schema must be a non-array object with a "fields" property.'],
      warnings: [],
    }
  }

  const s = schema as Record<string, unknown>

  if (!Array.isArray(s.fields)) {
    errors.push('Schema must have a "fields" array.')
  } else if (s.fields.length === 0) {
    warnings.push('Schema has no fields defined.')
  } else {
    validateFields(s.fields, 'schema.fields', errors, warnings)
  }

  if (
    s.layout !== undefined &&
    !['default', 'sidebar', 'tabs'].includes(s.layout as string)
  ) {
    errors.push(`schema.layout must be one of: "default", "sidebar", "tabs".`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Strict version — throws if invalid.
 */
export function assertValidBlockSchema(schema: unknown, context = 'Schema'): BlockSchema {
  const result = validateBlockSchema(schema)
  if (!result.valid) {
    throw new Error(`${context} validation failed:\n  - ${result.errors.join('\n  - ')}`)
  }
  return schema as BlockSchema
}
