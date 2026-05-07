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

// ─── Field Definitions ────────────────────────────────────────────────────────

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
    condition?: string // serialised condition expression (safe eval via predicate map)
  }
}

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

// ─── Block Schema ─────────────────────────────────────────────────────────────

export interface BlockSchema {
  fields: BlockField[]
  /** Optional layout hints for the admin UI */
  layout?: 'default' | 'sidebar' | 'tabs'
}

// ─── Validation Result ────────────────────────────────────────────────────────

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
