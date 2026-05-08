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
  BlocksField,
  NestedBlockValue,
  ValidationRules,
} from './types'

// ─── Internal ─────────────────────────────────────────────────────────────────

type FieldError = { path: string; message: string }

/**
 * Merges per-field direct constraints with the consolidated validation object.
 * The validation object takes precedence when both are present.
 */
function mergeValidation(field: BlockField): ValidationRules {
  const v = field.validation ?? {}
  const f = field as Record<string, unknown>

  return {
    required: v.required ?? (field.required ? true : undefined),
    minLength: v.minLength ?? (f.minLength as number | undefined),
    maxLength: v.maxLength ?? (f.maxLength as number | undefined),
    regex: v.regex,
    min: v.min ?? (f.min as number | undefined),
    max: v.max ?? (f.max as number | undefined),
    step: v.step,
    integerOnly: v.integerOnly,
    minRows: v.minRows ?? (f.minRows as number | undefined),
    maxRows: v.maxRows ?? (f.maxRows as number | undefined),
    uniqueItems: v.uniqueItems,
    allowedMimeTypes: v.allowedMimeTypes ?? (f.allowedMimeTypes as string[] | undefined),
    maxFileSize: v.maxFileSize,
    maxSelections: v.maxSelections,
  }
}

function validateFieldValue(
  field: BlockField,
  value: unknown,
  path: string,
  errors: FieldError[],
): void {
  const rules = mergeValidation(field)

  // ── Required check ────────────────────────────────────────────────────────

  const isEmpty =
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)

  const isRequired = rules.required ?? field.required
  if (isRequired && isEmpty) {
    errors.push({ path, message: `"${field.label ?? field.name}" is required.` })
    return
  }

  if (isEmpty) return // optional and empty — ok

  // ── Type-specific + advanced validation ───────────────────────────────────

  switch (field.type) {
    // ── Strings ──────────────────────────────────────────────────────────────
    case 'text':
    case 'textarea':
    case 'url':
    case 'email':
    case 'color': {
      if (typeof value !== 'string') {
        errors.push({ path, message: `Expected a string.` })
        break
      }

      // Length
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push({ path, message: `Minimum length is ${rules.minLength} characters.` })
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push({ path, message: `Maximum length is ${rules.maxLength} characters.` })
      }

      // Regex (Feature 2)
      if (rules.regex) {
        try {
          if (!new RegExp(rules.regex).test(value)) {
            errors.push({ path, message: `Value does not match required format (${rules.regex}).` })
          }
        } catch {
          // invalid regex was caught at schema-validation time; skip silently here
        }
      }

      // Format checks
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

    // ── Number ────────────────────────────────────────────────────────────────
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        errors.push({ path, message: `Expected a number.` })
        break
      }
      const f = field as NumberField

      const effMin = rules.min ?? f.min
      const effMax = rules.max ?? f.max

      if (effMin !== undefined && value < effMin) {
        errors.push({ path, message: `Minimum value is ${effMin}.` })
      }
      if (effMax !== undefined && value > effMax) {
        errors.push({ path, message: `Maximum value is ${effMax}.` })
      }

      // Feature 2: step
      if (rules.step !== undefined && rules.step > 0) {
        const remainder = (value - (effMin ?? 0)) % rules.step
        if (Math.abs(remainder) > Number.EPSILON) {
          errors.push({ path, message: `Value must be a multiple of ${rules.step}.` })
        }
      }

      // Feature 2: integerOnly
      if (rules.integerOnly && !Number.isInteger(value)) {
        errors.push({ path, message: `Value must be an integer.` })
      }
      break
    }

    // ── Checkbox ──────────────────────────────────────────────────────────────
    case 'checkbox': {
      if (typeof value !== 'boolean') {
        errors.push({ path, message: `Expected a boolean.` })
      }
      break
    }

    // ── Select ────────────────────────────────────────────────────────────────
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

    // ── Multi-select ──────────────────────────────────────────────────────────
    case 'multiselect': {
      const f = field as MultiSelectField
      const validValues = new Set(f.options.map((o) => o.value))
      if (!Array.isArray(value)) {
        errors.push({ path, message: `Expected an array of selected values.` })
        break
      }
      const selected = value as unknown[]
      selected.forEach((v, i) => {
        if (typeof v !== 'string' || !validValues.has(v)) {
          errors.push({
            path: `${path}[${i}]`,
            message: `"${v}" is not a valid option.`,
          })
        }
      })

      // Feature 2: maxSelections
      if (rules.maxSelections !== undefined && selected.length > rules.maxSelections) {
        errors.push({
          path,
          message: `Maximum ${rules.maxSelections} selection(s) allowed.`,
        })
      }
      break
    }

    // ── Array ─────────────────────────────────────────────────────────────────
    case 'array': {
      const f = field as ArrayField
      if (!Array.isArray(value)) {
        errors.push({ path, message: `Expected an array.` })
        break
      }
      const arr = value as BlockData[]

      const effMinRows = rules.minRows ?? f.minRows
      const effMaxRows = rules.maxRows ?? f.maxRows

      if (effMinRows !== undefined && arr.length < effMinRows) {
        errors.push({ path, message: `Minimum ${effMinRows} row(s) required.` })
      }
      if (effMaxRows !== undefined && arr.length > effMaxRows) {
        errors.push({ path, message: `Maximum ${effMaxRows} row(s) allowed.` })
      }

      // Feature 2: uniqueItems (shallow JSON equality)
      if (rules.uniqueItems && arr.length > 1) {
        const serialised = arr.map((item) => JSON.stringify(item))
        const seen = new Set<string>()
        serialised.forEach((s, i) => {
          if (seen.has(s)) {
            errors.push({ path: `${path}[${i}]`, message: `Duplicate row detected.` })
          }
          seen.add(s)
        })
      }

      arr.forEach((row, i) => {
        validateData({ fields: f.fields }, row, `${path}[${i}]`, errors)
      })
      break
    }

    // ── Group ─────────────────────────────────────────────────────────────────
    case 'group': {
      const f = field as GroupField
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push({ path, message: `Expected an object.` })
        break
      }
      validateData({ fields: f.fields }, value as BlockData, path, errors)
      break
    }

    // ── Media / Relationship ──────────────────────────────────────────────────
    case 'image':
    case 'file':
    case 'relationship': {
      const isRef =
        typeof value === 'string' ||
        (typeof value === 'object' && value !== null && 'id' in value)
      if (!isRef) {
        errors.push({ path, message: `Expected a document ID or reference object.` })
      }

      // Feature 2: maxFileSize (file/image only — value is an uploaded media doc)
      if (
        rules.maxFileSize !== undefined &&
        typeof value === 'object' &&
        value !== null &&
        'filesize' in value &&
        typeof (value as Record<string, unknown>).filesize === 'number'
      ) {
        const filesize = (value as Record<string, number>).filesize
        if (filesize > rules.maxFileSize) {
          errors.push({
            path,
            message: `File size (${filesize} bytes) exceeds maximum of ${rules.maxFileSize} bytes.`,
          })
        }
      }
      break
    }

    // ── Date ──────────────────────────────────────────────────────────────────
    case 'date': {
      if (typeof value !== 'string' || isNaN(Date.parse(value))) {
        errors.push({ path, message: `Expected a valid ISO date string.` })
      }
      break
    }

    // ── Rich text / JSON ──────────────────────────────────────────────────────
    case 'richtext':
    case 'json': {
      // Structural validity not checked — any value accepted
      break
    }

    // ── Feature 4: Blocks field ───────────────────────────────────────────────
    case 'blocks': {
      const f = field as BlocksField
      if (!Array.isArray(value)) {
        errors.push({ path, message: `Expected an array of block instances.` })
        break
      }
      const blocks = value as NestedBlockValue[]

      if (f.minBlocks !== undefined && blocks.length < f.minBlocks) {
        errors.push({ path, message: `Minimum ${f.minBlocks} block(s) required.` })
      }
      if (f.maxBlocks !== undefined && blocks.length > f.maxBlocks) {
        errors.push({ path, message: `Maximum ${f.maxBlocks} block(s) allowed.` })
      }

      blocks.forEach((block, i) => {
        const bp = `${path}[${i}]`
        if (!block || typeof block !== 'object') {
          errors.push({ path: bp, message: `Block item must be an object.` })
          return
        }
        if (!block.blockType || typeof block.blockType !== 'string') {
          errors.push({ path: `${bp}.blockType`, message: `"blockType" is required.` })
          return
        }
        if (
          f.allowedBlocks &&
          f.allowedBlocks.length > 0 &&
          !f.allowedBlocks.includes(block.blockType)
        ) {
          errors.push({
            path: `${bp}.blockType`,
            message: `Block type "${block.blockType}" is not in allowedBlocks: [${f.allowedBlocks.join(', ')}].`,
          })
        }
        // Block data is opaque at this level; deep validation is done by individual block validators
      })
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
 * Applies both per-field type rules and the consolidated validation object.
 */
export function validateBlockData(schema: BlockSchema, data: BlockData): DataValidationResult {
  const errors: FieldError[] = []
  validateData(schema, data, '', errors)
  return { valid: errors.length === 0, errors }
}
