'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { BlocksField, BlockSchema, NestedBlockValue } from '@/validation/types'
import { SchemaForm } from './SchemaForm'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  field: BlocksField
  value: NestedBlockValue[]
  onChange: (value: unknown) => void
  readOnly?: boolean
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = {
  padding: '0.125rem 0.375rem',
  fontSize: '0.75rem',
  background: 'transparent',
  border: '1px solid var(--theme-elevation-200, #e5e7eb)',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  lineHeight: 1.4,
  color: 'var(--theme-elevation-700, #374151)',
}

// ─── Unique ID generator ──────────────────────────────────────────────────────

let _seq = 0
function newId(): string {
  return `nb-${Date.now()}-${(_seq++).toString(36)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlocksFieldInput({ field, value, onChange, readOnly }: Props) {
  const blocks: NestedBlockValue[] = Array.isArray(value) ? value : []

  // Cached schemas keyed by blockType slug
  const [schemas, setSchemas] = useState<Record<string, BlockSchema | null>>({})
  const [loadingSchemas, setLoadingSchemas] = useState(false)
  const schemasRef = useRef(schemas)
  useEffect(() => { schemasRef.current = schemas }, [schemas])

  // UI state
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [showAddMenu, setShowAddMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const allowed = field.allowedBlocks ?? []
  const atMax = field.maxBlocks != null && blocks.length >= field.maxBlocks

  // Fetch schemas for all allowed blocks once on mount
  useEffect(() => {
    if (allowed.length === 0) return

    setLoadingSchemas(true)
    const params = new URLSearchParams({ depth: '2' })
    allowed.forEach((slug, i) => params.append(`where[slug][in][${i}]`, slug))

    fetch(`/api/block-definitions?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, BlockSchema | null> = {}
        for (const doc of data.docs ?? []) {
          if (typeof doc.slug === 'string') {
            map[doc.slug] = doc.currentVersion?.schema ?? null
          }
        }
        setSchemas(map)
      })
      .catch(() => {})
      .finally(() => setLoadingSchemas(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close the "Add block" dropdown when clicking outside
  useEffect(() => {
    if (!showAddMenu) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showAddMenu])

  // ── Mutations ───────────────────────────────────────────────────────────────

  function addBlock(blockType: string) {
    const next: NestedBlockValue = { id: newId(), blockType, data: {} }
    onChange([...blocks, next])
    setShowAddMenu(false)
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index))
  }

  function updateBlockData(index: number, data: Record<string, unknown>) {
    const next = [...blocks]
    next[index] = { ...next[index], data }
    onChange(next)
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= blocks.length) return
    const next = [...blocks]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {blocks.length === 0 && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--theme-elevation-400, #9ca3af)',
            marginBottom: '0.5rem',
          }}
        >
          No nested blocks. Click &ldquo;Add Block&rdquo; to add one.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {blocks.map((block, index) => {
          const blockId = block.id ?? `block-${index}`
          const isCollapsed = collapsed.has(blockId)
          const blockSchema = schemas[block.blockType]

          return (
            <div
              key={blockId}
              style={{
                border: '1px solid var(--theme-elevation-150, #e5e7eb)',
                borderRadius: '0.375rem',
                overflow: 'hidden',
              }}
            >
              {/* Block header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.4rem 0.75rem',
                  background: 'var(--theme-elevation-100, #f3f4f6)',
                  borderBottom: isCollapsed
                    ? 'none'
                    : '1px solid var(--theme-elevation-150, #e5e7eb)',
                }}
              >
                {/* Collapse toggle */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(blockId)}
                  style={{ ...iconBtn, fontFamily: 'monospace', fontSize: '0.625rem' }}
                  title={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  {isCollapsed ? '▶' : '▼'}
                </button>

                {/* Block type badge */}
                <span
                  style={{
                    flex: 1,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: 'var(--theme-text, #111827)',
                  }}
                >
                  {block.blockType}
                </span>

                {/* Reorder + remove (not in readOnly) */}
                {!readOnly && (
                  <>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveBlock(index, -1)}
                        title="Move up"
                        style={iconBtn}
                      >
                        ↑
                      </button>
                    )}
                    {index < blocks.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 1)}
                        title="Move down"
                        style={iconBtn}
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      title="Remove block"
                      style={{ ...iconBtn, color: 'var(--theme-error-500, #ef4444)' }}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>

              {/* Block data form */}
              {!isCollapsed && (
                <div style={{ padding: '0.75rem' }}>
                  {loadingSchemas ? (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--theme-elevation-400, #9ca3af)',
                      }}
                    >
                      Loading schema…
                    </p>
                  ) : blockSchema ? (
                    <SchemaForm
                      schema={blockSchema}
                      value={block.data}
                      onChange={(updated) => updateBlockData(index, updated)}
                      readOnly={readOnly}
                    />
                  ) : schemas[block.blockType] === null ? (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--theme-error-500, #ef4444)',
                      }}
                    >
                      Schema not found for &ldquo;{block.blockType}&rdquo;. Is the block
                      definition published?
                    </p>
                  ) : (
                    // Schema hasn't loaded yet (initial state before fetch resolves)
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--theme-elevation-400, #9ca3af)',
                      }}
                    >
                      Fetching schema…
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add block */}
      {!readOnly && !atMax && (
        <div style={{ position: 'relative', display: 'inline-block', marginTop: '0.75rem' }}>
          {allowed.length === 0 ? (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--theme-elevation-400, #9ca3af)',
                fontStyle: 'italic',
              }}
            >
              No allowedBlocks configured for this field.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowAddMenu((v) => !v)}
                style={{
                  padding: '0.375rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--theme-text, #111827)',
                  background: 'var(--theme-elevation-0, #fff)',
                  border: '1px solid var(--theme-elevation-300, #d1d5db)',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                + Add Block
              </button>

              {showAddMenu && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.25rem)',
                    left: 0,
                    background: 'var(--theme-elevation-0, #fff)',
                    border: '1px solid var(--theme-elevation-200, #e5e7eb)',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 20,
                    minWidth: '180px',
                    overflow: 'hidden',
                  }}
                >
                  {allowed.map((slug) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => addBlock(slug)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.875rem',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)',
                        cursor: 'pointer',
                        color: 'var(--theme-text, #111827)',
                      }}
                    >
                      {slug}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {atMax && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--theme-elevation-400, #9ca3af)',
            marginTop: '0.5rem',
          }}
        >
          Maximum {field.maxBlocks} block{field.maxBlocks === 1 ? '' : 's'} reached.
        </p>
      )}
    </div>
  )
}
