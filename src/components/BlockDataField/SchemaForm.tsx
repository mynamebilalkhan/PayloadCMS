'use client'

import React, { useState } from 'react'
import type { BlockSchema, BlockField } from '@/validation/types'
import { evaluateConditions } from '@/validation/evaluateConditions'
import { buildFormLayout, hasUIMetadata, widthToStyle } from '@/builder/buildFormLayout'
import { FieldInput } from './FieldInput'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  schema: BlockSchema
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  readOnly?: boolean
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const tabBtnBase: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  background: 'transparent',
  border: 'none',
  borderBottom: '2px solid transparent',
  marginBottom: '-2px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--theme-elevation-500, #6b7280)',
  marginBottom: '0.625rem',
}

// ─── SchemaForm ───────────────────────────────────────────────────────────────

export function SchemaForm({ schema, value, onChange, readOnly }: Props) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  function handleFieldChange(fieldName: string, fieldValue: unknown) {
    onChange({ ...value, [fieldName]: fieldValue })
  }

  // ── Feature 1: Render a single field, applying condition check ──────────────

  function renderField(field: BlockField, withWidth = false) {
    // Evaluate conditions against the current sibling-level data
    if (field.conditions && field.conditions.length > 0) {
      const visible = evaluateConditions(field.conditions, field.conditionMode, value)
      if (!visible) return null
    }

    const el = (
      <FieldInput
        key={field.name}
        field={field}
        value={value[field.name]}
        onChange={(v) => handleFieldChange(field.name, v)}
        readOnly={readOnly || field.admin?.readOnly}
      />
    )

    // Feature 3: wrap in a width container when inside the grid layout
    if (withWidth && field.ui?.width) {
      return (
        <div key={field.name} style={{ width: widthToStyle(field.ui.width) }}>
          {el}
        </div>
      )
    }

    return el
  }

  // ── Feature 3: Tabbed layout when any field carries UI metadata ─────────────

  if (hasUIMetadata(schema)) {
    const layout = buildFormLayout(schema)
    const currentTabName = activeTab ?? layout.tabs[0]?.name ?? ''

    return (
      <div>
        {/* Tab bar — only rendered when there are multiple tabs */}
        {layout.tabs.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 0,
              borderBottom: '2px solid var(--theme-elevation-150, #e5e7eb)',
              marginBottom: '1rem',
              overflowX: 'auto',
            }}
          >
            {layout.tabs.map((tab) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                style={{
                  ...tabBtnBase,
                  fontWeight: tab.name === currentTabName ? 600 : 400,
                  color:
                    tab.name === currentTabName
                      ? 'var(--theme-text, #111827)'
                      : 'var(--theme-elevation-500, #6b7280)',
                  borderBottomColor:
                    tab.name === currentTabName
                      ? 'var(--theme-text, #111827)'
                      : 'transparent',
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}

        {/* Active tab content */}
        {layout.tabs
          .filter((tab) => tab.name === currentTabName)
          .map((tab) => (
            <div key={tab.name}>
              {tab.sections.map((section) => {
                const sectionKey = `${tab.name}__${section.name}`
                const isDefaultSection =
                  tab.sections.length === 1 && section.name === 'General'
                const isCollapsed = collapsedSections.has(sectionKey)
                // A section is collapsible if ANY field in it had ui.collapsed = true
                const canCollapse = section.fields.some((f) => f.ui.collapsed)

                return (
                  <div
                    key={sectionKey}
                    style={{ marginBottom: '1.25rem' }}
                  >
                    {/* Section header — skip for the trivial single-section "General" tab */}
                    {!isDefaultSection && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingBottom: '0.375rem',
                          borderBottom:
                            '1px solid var(--theme-elevation-100, #f3f4f6)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span style={sectionLabelStyle}>{section.name}</span>
                        {canCollapse && !readOnly && (
                          <button
                            type="button"
                            onClick={() =>
                              setCollapsedSections((prev) => {
                                const next = new Set(prev)
                                if (isCollapsed) next.delete(sectionKey)
                                else next.add(sectionKey)
                                return next
                              })
                            }
                            style={{
                              fontSize: '0.75rem',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--theme-elevation-500, #6b7280)',
                            }}
                          >
                            {isCollapsed ? '▶ Show' : '▼ Collapse'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Section fields — responsive wrap grid */}
                    {!isCollapsed && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        {section.fields.map(({ field }) =>
                          renderField(field, true),
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
      </div>
    )
  }

  // ── Default: flat column layout (unchanged behaviour) ───────────────────────

  const visibleFields = schema.fields.filter((f) => !f.admin?.hidden)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {visibleFields.map((field: BlockField) => renderField(field))}
    </div>
  )
}
