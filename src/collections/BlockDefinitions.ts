import type { CollectionConfig } from 'payload'
import { validateBlockSchema } from '@/validation'

/**
 * block-definitions: master registry of block types.
 * Each document represents one logical block (e.g. "HeroBanner", "CardGrid").
 * The *current* schema lives in the latest block-definition-versions entry.
 */
export const BlockDefinitions: CollectionConfig = {
  slug: 'block-definitions',
  admin: {
    useAsTitle: 'name',
    group: 'Block System',
    description: 'Registry of all available block types and their schemas.',
    defaultColumns: ['name', 'slug', 'category', 'currentVersion', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Normalise slug to kebab-case
        if (data.slug) {
          data.slug = data.slug
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Block Name',
      admin: { description: 'Human-readable name, e.g. "Hero Banner"' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'Machine-readable unique identifier, e.g. "hero-banner". Auto-normalised.',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Slug is required.'
        if (!/^[a-z0-9-]+$/.test(value)) return 'Slug must be lowercase alphanumeric with hyphens.'
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: { description: 'Optional description shown to content editors.' },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { label: 'Layout', value: 'layout' },
        { label: 'Content', value: 'content' },
        { label: 'Media', value: 'media' },
        { label: 'Navigation', value: 'navigation' },
        { label: 'Interactive', value: 'interactive' },
        { label: 'Data Display', value: 'data-display' },
        { label: 'Utility', value: 'utility' },
      ],
      defaultValue: 'content',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon',
      admin: { description: 'Optional icon name or emoji for admin UI.' },
    },
    {
      name: 'currentVersion',
      type: 'relationship',
      relationTo: 'block-definition-versions',
      label: 'Current Version',
      admin: {
        description: 'Points to the latest active schema version. Updated automatically on publish.',
        readOnly: true,
      },
    },
    {
      name: 'isDeprecated',
      type: 'checkbox',
      label: 'Deprecated',
      defaultValue: false,
      admin: {
        description:
          'Mark as deprecated to prevent new pages from using this block. Existing pages will still render.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Thumbnail',
      admin: {
        description:
          'Preview image shown in the Insert Block modal and block picker UI.',
      },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Preview Image (large)',
      admin: {
        description:
          'Full-size preview image shown when hovering a block in the picker.',
      },
    },
    {
      name: 'previewComponent',
      type: 'text',
      label: 'Preview Component Path',
      admin: {
        description:
          'Optional path to a React component used for preview rendering, e.g. "@/blocks/HeroBanner/Preview".',
      },
    },
  ],
  timestamps: true,
}
