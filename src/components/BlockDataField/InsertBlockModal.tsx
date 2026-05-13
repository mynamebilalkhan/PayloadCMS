'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { BlockSchema } from '@/validation/types'
import type { BlockPreset } from '@/blocks/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockDefinitionDoc {
  id: string | number
  slug: string
  name: string
  description?: string
  category?: string
  icon?: string
  thumbnail?: { url?: string } | null
  previewImage?: { url?: string } | null
  currentVersion?: {
    id: string | number
    schema?: BlockSchema
  } | null
}

interface InsertBlockModalProps {
  open: boolean
  onClose: () => void
  /** Called with the chosen block slug + optional preset data when editor confirms. */
  onInsert: (blockType: string, presetData?: Record<string, unknown>) => void
  /** Restrict to these slugs (allowedBlocks). Null = show all. */
  allowedSlugs?: string[] | null
}

// ─── Category labels ──────────────────────────────────────────────────────────

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all',          label: 'All'          },
  { value: 'layout',       label: 'Layout'       },
  { value: 'content',      label: 'Content'      },
  { value: 'media',        label: 'Media'        },
  { value: 'navigation',   label: 'Navigation'   },
  { value: 'interactive',  label: 'Interactive'  },
  { value: 'data-display', label: 'Data Display' },
  { value: 'utility',      label: 'Utility'      },
]

// ─── Fallback icon ────────────────────────────────────────────────────────────

function BlockIcon({ icon, name }: { icon?: string; name: string }) {
  if (icon && icon.length <= 2) {
    return (
      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
    )
  }
  return (
    <span
      style={{
        width: '2rem',
        height: '2rem',
        borderRadius: '0.375rem',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.875rem',
        flexShrink: 0,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

// ─── Preset card ──────────────────────────────────────────────────────────────

function PresetCard({
  preset,
  selected,
  onSelect,
}: {
  preset: BlockPreset
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        textAlign: 'left',
        padding: '0.75rem',
        border: selected
          ? '2px solid #6366f1'
          : '1px solid var(--theme-elevation-200, #e5e7eb)',
        borderRadius: '0.5rem',
        background: selected ? '#f0f0ff' : 'var(--theme-elevation-0, #fff)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        width: '100%',
      }}
    >
      {preset.thumbnail ? (
        <img
          src={preset.thumbnail}
          alt={preset.name}
          style={{
            width: '100%',
            height: '80px',
            objectFit: 'cover',
            borderRadius: '0.25rem',
            marginBottom: '0.5rem',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            height: '64px',
            borderRadius: '0.25rem',
            background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {preset.name}
        </div>
      )}
      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--theme-text, #111827)', marginBottom: '0.2rem' }}>
        {preset.name}
      </div>
      {preset.description && (
        <div style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500, #6b7280)', lineHeight: 1.4 }}>
          {preset.description}
        </div>
      )}
    </button>
  )
}

// ─── Block card ───────────────────────────────────────────────────────────────

function BlockCard({
  block,
  selected,
  onSelect,
}: {
  block: BlockDefinitionDoc
  selected: boolean
  onSelect: () => void
}) {
  const thumb = block.thumbnail?.url ?? block.previewImage?.url

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        textAlign: 'left',
        padding: '0.875rem',
        border: selected
          ? '2px solid #6366f1'
          : '1px solid var(--theme-elevation-200, #e5e7eb)',
        borderRadius: '0.5rem',
        background: selected
          ? 'linear-gradient(135deg, #f0f0ff, #f5f3ff)'
          : 'var(--theme-elevation-0, #fff)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
        width: '100%',
      }}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={block.name}
          style={{
            width: '100%',
            height: '80px',
            objectFit: 'cover',
            borderRadius: '0.375rem',
            marginBottom: '0.625rem',
            display: 'block',
            background: '#f3f4f6',
          }}
        />
      ) : (
        <div
          style={{
            height: '64px',
            borderRadius: '0.375rem',
            background: selected
              ? 'linear-gradient(135deg, #c7d2fe, #ddd6fe)'
              : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            marginBottom: '0.625rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BlockIcon icon={block.icon} name={block.name} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
        {(!thumb) && <BlockIcon icon={block.icon} name={block.name} />}
        <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--theme-text, #111827)' }}>
          {block.name}
        </span>
      </div>

      {block.description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500, #6b7280)', margin: 0, lineHeight: 1.4 }}>
          {block.description}
        </p>
      )}

      {block.category && (
        <span
          style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            background: selected ? '#c7d2fe' : '#f3f4f6',
            color: selected ? '#4338ca' : '#6b7280',
          }}
        >
          {block.category}
        </span>
      )}
    </button>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function InsertBlockModal({
  open,
  onClose,
  onInsert,
  allowedSlugs,
}: InsertBlockModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const [blocks, setBlocks]           = useState<BlockDefinitionDoc[]>([])
  const [loading, setLoading]         = useState(false)
  const [search, setSearch]           = useState('')
  const [activeCategory, setCategory] = useState('all')
  const [selected, setSelected]       = useState<BlockDefinitionDoc | null>(null)
  const [presets, setPresets]         = useState<BlockPreset[]>([])
  const [selectedPreset, setPreset]   = useState<BlockPreset | null>(null)
  const [step, setStep]               = useState<'pick-block' | 'pick-preset'>('pick-block')

  // ── Fetch block definitions ─────────────────────────────────────────────────

  const fetchBlocks = useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ depth: '1', limit: '100' })
      params.append('where[isDeprecated][not_equals]', 'true')
      if (allowedSlugs && allowedSlugs.length > 0) {
        allowedSlugs.forEach((slug, i) => params.append(`where[slug][in][${i}]`, slug))
      }
      const res = await fetch(`/api/block-definitions?${params.toString()}`)
      const data = await res.json()
      setBlocks((data.docs ?? []) as BlockDefinitionDoc[])
    } catch {
      setBlocks([])
    } finally {
      setLoading(false)
    }
  }, [open, allowedSlugs])

  useEffect(() => { fetchBlocks() }, [fetchBlocks])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearch('')
      setCategory('all')
      setSelected(null)
      setPresets([])
      setPreset(null)
      setStep('pick-block')
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // ── Load presets for selected block ────────────────────────────────────────

  async function selectBlock(block: BlockDefinitionDoc) {
    setSelected(block)
    setPreset(null)

    // Try to import presets for this block from the frontend registry
    try {
      const mod = await import(
        /* @vite-ignore */
        `../../blocks/${toPascalCase(block.slug)}/presets`
      ).catch(() => null)
      const list: BlockPreset[] = mod?.[`${toCamelCase(block.slug)}Presets`] ?? []
      setPresets(list)
      if (list.length > 0) {
        setStep('pick-preset')
      } else {
        // No presets — skip to insert with empty data
        setStep('pick-preset')
      }
    } catch {
      setPresets([])
      setStep('pick-preset')
    }
  }

  // ── Confirm insert ──────────────────────────────────────────────────────────

  function handleInsert() {
    if (!selected) return
    onInsert(selected.slug, selectedPreset?.data)
    onClose()
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function toPascalCase(slug: string) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  }
  function toCamelCase(slug: string) {
    const p = toPascalCase(slug)
    return p.charAt(0).toLowerCase() + p.slice(1)
  }

  // ── Filter blocks ───────────────────────────────────────────────────────────

  const filtered = blocks.filter((b) => {
    const matchCat = activeCategory === 'all' || b.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q || b.name.toLowerCase().includes(q) || b.slug.includes(q) || (b.description ?? '').toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  // ── Recent (last 5 most recently updated — simple heuristic from order) ────
  const recent = blocks.slice(0, 5)

  if (!open) return null

  // ── Shared styles ────────────────────────────────────────────────────────────

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--theme-elevation-150, #e5e7eb)',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 9998,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '5vh', left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(860px, 96vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--theme-elevation-0, #fff)',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          zIndex: 9999,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--theme-text, #111827)' }}>
              {step === 'pick-block' ? 'Add Block' : `Choose Preset — ${selected?.name}`}
            </h2>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.8125rem', color: 'var(--theme-elevation-500, #6b7280)' }}>
              {step === 'pick-block'
                ? 'Choose a block type to add to the layout'
                : 'Pick a preset to start from, or insert blank'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: 'var(--theme-elevation-500, #6b7280)',
              padding: '0.25rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>

          {/* ── STEP 1: Pick a block ── */}
          {step === 'pick-block' && (
            <div>
              {/* Search */}
              <div style={{ marginBottom: '1rem' }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search blocks…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.875rem',
                    border: '1px solid var(--theme-elevation-200, #d1d5db)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--theme-text, #111827)',
                    background: 'var(--theme-elevation-0, #fff)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Category chips */}
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      border: activeCategory === cat.value
                        ? '1.5px solid #6366f1'
                        : '1px solid var(--theme-elevation-200, #e5e7eb)',
                      background: activeCategory === cat.value ? '#eef2ff' : 'transparent',
                      color: activeCategory === cat.value ? '#4338ca' : 'var(--theme-elevation-600, #4b5563)',
                      fontSize: '0.8125rem',
                      fontWeight: activeCategory === cat.value ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {loading && (
                <p style={{ color: 'var(--theme-elevation-400, #9ca3af)', fontSize: '0.875rem' }}>
                  Loading blocks…
                </p>
              )}

              {/* Recent blocks (only when not searching/filtering) */}
              {!search && activeCategory === 'all' && recent.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--theme-elevation-500, #6b7280)', margin: '0 0 0.625rem' }}>
                    Recent
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.625rem' }}>
                    {recent.map((b) => (
                      <BlockCard
                        key={b.id}
                        block={b}
                        selected={selected?.id === b.id}
                        onSelect={() => selectBlock(b)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All / filtered blocks */}
              <div>
                {(!search && activeCategory === 'all') && (
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--theme-elevation-500, #6b7280)', margin: '0 0 0.625rem' }}>
                    All Blocks ({filtered.length})
                  </h3>
                )}
                {filtered.length === 0 && !loading && (
                  <p style={{ color: 'var(--theme-elevation-400, #9ca3af)', fontSize: '0.875rem' }}>
                    No blocks found.
                  </p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.625rem' }}>
                  {filtered.map((b) => (
                    <BlockCard
                      key={b.id}
                      block={b}
                      selected={selected?.id === b.id}
                      onSelect={() => selectBlock(b)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Pick a preset ── */}
          {step === 'pick-preset' && selected && (
            <div>
              {/* Back */}
              <button
                type="button"
                onClick={() => { setStep('pick-block'); setPreset(null) }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#6366f1',
                  padding: 0,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                ← Back to blocks
              </button>

              {presets.length === 0 ? (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1px dashed var(--theme-elevation-200, #e5e7eb)',
                    borderRadius: '0.5rem',
                    color: 'var(--theme-elevation-400, #9ca3af)',
                    fontSize: '0.875rem',
                  }}
                >
                  No presets defined for this block. It will be inserted blank.
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--theme-elevation-500, #6b7280)', margin: '0 0 0.75rem' }}>
                    Choose a Preset ({presets.length})
                  </h3>

                  {/* Blank option */}
                  <div style={{ marginBottom: '0.625rem' }}>
                    <button
                      type="button"
                      onClick={() => setPreset(null)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        border: selectedPreset === null
                          ? '2px solid #6366f1'
                          : '1px solid var(--theme-elevation-200, #e5e7eb)',
                        borderRadius: '0.5rem',
                        background: selectedPreset === null ? '#f0f0ff' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--theme-text, #111827)',
                      }}
                    >
                      ✦ Start blank
                      <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--theme-elevation-500, #6b7280)', marginLeft: '0.5rem' }}>
                        — no preset data
                      </span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem' }}>
                    {presets.map((p) => (
                      <PresetCard
                        key={p.id}
                        preset={p}
                        selected={selectedPreset?.id === p.id}
                        onSelect={() => setPreset(p)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderTop: '1px solid var(--theme-elevation-150, #e5e7eb)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.625rem',
            background: 'var(--theme-elevation-50, #f9fafb)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: 'transparent',
              border: '1px solid var(--theme-elevation-300, #d1d5db)',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              color: 'var(--theme-text, #374151)',
            }}
          >
            Cancel
          </button>

          {step === 'pick-block' && selected && (
            <button
              type="button"
              onClick={() => setStep('pick-preset')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: '#6366f1',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              Next — Choose Preset →
            </button>
          )}

          {step === 'pick-preset' && (
            <button
              type="button"
              onClick={handleInsert}
              style={{
                padding: '0.5rem 1.125rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: '#6366f1',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              Insert Block ✓
            </button>
          )}
        </div>
      </div>
    </>
  )
}
