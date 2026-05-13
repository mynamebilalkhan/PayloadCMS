// ─── Theme token interfaces ────────────────────────────────────────────────────
// These are the resolved, fully-typed tokens that components reference.
// Raw Payload global data is converted to this shape by resolver.ts.

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  mutedText: string
}

export interface ThemeTypographyTag {
  font: string    // resolved CSS font-family stack, e.g. "'Inter', system-ui, sans-serif"
  size: string    // e.g. "3.5rem"
  weight: string  // e.g. "700"
}

export interface ThemeTypography {
  baseFontSize: string
  lineHeight: string
  h1: ThemeTypographyTag
  h2: ThemeTypographyTag
  h3: ThemeTypographyTag
  h4: ThemeTypographyTag
  h5: ThemeTypographyTag
  h6: ThemeTypographyTag
  p: ThemeTypographyTag
  a: ThemeTypographyTag
}

export interface ThemeSpacing {
  sectionGap: string
  containerWidth: string
  radius: string
}

export interface ThemeButtons {
  radius: string
  appearance: 'solid' | 'outline' | 'ghost' | 'soft'
  shadow: 'none' | 'sm' | 'md'
}

export interface ThemeShadows {
  card: 'none' | 'sm' | 'md' | 'lg'
  overlay: 'md' | 'lg' | 'xl'
}

export interface ThemeLayout {
  sidePadding: string
  proseWidth: string
}

export interface ThemeTokens {
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  buttons: ThemeButtons
  shadows: ThemeShadows
  layout: ThemeLayout
}

// ─── Default (design-system baseline) ────────────────────────────────────────

const defaultTag = (font: string, size: string, weight: string): ThemeTypographyTag => ({
  font,
  size,
  weight,
})

export const defaultTheme: ThemeTokens = {
  colors: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    mutedText: '#6b7280',
  },
  typography: {
    baseFontSize: '16px',
    lineHeight: '1.6',
    h1: defaultTag("'Inter', system-ui, sans-serif", '3.5rem', '700'),
    h2: defaultTag("'Inter', system-ui, sans-serif", '2.5rem', '700'),
    h3: defaultTag("'Inter', system-ui, sans-serif", '2rem',   '600'),
    h4: defaultTag("'Inter', system-ui, sans-serif", '1.5rem', '600'),
    h5: defaultTag("'Inter', system-ui, sans-serif", '1.25rem','600'),
    h6: defaultTag("'Inter', system-ui, sans-serif", '1rem',   '600'),
    p:  defaultTag("'Inter', system-ui, sans-serif", '1rem',   '400'),
    a:  defaultTag("'Inter', system-ui, sans-serif", 'inherit','500'),
  },
  spacing: {
    sectionGap: '80px',
    containerWidth: '1200px',
    radius: '8px',
  },
  buttons: {
    radius: '6px',
    appearance: 'solid',
    shadow: 'none',
  },
  shadows: {
    card: 'sm',
    overlay: 'xl',
  },
  layout: {
    sidePadding: '48px',
    proseWidth: '800px',
  },
}
