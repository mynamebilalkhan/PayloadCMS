import React from 'react'
import type { FallbackRendererProps } from './types'
import { FieldRenderer } from './FieldRenderer'

/**
 * FallbackRenderer — renders block data field-by-field when no registered
 * component exists for the block slug.
 *
 * Production behaviour: renders a neutral layout so the page doesn't break.
 * Development behaviour: also shows a warning banner indicating the block
 * component is not registered.
 */
export function FallbackRenderer({ blockSlug, data, schema }: FallbackRendererProps) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <section
      className="block-fallback border border-dashed border-gray-300 rounded p-4 my-4"
      data-block-slug={blockSlug}
    >
      {isDev && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
          <strong>Dev:</strong> No component registered for block{' '}
          <code className="font-mono">"{blockSlug}"</code>. Rendering raw fields.
        </div>
      )}

      {schema?.fields ? (
        <div className="space-y-2">
          {schema.fields.map((field) => (
            <FieldRenderer
              key={field.name}
              fieldType={field.type}
              value={data[field.name]}
              label={field.label ?? field.name}
            />
          ))}
        </div>
      ) : (
        // No schema available — last resort JSON dump (dev only)
        isDev && (
          <pre className="text-xs bg-gray-50 rounded p-2 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )
      )}
    </section>
  )
}
