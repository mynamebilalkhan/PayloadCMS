'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BlocksField, BlockSchema, NestedBlockValue } from '@/validation/types'
import { SchemaForm } from './SchemaForm'
import { InsertBlockModal } from './InsertBlockModal'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  field: BlocksField
  value: NestedBlockValue[]
  onChange: (value: unknown) => void
  readOnly?: boolean
}

// ─── Unique ID generator ──────────────────────────────────────────────────────

let _seq = 0
function newId(): string {
  return `nb-${Date.now()}-${(_seq++).toString(36)}`
}

// ─── Drag handle icon ─────────────────────────────────────────────────────────

function DragHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      title="Drag to reorder"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.5rem',
        cursor: 'grab',
        color: 'var(--theme-elevation-400, #9ca3af)',
        flexShrink: 0,
        userSelect: 'none',
        fontSize: '0.9rem',
        ...(props.style ?? {}),
      }}
    >
      ⠿
    </div>
  )
}

// ─── Sortable block row ────────────────────────────────────────────────────────

interface SortableBlockProps {
  block: NestedBlockValue
  index: number
  total: number
  schema: BlockSchema | undefined | null
  loadingSchemas: boolean
  collapsed: boolean
  readOnly?: boolean
  onToggleCollapse: () => void
  onRemove: () => void
  onDataChange: (data: Record<string, unknown>) => void
}

function SortableBlock({
  block,
  index,
  total,
  schema,
  loadingSchemas,
  collapsed,
  readOnly,
  onToggleCollapse,
  onRemove,
  onDataChange,
}: SortableBlockProps) {
  const blockId = block.id ?? `block-${index}`

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: blockId })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    border: isDragging
      ? '2px dashed #6366f1'
      : '1px solid var(--theme-elevation-150, #e5e7eb)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    background: 'var(--theme-elevation-0, #fff)',
  }

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

  return (
    <div ref={setNodeRef} style={style}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.4rem 0.75rem',
          background: isDragging
            ? '#eef2ff'
            : 'var(--theme-elevation-100, #f3f4f6)',
          borderBottom: collapsed ? 'none' : '1px solid var(--theme-elevation-150, #e5e7eb)',
        }}
      >
        {/* Drag handle */}
        {!readOnly && (
          <DragHandle {...attributes} {...listeners} />
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          style={{ ...iconBtn, fontFamily: 'monospace', fontSize: '0.625rem' }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▶' : '▼'}
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
          <span
            style={{
              marginLeft: '0.375rem',
              fontSize: '0.6875rem',
              fontWeight: 400,
              color: 'var(--theme-elevation-400, #9ca3af)',
            }}
          >
            #{index + 1}
          </span>
        </span>

        {/* Remove */}
        {!readOnly && (
          <button
            type="button"
            onClick={onRemove}
            title="Remove block"
            style={{ ...iconBtn, color: 'var(--theme-error-500, #ef4444)' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Block data form */}
      {!collapsed && (
        <div style={{ padding: '0.75rem' }}>
          {loadingSchemas ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-400, #9ca3af)' }}>
              Loading schema…
            </p>
          ) : schema ? (
            <SchemaForm
              schema={schema}
              value={block.data}
              onChange={(updated) => onDataChange(updated)}
              readOnly={readOnly}
            />
          ) : schema === null ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--theme-error-500, #ef4444)' }}>
              Schema not found for &ldquo;{block.blockType}&rdquo;. Is the block definition published?
            </p>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-400, #9ca3af)' }}>
              Fetching schema…
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BlocksFieldInput({ field, value, onChange, readOnly }: Props) {
  const blocks: NestedBlockValue[] = Array.isArray(value) ? value : []

  const [schemas, setSchemas]           = useState<Record<string, BlockSchema | null>>({})
  const [loadingSchemas, setLoading]    = useState(false)
  const schemasRef = useRef(schemas)
  useEffect(() => { schemasRef.current = schemas }, [schemas])

  const [collapsed, setCollapsed]       = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen]       = useState(false)

  const allowed = field.allowedBlocks ?? []
  const atMax   = field.maxBlocks != null && blocks.length >= field.maxBlocks

  // ── dnd-kit sensors ─────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // ── Fetch schemas for all allowed blocks on mount ───────────────────────────
  const fetchSchemas = useCallback(async () => {
    if (allowed.length === 0) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ depth: '2' })
      allowed.forEach((slug, i) => params.append(`where[slug][in][${i}]`, slug))
      const res = await fetch(`/api/block-definitions?${params.toString()}`)
      const data = await res.json()
      const map: Record<string, BlockSchema | null> = {}
      for (const doc of data.docs ?? []) {
        if (typeof doc.slug === 'string') {
          map[doc.slug] = doc.currentVersion?.schema ?? null
        }
      }
      setSchemas(map)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchSchemas() }, [fetchSchemas])

  // ── Mutations ───────────────────────────────────────────────────────────────

  function handleInsertBlock(blockType: string, presetData?: Record<string, unknown>) {
    const next: NestedBlockValue = {
      id: newId(),
      blockType,
      data: presetData ?? {},
    }
    onChange([...blocks, next])
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index))
  }

  function updateBlockData(index: number, data: Record<string, unknown>) {
    const next = [...blocks]
    next[index] = { ...next[index], data }
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => (b.id ?? `block-${blocks.indexOf(b)}`) === active.id)
    const newIndex = blocks.findIndex((b) => (b.id ?? `block-${blocks.indexOf(b)}`) === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onChange(arrayMove(blocks, oldIndex, newIndex))
  }

  // ── Block IDs for sortable context ──────────────────────────────────────────
  const blockIds = blocks.map((b, i) => b.id ?? `block-${i}`)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {blocks.length === 0 && (
        <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-400, #9ca3af)', marginBottom: '0.5rem' }}>
          No nested blocks yet. Click &ldquo;Add Block&rdquo; to get started.
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {blocks.map((block, index) => {
              const blockId = block.id ?? `block-${index}`
              return (
                <SortableBlock
                  key={blockId}
                  block={block}
                  index={index}
                  total={blocks.length}
                  schema={schemas[block.blockType]}
                  loadingSchemas={loadingSchemas}
                  collapsed={collapsed.has(blockId)}
                  readOnly={readOnly}
                  onToggleCollapse={() => toggleCollapse(blockId)}
                  onRemove={() => removeBlock(index)}
                  onDataChange={(data) => updateBlockData(index, data)}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add block button */}
      {!readOnly && !atMax && (
        <div style={{ marginTop: '0.75rem' }}>
          {allowed.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--theme-elevation-400, #9ca3af)', fontStyle: 'italic' }}>
              No allowedBlocks configured for this field.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#6366f1',
                background: '#f0f0ff',
                border: '1.5px dashed #a5b4fc',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              + Add Block
            </button>
          )}
        </div>
      )}

      {atMax && (
        <p style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-400, #9ca3af)', marginTop: '0.5rem' }}>
          Maximum {field.maxBlocks} block{field.maxBlocks === 1 ? '' : 's'} reached.
        </p>
      )}

      {/* Insert block modal */}
      <InsertBlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onInsert={handleInsertBlock}
        allowedSlugs={allowed.length > 0 ? allowed : null}
      />
    </div>
  )
}
