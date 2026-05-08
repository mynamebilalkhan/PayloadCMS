import React from 'react'
import { registry } from './registry'
import { FallbackRenderer } from './FallbackRenderer'
import type { DynamicRendererProps, NestedBlocksRendererProps, PopulatedBlockInstance } from './types'

// ─── Single block renderer ────────────────────────────────────────────────────

interface BlockInstanceRendererProps {
  instance: PopulatedBlockInstance
  customFallback?: DynamicRendererProps['customFallback']
}

function BlockInstanceRenderer({ instance, customFallback }: BlockInstanceRendererProps) {
  const { blockDefinition, blockVersion, data, hidden, anchor, instanceId } = instance

  if (hidden) return null

  const blockSlug = blockDefinition?.slug
  if (!blockSlug) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DynamicRenderer] Block instance missing blockDefinition.slug:', instance)
    }
    return null
  }

  const schema = blockVersion?.schema
  const Component = registry.get(blockSlug)

  const wrapperProps: React.HTMLAttributes<HTMLElement> = {}
  if (anchor) wrapperProps.id = anchor

  if (!Component) {
    const Fallback = customFallback ?? FallbackRenderer
    return (
      <div {...wrapperProps}>
        <Fallback blockSlug={blockSlug} data={data} schema={schema} />
      </div>
    )
  }

  return (
    <div {...wrapperProps}>
      <Component data={data} schema={schema!} instanceId={instanceId} anchor={anchor} />
    </div>
  )
}

// ─── Main renderer ────────────────────────────────────────────────────────────

/**
 * DynamicRenderer — renders a page layout composed of populated block instances.
 *
 * @example
 * ```tsx
 * import { DynamicRenderer } from '@/renderer'
 *
 * export default function Page({ page }) {
 *   return <DynamicRenderer layout={page.dbLayout} />
 * }
 * ```
 */
export function DynamicRenderer({ layout, customFallback }: DynamicRendererProps) {
  if (!Array.isArray(layout) || layout.length === 0) return null

  return (
    <>
      {layout.map((instance, index) => {
        const key = instance.instanceId ?? instance.id ?? `block-${index}`
        return (
          <BlockInstanceRenderer
            key={key}
            instance={instance}
            customFallback={customFallback}
          />
        )
      })}
    </>
  )
}

// ─── Feature 4: Nested Block Renderer ────────────────────────────────────────

/**
 * NestedBlocksRenderer — renders a 'blocks' field value recursively.
 *
 * Use this inside custom block components when their data contains a field
 * of type 'blocks' and you want to render those nested blocks using the
 * same registry. Enforces a maximum nesting depth to prevent infinite recursion.
 *
 * @example
 * ```tsx
 * import { NestedBlocksRenderer } from '@/renderer'
 *
 * export function SectionBlock({ data }) {
 *   return (
 *     <section>
 *       <h2>{data.title}</h2>
 *       <NestedBlocksRenderer blocks={data.children} />
 *     </section>
 *   )
 * }
 * ```
 */
export function NestedBlocksRenderer({
  blocks,
  depth = 0,
  maxDepth = 3,
  customFallback,
}: NestedBlocksRendererProps) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  if (depth >= maxDepth) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[NestedBlocksRenderer] Max nesting depth (${maxDepth}) reached. Blocks not rendered.`,
      )
    }
    return null
  }

  const Fallback = customFallback ?? FallbackRenderer

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? `nested-${block.blockType}-${index}`
        const Component = registry.get(block.blockType)

        if (!Component) {
          return (
            <Fallback
              key={key}
              blockSlug={block.blockType}
              data={block.data}
            />
          )
        }

        return (
          <Component
            key={key}
            data={block.data}
            // Minimal schema — nested block components use typed data, not generic schema rendering
            schema={{ fields: [] }}
            instanceId={null}
            anchor={null}
          />
        )
      })}
    </>
  )
}
