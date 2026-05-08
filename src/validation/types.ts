// ─── Field Types ───────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'image'
  | 'file'
  | 'url'
  | 'email'
  | 'color'
  | 'array'
  | 'group'
  | 'relationship'
  | 'json'
  | 'blocks'

// ─── Feature 1: Conditional Logic ────────────────────────────────────────────

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'exists'
  | 'empty'

export interface ConditionRule {
  /** Name of the sibling field to read from (dot-notation supported for nested). */
  field: string
  operator: ConditionOperator
  /** Comparison value. Not used for 'exists' / 'empty' operators. */
  value?: unknown
}

// ─── Feature 2: Advanced Validation Rules ────────────────────────────────────

export interface ValidationRules {
  /** Override / supplement field.required */
  required?: boolean
  /** Text / textarea minimum character count */
  minLength?: number
  /** Text / textarea maximum character count */
  maxLength?: number
  /** Regular expression the value must match (text / textarea / url / email) */
  regex?: string
  /** Number minimum value */
  min?: number
  /** Number maximum value */
  max?: number
  /** Number must be a multiple of this value */
  step?: number
  /** Number must be an integer */
  integerOnly?: boolean
  /** Array minimum row count */
  minRows?: number
  /** Array maximum row count */
  maxRows?: number
  /** Array items must be unique (shallow JSON equality) */
  uniqueItems?: boolean
  /** Allowed MIME types for file fields (e.g. ["image/*", "application/pdf"]) */
  allowedMimeTypes?: string[]
  /** Maximum file size in bytes */
  maxFileSize?: number
  /** Maximum number of selections for multiselect fields */
  maxSelections?: number
}

// ─── Feature 3: Visual UI Metadata ───────────────────────────────────────────

export type UIWidth = 'full' | 'half' | 'third' | 'quarter'

export interface UIMetadata {
  /** Admin tab this field belongs to (creates a tab if it doesn't exist) */
  tab?: string
  /** Section within the tab (creates a section if it doesn't exist) */
  section?: string
  /** Responsive width hint for the admin grid */
  width?: UIWidth
  /** Whether this field's section starts collapsed */
  collapsed?: boolean
  /** Sort order within its section (lower = first; unset fields go last) */
  order?: number
}

// ─── Base Field ───────────────────────────────────────────────────────────────

export interface BaseField {
  name: string
  type: FieldType
  label?: string
  required?: boolean
  admin?: {
    description?: string
    readOnly?: boolean
    hidden?: boolean
    placeholder?: string
    /** Serialised legacy condition expression (kept for backward compat). */
    condition?: string
  }
  /** Feature 1 — show this field only when all/any conditions pass. */
  conditions?: ConditionRule[]
  /** Feature 1 — how to combine multiple conditions (default: 'AND'). */
  conditionMode?: 'AND' | 'OR'
  /** Feature 2 — consolidated validation rules (supplement or override per-type rules). */
  validation?: ValidationRules
  /** Feature 3 — admin layout metadata for tab/section/width/order. */
  ui?: UIMetadata
}

// ─── Leaf Field Types ─────────────────────────────────────────────────────────

export interface TextField extends BaseField {
  type: 'text'
  minLength?: number
  maxLength?: number
  defaultValue?: string
}

export interface TextareaField extends BaseField {
  type: 'textarea'
  minLength?: number
  maxLength?: number
  defaultValue?: string
}

export interface RichTextField extends BaseField {
  type: 'richtext'
}

export interface NumberField extends BaseField {
  type: 'number'
  min?: number
  max?: number
  defaultValue?: number
}

export interface CheckboxField extends BaseField {
  type: 'checkbox'
  defaultValue?: boolean
}

export interface SelectOption {
  label: string
  value: string
}

export interface SelectField extends BaseField {
  type: 'select'
  options: SelectOption[]
  defaultValue?: string
}

export interface MultiSelectField extends BaseField {
  type: 'multiselect'
  options: SelectOption[]
  defaultValue?: string[]
}

export interface DateField extends BaseField {
  type: 'date'
  timeFormat?: boolean
  defaultValue?: string
}

export interface ImageField extends BaseField {
  type: 'image'
}

export interface FileField extends BaseField {
  type: 'file'
  allowedMimeTypes?: string[]
}

export interface UrlField extends BaseField {
  type: 'url'
}

export interface EmailField extends BaseField {
  type: 'email'
}

export interface ColorField extends BaseField {
  type: 'color'
}

export interface ArrayField extends BaseField {
  type: 'array'
  fields: BlockField[]
  minRows?: number
  maxRows?: number
}

export interface GroupField extends BaseField {
  type: 'group'
  fields: BlockField[]
}

export interface RelationshipField extends BaseField {
  type: 'relationship'
  collection: string
  hasMany?: boolean
}

export interface JsonField extends BaseField {
  type: 'json'
}

// ─── Feature 4: Nested / Composable Blocks ────────────────────────────────────

/**
 * A field that holds an array of nested block instances.
 * Each instance references a registered block slug and carries its own data.
 */
export interface BlocksField extends BaseField {
  type: 'blocks'
  /** Slugs of allowed block definitions. If omitted, all registered blocks are allowed. */
  allowedBlocks?: string[]
  /** Minimum number of block instances required. */
  minBlocks?: number
  /** Maximum number of block instances allowed. */
  maxBlocks?: number
}

/**
 * A single nested block value stored inside a 'blocks' field.
 * This is lighter than PopulatedBlockInstance — no DB relationships required.
 */
export interface NestedBlockValue {
  /** Stable client-generated ID (used as React key). */
  id?: string
  /** The registered block slug (e.g. 'hero-banner'). */
  blockType: string
  /** Field data for this block instance. */
  data: BlockData
}

// ─── Block Field Union ────────────────────────────────────────────────────────

export type BlockField =
  | TextField
  | TextareaField
  | RichTextField
  | NumberField
  | CheckboxField
  | SelectField
  | MultiSelectField
  | DateField
  | ImageField
  | FileField
  | UrlField
  | EmailField
  | ColorField
  | ArrayField
  | GroupField
  | RelationshipField
  | JsonField
  | BlocksField

// ─── Block Schema ─────────────────────────────────────────────────────────────

export interface BlockSchema {
  fields: BlockField[]
  /** Optional layout hint for the admin UI. */
  layout?: 'default' | 'sidebar' | 'tabs'
}

// ─── Validation Results ───────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ─── Block Instance Data ──────────────────────────────────────────────────────

export type BlockData = Record<string, unknown>

export interface DataValidationResult {
  valid: boolean
  errors: Array<{ path: string; message: string }>
}
