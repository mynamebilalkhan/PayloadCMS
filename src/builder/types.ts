import type { BlockSchema, BlockField } from '@/validation/types'

// ─── Builder input types ───────────────────────────────────────────────────────
// These are the "raw" structures the builder UI or CLI emits before normalisation.

export interface RawFieldInput {
  name?: string
  type?: string
  label?: string
  required?: boolean
  // Container fields
  fields?: RawFieldInput[]
  // Select/multiselect
  options?: Array<{ label: string; value: string } | string>
  // Numeric constraints
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  minRows?: number
  maxRows?: number
  // Misc
  defaultValue?: unknown
  collection?: string
  allowedMimeTypes?: string[]
  hasMany?: boolean
  timeFormat?: boolean
  admin?: Record<string, unknown>
  // Feature 1: Conditional Logic
  conditions?: unknown
  conditionMode?: string
  // Feature 2: Advanced Validation
  validation?: Record<string, unknown>
  // Feature 3: UI Metadata
  ui?: Record<string, unknown>
  // Feature 4: Nested Blocks
  allowedBlocks?: string[]
  minBlocks?: number
  maxBlocks?: number
  // Allow arbitrary extra props (passed through as-is)
  [key: string]: unknown
}

export interface RawSchemaInput {
  fields: RawFieldInput[]
  layout?: string
}

// ─── Builder save request ─────────────────────────────────────────────────────

export interface SaveSchemaRequest {
  /** Slug of the block definition (e.g. "hero-banner"). Will be created if not found. */
  blockSlug: string
  /** Human-readable name. Required on first create; optional on updates. */
  name?: string
  description?: string
  category?: string
  /** The raw or normalised schema to publish as a new version. */
  schema: RawSchemaInput | BlockSchema
  /** Optional changelog for this version. */
  changelog?: string
}

export interface SaveSchemaResult {
  success: boolean
  definitionId: string
  versionId: string
  versionNumber: number
  errors?: string[]
  warnings?: string[]
}
