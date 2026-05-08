import type { ComponentType } from 'react'
import type { BlockSchema, BlockData, NestedBlockValue } from '@/validation/types'

// Re-export for convenience so callers can import from '@/renderer'
export type { NestedBlockValue }

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * Props passed to every registered block component.
 */
// T does not need to extend BlockData — concrete block components use specific interfaces
export interface BlockComponentProps<T = BlockData> {
  data: T
  schema: BlockSchema
  instanceId?: string | null
  anchor?: string | null
}

export type BlockComponent<T = BlockData> = ComponentType<BlockComponentProps<T>>

/**
 * Registration entry kept in the registry map.
 */
export interface RegistryEntry {
  component: BlockComponent
  /** Optional display name (defaults to slug). */
  displayName?: string
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

/**
 * A single block instance as stored on a page's layout array (populated).
 */
export interface PopulatedBlockInstance {
  id?: string | number
  instanceId?: string | null
  label?: string | null
  anchor?: string | null
  hidden?: boolean | null
  blockDefinition: {
    id: string | number
    slug: string
    name: string
  }
  blockVersion: {
    id: string | number
    versionNumber: number
    schema: BlockSchema
  }
  data: BlockData
}

export interface DynamicRendererProps {
  layout: PopulatedBlockInstance[]
  /** Override the fallback renderer for unknown block types. */
  customFallback?: ComponentType<FallbackRendererProps>
}

// ─── Feature 4: Nested Block Renderer ────────────────────────────────────────

/**
 * Props for the NestedBlocksRenderer component.
 * Used to render blocks stored in a 'blocks' schema field.
 */
export interface NestedBlocksRendererProps {
  /** The array of nested block values from a 'blocks' field. */
  blocks: NestedBlockValue[] | null | undefined
  /** Current nesting depth (used to enforce maxDepth). Start at 0. */
  depth?: number
  /** Maximum allowed nesting depth (default: 3). */
  maxDepth?: number
  /** Override the fallback renderer for unregistered block types. */
  customFallback?: ComponentType<FallbackRendererProps>
}

// ─── Field Renderer ───────────────────────────────────────────────────────────

export interface FieldRendererProps {
  value: unknown
  fieldType: string
  label?: string
  /** Extra context (e.g. nested schema for arrays) */
  schema?: BlockSchema
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

export interface FallbackRendererProps {
  blockSlug: string
  data: BlockData
  schema?: BlockSchema
}
