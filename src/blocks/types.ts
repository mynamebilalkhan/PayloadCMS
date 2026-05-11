/**
 * Shared types for the prebuilt block system.
 * Every block exports: component, schema, presets.
 */

export interface BlockPreset {
  id: string
  name: string
  description?: string
  data: Record<string, unknown>
}
