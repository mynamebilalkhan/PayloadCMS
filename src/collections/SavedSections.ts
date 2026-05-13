import type { CollectionConfig } from 'payload'

/**
 * saved-sections: reusable page sections that editors can save once and
 * reuse across multiple pages.
 *
 * Each document stores a snapshot of one or more populated block instances.
 * Editors can duplicate a saved section into any page's dbLayout, then edit
 * the copy independently (detached) — or keep it linked for future sync.
 *
 * Rendering: sections are resolved at page-save time into normal dbLayout
 * entries and rendered through the standard DynamicRenderer — no separate
 * rendering path.
 */
export const SavedSections: CollectionConfig = {
  slug: 'saved-sections',
  admin: {
    useAsTitle: 'title',
    group: 'Block System',
    description: 'Reusable page sections. Save once, reuse on multiple pages.',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.slug) {
          data.slug = data.slug
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-|-$/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    // ─── Identity ────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Section Title',
      admin: { description: 'Human-readable name shown in the section picker.' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      label: 'Slug',
      admin: {
        description: 'Machine-readable unique identifier. Auto-normalised to kebab-case.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: { description: 'Optional short description for the section picker.' },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { label: 'Hero',          value: 'hero'          },
        { label: 'Features',      value: 'features'      },
        { label: 'Testimonials',  value: 'testimonials'  },
        { label: 'Pricing',       value: 'pricing'       },
        { label: 'FAQ',           value: 'faq'           },
        { label: 'CTA',           value: 'cta'           },
        { label: 'Content',       value: 'content'       },
        { label: 'Navigation',    value: 'navigation'    },
        { label: 'Footer',        value: 'footer'        },
        { label: 'Other',         value: 'other'         },
      ],
      defaultValue: 'other',
    },
    {
      name: 'tags',
      type: 'text',
      label: 'Tags',
      admin: {
        description: 'Comma-separated tags for filtering, e.g. "dark, gradient, SaaS".',
      },
    },
    // ─── Preview ─────────────────────────────────────────────────────────────
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Thumbnail',
      admin: {
        description: 'Preview image shown in the section picker modal.',
      },
    },
    // ─── Block data ───────────────────────────────────────────────────────────
    // Stored as a JSON snapshot of one or more dbLayout entries (with
    // blockDefinition ID, blockVersion ID, and data).  This allows the section
    // to be expanded into real layout rows at page-save time without coupling
    // it to a specific page.
    {
      name: 'blocks',
      type: 'json',
      required: true,
      label: 'Block Snapshot',
      admin: {
        description:
          'JSON snapshot of layout block entries. Do not edit manually — use the "Save as Section" action from a page.',
      },
    },
    // ─── Sync ────────────────────────────────────────────────────────────────
    {
      name: 'syncEnabled',
      type: 'checkbox',
      label: 'Enable Sync',
      defaultValue: false,
      admin: {
        description:
          'When enabled, pages that include this section can pull updates when the section is edited here.',
      },
    },
  ],
  timestamps: true,
}
