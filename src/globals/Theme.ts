import type { GlobalConfig } from 'payload'

// ─── Google Fonts catalogue ───────────────────────────────────────────────────
// Value = exact Google Fonts family name (used verbatim in the API URL).

const FONT_OPTIONS = [
  // ── Sans-serif ───────────────────────────────────────────────────────────
  { label: 'Inter',                value: 'Inter'             },
  { label: 'Geist',                value: 'Geist'             },
  { label: 'Roboto',               value: 'Roboto'            },
  { label: 'Open Sans',            value: 'Open Sans'         },
  { label: 'Lato',                 value: 'Lato'              },
  { label: 'Poppins',              value: 'Poppins'           },
  { label: 'Montserrat',           value: 'Montserrat'        },
  { label: 'Nunito',               value: 'Nunito'            },
  { label: 'DM Sans',              value: 'DM Sans'           },
  { label: 'Plus Jakarta Sans',    value: 'Plus Jakarta Sans' },
  { label: 'Outfit',               value: 'Outfit'            },
  { label: 'Sora',                 value: 'Sora'              },
  { label: 'Space Grotesk',        value: 'Space Grotesk'     },
  { label: 'Raleway',              value: 'Raleway'           },
  { label: 'Source Sans 3',        value: 'Source Sans 3'     },
  // ── Serif ────────────────────────────────────────────────────────────────
  { label: 'Playfair Display',     value: 'Playfair Display'   },
  { label: 'Merriweather',         value: 'Merriweather'       },
  { label: 'Lora',                 value: 'Lora'               },
  { label: 'EB Garamond',          value: 'EB Garamond'        },
  { label: 'Libre Baskerville',    value: 'Libre Baskerville'  },
  { label: 'Crimson Pro',          value: 'Crimson Pro'        },
  { label: 'Cormorant Garamond',   value: 'Cormorant Garamond' },
  { label: 'DM Serif Display',     value: 'DM Serif Display'   },
  { label: 'Fraunces',             value: 'Fraunces'           },
  // ── Monospace ────────────────────────────────────────────────────────────
  { label: 'JetBrains Mono',       value: 'JetBrains Mono'    },
  { label: 'Fira Code',            value: 'Fira Code'         },
  { label: 'Source Code Pro',      value: 'Source Code Pro'   },
]

const WEIGHT_OPTIONS = [
  { label: 'Thin (100)',        value: '100' },
  { label: 'Extra Light (200)', value: '200' },
  { label: 'Light (300)',       value: '300' },
  { label: 'Regular (400)',     value: '400' },
  { label: 'Medium (500)',      value: '500' },
  { label: 'Semi Bold (600)',   value: '600' },
  { label: 'Bold (700)',        value: '700' },
  { label: 'Extra Bold (800)', value: '800' },
  { label: 'Black (900)',       value: '900' },
]

// Produces a collapsible group box for one HTML tag containing font / size / weight
function tagTypographyGroup(
  tag: string,
  label: string,
  defaults: { font: string; size: string; weight: string },
  sizeOptions: { label: string; value: string }[],
) {
  return {
    name: tag,
    type: 'group' as const,
    label,
    fields: [
      {
        name: 'font',
        type: 'select' as const,
        label: 'Font Family',
        options: FONT_OPTIONS,
        defaultValue: defaults.font,
      },
      {
        name: 'size',
        type: 'select' as const,
        label: 'Font Size',
        options: sizeOptions,
        defaultValue: defaults.size,
      },
      {
        name: 'weight',
        type: 'select' as const,
        label: 'Font Weight',
        options: WEIGHT_OPTIONS,
        defaultValue: defaults.weight,
      },
    ],
  }
}

export const Theme: GlobalConfig = {
  slug: 'theme',
  label: 'Global Theme',
  admin: {
    group: 'Settings',
    description: 'Centralized design tokens applied across all frontend blocks.',
  },
  fields: [
    // ─── Colors ─────────────────────────────────────────────────────────────
    {
      name: 'colors',
      type: 'group',
      label: 'Colors',
      fields: [
        {
          name: 'primary',
          type: 'text',
          label: 'Primary',
          defaultValue: '#4f46e5',
          admin: { description: 'Brand color used for buttons, links, and highlights.' },
        },
        {
          name: 'secondary',
          type: 'text',
          label: 'Secondary',
          defaultValue: '#7c3aed',
          admin: { description: 'Complementary brand color for gradients and accents.' },
        },
        {
          name: 'accent',
          type: 'text',
          label: 'Accent',
          defaultValue: '#06b6d4',
          admin: { description: 'Used for badges, tags, and small decorative elements.' },
        },
        {
          name: 'background',
          type: 'text',
          label: 'Page Background',
          defaultValue: '#ffffff',
          admin: { description: 'Default background color of the page.' },
        },
        {
          name: 'surface',
          type: 'text',
          label: 'Surface (Cards & Panels)',
          defaultValue: '#f9fafb',
          admin: { description: 'Background color for cards, panels, and section stripes.' },
        },
        {
          name: 'text',
          type: 'text',
          label: 'Body Text',
          defaultValue: '#111827',
          admin: { description: 'Default color for paragraphs and body copy.' },
        },
        {
          name: 'mutedText',
          type: 'text',
          label: 'Muted / Secondary Text',
          defaultValue: '#6b7280',
          admin: { description: 'Subtitles, captions, placeholder text, and helper copy.' },
        },
      ],
    },

    // ─── Typography ──────────────────────────────────────────────────────────
    {
      name: 'typography',
      type: 'group',
      label: 'Typography',
      admin: {
        description: 'Pick a Google Font, size, and weight for each HTML heading level, body text, and links.',
      },
      fields: [
        // Base settings
        {
          name: 'baseFontSize',
          type: 'select',
          label: 'Root Font Size (html)',
          options: [
            { label: '14 px', value: '14px' },
            { label: '15 px', value: '15px' },
            { label: '16 px (browser default)', value: '16px' },
            { label: '17 px', value: '17px' },
            { label: '18 px', value: '18px' },
          ],
          defaultValue: '16px',
          admin: { description: 'Sets 1 rem. All relative (rem) sizes scale with this value.' },
        },
        {
          name: 'lineHeight',
          type: 'select',
          label: 'Default Line Height',
          options: [
            { label: 'Tight — 1.3',   value: '1.3' },
            { label: 'Snug — 1.4',    value: '1.4' },
            { label: 'Normal — 1.5',  value: '1.5' },
            { label: 'Relaxed — 1.6', value: '1.6' },
            { label: 'Loose — 1.8',   value: '1.8' },
          ],
          defaultValue: '1.5',
        },

        // ── Per-tag groups ───────────────────────────────────────────────────
        tagTypographyGroup('h1', 'H1 — Hero / Page Title', { font: 'Inter', size: '3.5rem', weight: '700' }, [
          { label: '2.5 rem (40 px)', value: '2.5rem' },
          { label: '3 rem (48 px)',   value: '3rem'   },
          { label: '3.5 rem (56 px)', value: '3.5rem' },
          { label: '4 rem (64 px)',   value: '4rem'   },
          { label: '4.5 rem (72 px)', value: '4.5rem' },
          { label: '5 rem (80 px)',   value: '5rem'   },
        ]),

        tagTypographyGroup('h2', 'H2 — Section Title', { font: 'Inter', size: '2.25rem', weight: '700' }, [
          { label: '1.75 rem (28 px)', value: '1.75rem' },
          { label: '2 rem (32 px)',    value: '2rem'    },
          { label: '2.25 rem (36 px)', value: '2.25rem' },
          { label: '2.5 rem (40 px)',  value: '2.5rem'  },
          { label: '3 rem (48 px)',    value: '3rem'    },
        ]),

        tagTypographyGroup('h3', 'H3 — Sub-section Title', { font: 'Inter', size: '1.75rem', weight: '600' }, [
          { label: '1.25 rem (20 px)', value: '1.25rem' },
          { label: '1.5 rem (24 px)',  value: '1.5rem'  },
          { label: '1.75 rem (28 px)', value: '1.75rem' },
          { label: '2 rem (32 px)',    value: '2rem'    },
          { label: '2.25 rem (36 px)', value: '2.25rem' },
        ]),

        tagTypographyGroup('h4', 'H4 — Card / Widget Title', { font: 'Inter', size: '1.375rem', weight: '600' }, [
          { label: '1.125 rem (18 px)', value: '1.125rem' },
          { label: '1.25 rem (20 px)',  value: '1.25rem'  },
          { label: '1.375 rem (22 px)', value: '1.375rem' },
          { label: '1.5 rem (24 px)',   value: '1.5rem'   },
          { label: '1.75 rem (28 px)',  value: '1.75rem'  },
        ]),

        tagTypographyGroup('h5', 'H5 — Label / Caption Heading', { font: 'Inter', size: '1.125rem', weight: '600' }, [
          { label: '0.875 rem (14 px)', value: '0.875rem' },
          { label: '1 rem (16 px)',     value: '1rem'     },
          { label: '1.125 rem (18 px)', value: '1.125rem' },
          { label: '1.25 rem (20 px)',  value: '1.25rem'  },
        ]),

        tagTypographyGroup('h6', 'H6 — Fine Label / Overline', { font: 'Inter', size: '1rem', weight: '600' }, [
          { label: '0.75 rem (12 px)',  value: '0.75rem'  },
          { label: '0.875 rem (14 px)', value: '0.875rem' },
          { label: '1 rem (16 px)',     value: '1rem'     },
          { label: '1.125 rem (18 px)', value: '1.125rem' },
        ]),

        tagTypographyGroup('p', 'Paragraph (p)', { font: 'Inter', size: '1rem', weight: '400' }, [
          { label: '0.875 rem (14 px)',  value: '0.875rem'  },
          { label: '1 rem (16 px)',      value: '1rem'      },
          { label: '1.0625 rem (17 px)', value: '1.0625rem' },
          { label: '1.125 rem (18 px)',  value: '1.125rem'  },
          { label: '1.25 rem (20 px)',   value: '1.25rem'   },
        ]),

        tagTypographyGroup('a', 'Link (a)', { font: 'Inter', size: 'inherit', weight: '500' }, [
          { label: 'Inherit from parent', value: 'inherit'  },
          { label: '0.875 rem (14 px)',   value: '0.875rem' },
          { label: '1 rem (16 px)',       value: '1rem'     },
          { label: '1.125 rem (18 px)',   value: '1.125rem' },
        ]),
      ],
    },

    // ─── Spacing ─────────────────────────────────────────────────────────────
    {
      name: 'spacing',
      type: 'group',
      label: 'Spacing',
      fields: [
        {
          name: 'sectionGap',
          type: 'select',
          label: 'Vertical Gap Between Sections',
          options: [
            { label: 'Compact — 48 px',  value: '48px'  },
            { label: 'Normal — 80 px',   value: '80px'  },
            { label: 'Relaxed — 112 px', value: '112px' },
            { label: 'Spacious — 144 px', value: '144px' },
          ],
          defaultValue: '80px',
          admin: { description: 'Applies to section top/bottom padding via --spacing-section.' },
        },
        {
          name: 'containerWidth',
          type: 'select',
          label: 'Page Container Max Width',
          options: [
            { label: 'Narrow — 1024 px', value: '1024px' },
            { label: 'Normal — 1200 px', value: '1200px' },
            { label: 'Wide — 1280 px',   value: '1280px' },
            { label: 'Full — 1440 px',   value: '1440px' },
          ],
          defaultValue: '1200px',
          admin: { description: 'Maximum width of the page wrapper at desktop breakpoints.' },
        },
        {
          name: 'radius',
          type: 'select',
          label: 'Global Corner Radius',
          options: [
            { label: 'None — 0 px',   value: '0px'    },
            { label: 'Small — 4 px',  value: '4px'    },
            { label: 'Medium — 8 px', value: '8px'    },
            { label: 'Large — 12 px', value: '12px'   },
            { label: 'Pill — 9999 px', value: '9999px' },
          ],
          defaultValue: '8px',
          admin: { description: 'Default border-radius for cards, inputs, and section containers.' },
        },
      ],
    },

    // ─── Buttons ─────────────────────────────────────────────────────────────
    {
      name: 'buttons',
      type: 'group',
      label: 'Buttons',
      fields: [
        {
          name: 'radius',
          type: 'select',
          label: 'Border Radius',
          options: [
            { label: 'Square — 0 px',  value: '0px'    },
            { label: 'Small — 4 px',   value: '4px'    },
            { label: 'Medium — 6 px',  value: '6px'    },
            { label: 'Large — 8 px',   value: '8px'    },
            { label: 'Pill — 9999 px', value: '9999px' },
          ],
          defaultValue: '6px',
        },
        {
          name: 'appearance',
          type: 'select',
          label: 'Default Appearance',
          options: [
            { label: 'Solid (filled)',   value: 'solid'   },
            { label: 'Outline (border)', value: 'outline' },
            { label: 'Ghost (text)',     value: 'ghost'   },
            { label: 'Soft (tinted)',    value: 'soft'    },
          ],
          defaultValue: 'solid',
        },
        {
          name: 'shadow',
          type: 'select',
          label: 'Drop Shadow',
          options: [
            { label: 'None',   value: 'none' },
            { label: 'Small',  value: 'sm'   },
            { label: 'Medium', value: 'md'   },
          ],
          defaultValue: 'none',
        },
      ],
    },

    // ─── Shadows ─────────────────────────────────────────────────────────────
    {
      name: 'shadows',
      type: 'group',
      label: 'Shadows',
      fields: [
        {
          name: 'card',
          type: 'select',
          label: 'Card / Panel Shadow',
          options: [
            { label: 'None',         value: 'none' },
            { label: 'Subtle (sm)',  value: 'sm'   },
            { label: 'Medium (md)',  value: 'md'   },
            { label: 'Elevated (lg)', value: 'lg'  },
          ],
          defaultValue: 'sm',
        },
        {
          name: 'overlay',
          type: 'select',
          label: 'Dialog / Drawer Shadow',
          options: [
            { label: 'Medium (md)',    value: 'md' },
            { label: 'Large (lg)',     value: 'lg' },
            { label: 'Extra Large (xl)', value: 'xl' },
          ],
          defaultValue: 'xl',
        },
      ],
    },

    // ─── Layout ──────────────────────────────────────────────────────────────
    {
      name: 'layout',
      type: 'group',
      label: 'Layout',
      fields: [
        {
          name: 'sidePadding',
          type: 'select',
          label: 'Section Side Padding',
          options: [
            { label: 'None',          value: 'none'  },
            { label: 'Tight — 24 px', value: '24px'  },
            { label: 'Normal — 48 px', value: '48px' },
            { label: 'Wide — 80 px',  value: '80px'  },
          ],
          defaultValue: '48px',
          admin: { description: 'Horizontal padding applied inside full-width section wrappers.' },
        },
        {
          name: 'proseWidth',
          type: 'select',
          label: 'Reading / Prose Max Width',
          options: [
            { label: 'Narrow — 640 px',  value: '640px' },
            { label: 'Normal — 800 px',  value: '800px' },
            { label: 'Wide — 960 px',    value: '960px' },
          ],
          defaultValue: '800px',
          admin: { description: 'Max width for long-form body text columns (RichText block, blog posts).' },
        },
      ],
    },
  ],
}
