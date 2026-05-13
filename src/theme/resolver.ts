import type { ThemeTokens, ThemeTypographyTag } from './tokens'
import { defaultTheme } from './tokens'

type RawThemeGlobal = Record<string, unknown>

// ─── Font fallback stacks ─────────────────────────────────────────────────────

const SERIF_FONTS = new Set([
  'Playfair Display', 'Merriweather', 'Lora', 'EB Garamond',
  'Libre Baskerville', 'Crimson Pro', 'Cormorant Garamond',
  'DM Serif Display', 'Fraunces',
])

const MONO_FONTS = new Set([
  'JetBrains Mono', 'Fira Code', 'Source Code Pro',
])

function getFontStack(fontName: string): string {
  if (!fontName) return 'system-ui, sans-serif'
  if (MONO_FONTS.has(fontName)) return `'${fontName}', monospace`
  if (SERIF_FONTS.has(fontName)) return `'${fontName}', Georgia, serif`
  return `'${fontName}', system-ui, sans-serif`
}

// ─── Google Fonts URL builder ─────────────────────────────────────────────────
// Collects all unique font names from the theme, groups their required weights,
// and returns a single fonts.googleapis.com/css2 URL.

export function buildGoogleFontsURL(t: ThemeTokens): string {
  const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a'] as const
  // Map fontName → Set<weight>
  const fontWeights = new Map<string, Set<string>>()

  for (const tag of tags) {
    const tagTokens = t.typography[tag]
    // Extract the raw font name from the stack (first token, strip quotes)
    const rawStack = tagTokens.font
    const firstToken = rawStack.split(',')[0]?.trim().replace(/'/g, '') ?? ''
    if (!firstToken || firstToken === 'system-ui' || firstToken === 'Georgia' || firstToken === 'monospace') continue

    const weight = tagTokens.weight === 'inherit' ? '400' : tagTokens.weight
    if (!fontWeights.has(firstToken)) fontWeights.set(firstToken, new Set())
    fontWeights.get(firstToken)!.add(weight)
  }

  if (fontWeights.size === 0) return ''

  const families: string[] = []
  for (const [family, weights] of fontWeights) {
    const sortedWeights = [...weights].sort((a, b) => Number(a) - Number(b)).join(';')
    families.push(`family=${encodeURIComponent(family)}:wght@${sortedWeights}`)
  }

  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

// ─── Per-tag resolver helper ──────────────────────────────────────────────────
// Payload stores each tag as a nested group: typo.h1 = { font, size, weight }

function resolveTag(
  raw: Record<string, unknown>,
  tag: string,
  defaults: ThemeTypographyTag,
): ThemeTypographyTag {
  const group = (raw[tag] as Record<string, unknown>) ?? {}
  const fontName = (group.font as string) || ''
  const resolvedFont = fontName ? getFontStack(fontName) : defaults.font
  return {
    font:   resolvedFont,
    size:   (group.size   as string) || defaults.size,
    weight: (group.weight as string) || defaults.weight,
  }
}

// ─── Payload global → typed tokens ───────────────────────────────────────────

export function resolveTheme(raw: RawThemeGlobal): ThemeTokens {
  const colors   = (raw.colors   as Record<string, unknown>) ?? {}
  const typo     = (raw.typography as Record<string, unknown>) ?? {}
  const spacing  = (raw.spacing  as Record<string, unknown>) ?? {}
  const buttons  = (raw.buttons  as Record<string, unknown>) ?? {}
  const shadows  = (raw.shadows  as Record<string, unknown>) ?? {}
  const layout   = (raw.layout   as Record<string, unknown>) ?? {}

  return {
    colors: {
      primary:    (colors.primary    as string) || defaultTheme.colors.primary,
      secondary:  (colors.secondary  as string) || defaultTheme.colors.secondary,
      accent:     (colors.accent     as string) || defaultTheme.colors.accent,
      background: (colors.background as string) || defaultTheme.colors.background,
      surface:    (colors.surface    as string) || defaultTheme.colors.surface,
      text:       (colors.text       as string) || defaultTheme.colors.text,
      mutedText:  (colors.mutedText  as string) || defaultTheme.colors.mutedText,
    },
    typography: {
      baseFontSize: (typo.baseFontSize as string) || defaultTheme.typography.baseFontSize,
      lineHeight:   (typo.lineHeight   as string) || defaultTheme.typography.lineHeight,
      h1: resolveTag(typo, 'h1', defaultTheme.typography.h1),
      h2: resolveTag(typo, 'h2', defaultTheme.typography.h2),
      h3: resolveTag(typo, 'h3', defaultTheme.typography.h3),
      h4: resolveTag(typo, 'h4', defaultTheme.typography.h4),
      h5: resolveTag(typo, 'h5', defaultTheme.typography.h5),
      h6: resolveTag(typo, 'h6', defaultTheme.typography.h6),
      p:  resolveTag(typo, 'p',  defaultTheme.typography.p),
      a:  resolveTag(typo, 'a',  defaultTheme.typography.a),
    },
    spacing: {
      sectionGap:     (spacing.sectionGap     as string) || defaultTheme.spacing.sectionGap,
      containerWidth: (spacing.containerWidth as string) || defaultTheme.spacing.containerWidth,
      radius:         (spacing.radius         as string) || defaultTheme.spacing.radius,
    },
    buttons: {
      radius:     (buttons.radius     as string)                                      || defaultTheme.buttons.radius,
      appearance: (buttons.appearance as ThemeTokens['buttons']['appearance'])        || defaultTheme.buttons.appearance,
      shadow:     (buttons.shadow     as ThemeTokens['buttons']['shadow'])            || defaultTheme.buttons.shadow,
    },
    shadows: {
      card:    (shadows.card    as ThemeTokens['shadows']['card'])    || defaultTheme.shadows.card,
      overlay: (shadows.overlay as ThemeTokens['shadows']['overlay']) || defaultTheme.shadows.overlay,
    },
    layout: {
      sidePadding: (layout.sidePadding as string) || defaultTheme.layout.sidePadding,
      proseWidth:  (layout.proseWidth  as string) || defaultTheme.layout.proseWidth,
    },
  }
}

// ─── Resolved shadow values ───────────────────────────────────────────────────

const SHADOW_VALUES: Record<string, string> = {
  none: 'none',
  sm:   '0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
  md:   '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
  lg:   '0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05)',
  xl:   '0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04)',
}

// ─── Tokens → CSS custom properties string ────────────────────────────────────
// Injected as a <style> tag in the root layout so every component can read
// var(--color-primary) etc. without needing the React context.

export function tokensToCSS(t: ThemeTokens): string {
  const { typography: ty } = t
  return `:root {
  /* ── Colors ─────────────────────────────────────────────────────── */
  --color-primary: ${t.colors.primary};
  --color-secondary: ${t.colors.secondary};
  --color-accent: ${t.colors.accent};
  --color-background: ${t.colors.background};
  --color-surface: ${t.colors.surface};
  --color-text: ${t.colors.text};
  --color-muted-text: ${t.colors.mutedText};

  /* ── Base typography ─────────────────────────────────────────────── */
  --font-size-base: ${ty.baseFontSize};
  --line-height: ${ty.lineHeight};

  /* ── Per-tag typography ──────────────────────────────────────────── */
  --font-h1: ${ty.h1.font}; --font-size-h1: ${ty.h1.size}; --font-weight-h1: ${ty.h1.weight};
  --font-h2: ${ty.h2.font}; --font-size-h2: ${ty.h2.size}; --font-weight-h2: ${ty.h2.weight};
  --font-h3: ${ty.h3.font}; --font-size-h3: ${ty.h3.size}; --font-weight-h3: ${ty.h3.weight};
  --font-h4: ${ty.h4.font}; --font-size-h4: ${ty.h4.size}; --font-weight-h4: ${ty.h4.weight};
  --font-h5: ${ty.h5.font}; --font-size-h5: ${ty.h5.size}; --font-weight-h5: ${ty.h5.weight};
  --font-h6: ${ty.h6.font}; --font-size-h6: ${ty.h6.size}; --font-weight-h6: ${ty.h6.weight};
  --font-p:  ${ty.p.font};  --font-size-p:  ${ty.p.size};  --font-weight-p:  ${ty.p.weight};
  --font-a:  ${ty.a.font};  --font-size-a:  ${ty.a.size};  --font-weight-a:  ${ty.a.weight};

  /* ── Spacing ─────────────────────────────────────────────────────── */
  --spacing-section: ${t.spacing.sectionGap};
  --container-width: ${t.spacing.containerWidth};
  --radius-border: ${t.spacing.radius};

  /* ── Buttons ─────────────────────────────────────────────────────── */
  --radius-button: ${t.buttons.radius};
  --button-appearance: ${t.buttons.appearance};
  --shadow-button: ${SHADOW_VALUES[t.buttons.shadow] ?? 'none'};

  /* ── Shadows ─────────────────────────────────────────────────────── */
  --shadow-card: ${SHADOW_VALUES[t.shadows.card] ?? SHADOW_VALUES.sm};
  --shadow-overlay: ${SHADOW_VALUES[t.shadows.overlay] ?? SHADOW_VALUES.xl};

  /* ── Layout ──────────────────────────────────────────────────────── */
  --section-padding: ${t.layout.sidePadding};
  --prose-width: ${t.layout.proseWidth};
}`
}
