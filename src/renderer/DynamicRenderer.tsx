import React from 'react'
import { registry } from './registry'
import { FallbackRenderer } from './FallbackRenderer'
import type { DynamicRendererProps, PopulatedBlockInstance } from './types'

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
 * DynamicRenderer — renders a page layout composed of block instances.
 *
 * @example
 * ```tsx
 * import { DynamicRenderer } from '@/renderer'
 *
 * export default function Page({ page }) {
 *   return <DynamicRenderer layout={page.layout} />
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
