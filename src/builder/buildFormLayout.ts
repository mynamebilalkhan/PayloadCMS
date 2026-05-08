import type { BlockSchema, BlockField, UIMetadata } from '@/validation/types'

// ─── Layout Types ─────────────────────────────────────────────────────────────

export interface FormFieldEntry {
  field: BlockField
  /** Resolved UI metadata (never undefined here; defaults applied). */
  ui: UIMetadata
}

export interface FormSection {
  name: string
  fields: FormFieldEntry[]
}

export interface FormTab {
  name: string
  sections: FormSection[]
}

export interface FormLayout {
  tabs: FormTab[]
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_TAB = 'Content'
const DEFAULT_SECTION = 'General'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true when at least one field carries meaningful UI metadata
 * (tab, section, width, or order), indicating the tabbed layout should activate.
 *
 * Condition-only or validation-only metadata does NOT trigger the tabbed layout —
 * only layout-affecting properties do. This preserves the flat layout for schemas
 * that only use conditions or validation enhancements.
 */
export function hasUIMetadata(schema: BlockSchema): boolean {
  return schema.fields.some(
    (f) =>
      f.ui !== undefined &&
      (f.ui.tab !== undefined ||
        f.ui.section !== undefined ||
        f.ui.width !== undefined ||
        f.ui.order !== undefined),
  )
}

/**
 * Returns an inline CSS width string for the given UIWidth value.
 * Used in admin components which use inline styles (no Tailwind in admin).
 */
export function widthToStyle(width: UIMetadata['width'] | undefined): string {
  switch (width) {
    case 'half':
      return 'calc(50% - 0.5rem)'
    case 'third':
      return 'calc(33.333% - 0.667rem)'
    case 'quarter':
      return 'calc(25% - 0.75rem)'
    default:
      return '100%'
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Transforms a BlockSchema into an organised tabs → sections → fields layout.
 *
 * Rules:
 * - Hidden fields (admin.hidden = true) are excluded.
 * - Fields without ui.tab go into the "Content" default tab.
 * - Fields without ui.section go into the "General" default section.
 * - Within each section, fields are sorted by ui.order (ascending; unset = Infinity).
 * - Tab/section insertion order matches the first field that references them.
 */
export function buildFormLayout(schema: BlockSchema): FormLayout {
  const tabMap = new Map<string, Map<string, FormFieldEntry[]>>()

  const visibleFields = schema.fields.filter((f) => !f.admin?.hidden)

  const sorted = [...visibleFields].sort((a, b) => {
    const oa = a.ui?.order ?? Infinity
    const ob = b.ui?.order ?? Infinity
    return oa - ob
  })

  for (const field of sorted) {
    const tabName = field.ui?.tab ?? DEFAULT_TAB
    const sectionName = field.ui?.section ?? DEFAULT_SECTION

    if (!tabMap.has(tabName)) tabMap.set(tabName, new Map())
    const sectionMap = tabMap.get(tabName)!

    if (!sectionMap.has(sectionName)) sectionMap.set(sectionName, [])
    sectionMap.get(sectionName)!.push({
      field,
      ui: field.ui ?? {},
    })
  }

  const tabs: FormTab[] = []
  for (const [tabName, sectionMap] of tabMap) {
    const sections: FormSection[] = []
    for (const [sectionName, fields] of sectionMap) {
      sections.push({ name: sectionName, fields })
    }
    tabs.push({ name: tabName, sections })
  }

  return { tabs }
}
