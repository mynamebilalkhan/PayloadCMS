import type {
  BlockSchema,
  BlockField,
  BlockData,
  DataValidationResult,
  ArrayField,
  GroupField,
  SelectField,
  MultiSelectField,
  NumberField,
  TextField,
  TextareaField,
} from './types'

// ─── Internal ─────────────────────────────────────────────────────────────────

type FieldError = { path: string; message: string }

function validateFieldValue(
  field: BlockField,
  value: unknown,
  path: string,
  errors: FieldError[],
): void {
  // required check
  const isEmpty =
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)

  if (field.required && isEmpty) {
    errors.push({ path, message: `"${field.label ?? field.name}" is required.` })
    return
  }

  if (isEmpty) return // optional and empty — ok

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'url':
    case 'email':
    case 'color': {
      if (typeof value !== 'string') {
        errors.push({ path, message: `Expected a string.` })
        break
      }
      const f = field as TextField | TextareaField
      if ('minLength' in f && f.minLength !== undefined && value.length < f.minLength) {
        errors.push({ path, message: `Minimum length is ${f.minLength}.` })
      }
      if ('maxLength' in f && f.maxLength !== undefined && value.length > f.maxLength) {
        errors.push({ path, message: `Maximum length is ${f.maxLength}.` })
      }
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push({ path, message: `Must be a valid email address.` })
      }
      if (field.type === 'url') {
        try {
          new URL(value)
        } catch {
          errors.push({ path, message: `Must be a valid URL.` })
        }
      }
      break
    }

    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        errors.push({ path, message: `Expected a number.` })
        break
      }
      const f = field as NumberField
      if (f.min !== undefined && value < f.min) {
        errors.push({ path, message: `Minimum value is ${f.min}.` })
      }
      if (f.max !== undefined && value > f.max) {
        errors.push({ path, message: `Maximum value is ${f.max}.` })
      }
      break
    }

    case 'checkbox': {
      if (typeof value !== 'boolean') {
        errors.push({ path, message: `Expected a boolean.` })
      }
      break
    }

    case 'select': {
      const f = field as SelectField
      const validValues = f.options.map((o) => o.value)
      if (typeof value !== 'string' || !validValues.includes(value)) {
        errors.push({
          path,
          message: `Must be one of: ${validValues.join(', ')}.`,
        })
      }
      break
    }

    case 'multiselect': {
      const f = field as MultiSelectField
      const validValues = new Set(f.options.map((o) => o.value))
      if (!Array.isArray(value)) {
        errors.push({ path, message: `Expected an array of selected values.` })
        break
      }
      ;(value as unknown[]).forEach((v, i) => {
        if (typeof v !== 'string' || !validValues.has(v)) {
          errors.push({
            path: `${path}[${i}]`,
            message: `"${v}" is not a valid option.`,
          })
        }
      })
      break
    }

    case 'array': {
      const f = field as ArrayField
      if (!Array.isArray(value)) {
        errors.push({ path, message: `Expected an array.` })
        break
      }
      const arr = value as BlockData[]
      if (f.minRows !== undefined && arr.length < f.minRows) {
        errors.push({ path, message: `Minimum ${f.minRows} row(s) required.` })
      }
      if (f.maxRows !== undefined && arr.length > f.maxRows) {
        errors.push({ path, message: `Maximum ${f.maxRows} row(s) allowed.` })
      }
      arr.forEach((row, i) => {
        validateData({ fields: f.fields }, row, `${path}[${i}]`, errors)
      })
      break
    }

    case 'group': {
      const f = field as GroupField
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push({ path, message: `Expected an object.` })
        break
      }
      validateData({ fields: f.fields }, value as BlockData, path, errors)
      break
    }

    case 'image':
    case 'file':
    case 'relationship': {
      // Accept string (ID) or object with id property
      const isRef =
        typeof value === 'string' ||
        (typeof value === 'object' && value !== null && 'id' in value)
      if (!isRef) {
        errors.push({ path, message: `Expected a document ID or reference object.` })
      }
      break
    }

    case 'date': {
      if (typeof value !== 'string' || isNaN(Date.parse(value))) {
        errors.push({ path, message: `Expected a valid ISO date string.` })
      }
      break
    }

    case 'richtext':
    case 'json': {
      // Structural validity not checked here — any object/primitive accepted
      break
    }
  }
}

function validateData(
  schema: Pick<BlockSchema, 'fields'>,
  data: BlockData,
  pathPrefix: string,
  errors: FieldError[],
): void {
  for (const field of schema.fields) {
    const fieldPath = pathPrefix ? `${pathPrefix}.${field.name}` : field.name
    validateFieldValue(field, data[field.name], fieldPath, errors)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validates block instance data against its schema.
 */
export function validateBlockData(schema: BlockSchema, data: BlockData): DataValidationResult {
  const errors: FieldError[] = []
  validateData(schema, data, '', errors)
  return {
    valid: errors.length === 0,
    errors,
  }
}
