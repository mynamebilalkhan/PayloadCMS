/**
 * Shared types for the prebuilt block system.
 * Every block exports: component, schema, presets.
 */

export type BlockCategory =
  | 'layout'
  | 'content'
  | 'media'
  | 'navigation'
  | 'interactive'
  | 'data-display'
  | 'utility'

export interface BlockPreset {
  id: string
  name: string
  description?: string
  /** URL or path to a preview image shown in the preset picker. */
  thumbnail?: string
  /** Broad grouping for filter chips in the preset picker. */
  category?: BlockCategory
  /** Free-form tags for search, e.g. ['dark', 'gradient', 'SaaS']. */
  tags?: string[]
  data: Record<string, unknown>
}
