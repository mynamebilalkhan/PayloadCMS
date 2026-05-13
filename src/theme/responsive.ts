// ─── Responsive value types ───────────────────────────────────────────────────

export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

/**
 * A value that can vary per breakpoint.
 * `desktop` is required; tablet and mobile fall back to desktop when unset.
 */
export interface ResponsiveValue<T> {
  desktop: T
  tablet?: T
  mobile?: T
}

// ─── Type guard ───────────────────────────────────────────────────────────────

export function isResponsiveValue(v: unknown): v is ResponsiveValue<unknown> {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    'desktop' in v
  )
}

// ─── Resolver ─────────────────────────────────────────────────────────────────
// Used in block components to read the correct value for the current viewport.
// Server components always use 'desktop'; client components may detect via
// a media query hook.

export function resolveResponsiveValue<T>(
  value: T | ResponsiveValue<T> | null | undefined,
  breakpoint: Breakpoint = 'desktop',
  fallback?: T,
): T | undefined {
  if (value === undefined || value === null) return fallback
  if (isResponsiveValue(value)) {
    if (breakpoint === 'mobile') return (value.mobile ?? value.tablet ?? value.desktop) as T
    if (breakpoint === 'tablet') return (value.tablet ?? value.desktop) as T
    return value.desktop as T
  }
  return value as T
}

// ─── Admin UI metadata ────────────────────────────────────────────────────────

export const BREAKPOINTS: { key: Breakpoint; label: string; shortLabel: string }[] = [
  { key: 'desktop', label: 'Desktop', shortLabel: 'D' },
  { key: 'tablet',  label: 'Tablet',  shortLabel: 'T' },
  { key: 'mobile',  label: 'Mobile',  shortLabel: 'M' },
]
