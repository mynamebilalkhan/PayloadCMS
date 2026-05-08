import type { CollectionConfig } from 'payload'

import { Testimonials } from '@/blocks/Generic/Testimonials/config'
import { hero } from '../heros/config'

// import { OverviewField } from "@/fields/OverviewField";
// import { MetaTitleField } from "@/fields/MetaTitleField";
// import { MetaImageField } from "@/fields/MetaImageField";
// import { MetaDescriptionField } from "@/fields/MetaDescriptionField";
// import { PreviewField } from "@/fields/PreviewField";

/**
 * pages: stores page content as a dynamic array of block instances.
 *
 * Each layout entry references:
 *   - blockDefinition: which block type
 *   - blockVersion:    which schema version was in use when this instance was created
 *   - data:            the actual field values (validated client-side against the schema)
 *
 * Backward compatibility: pages pin to a specific blockVersion, so schema updates
 * never break existing content — old pages continue rendering with the version they
 * were authored against.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Site pages composed from dynamic block instances.',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    preview: (doc) => {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
      return `${serverUrl}/${doc.slug}`
    },
  },
  access: {
    read: ({ req }) => {
      // Published pages are public; drafts require auth
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.slug) {
          data.slug = data.slug
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9/]+/g, '-')
            .replace(/^-|-$/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    // ─── Meta ──────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: { description: 'URL path, e.g. "about-us". Use "/" for the homepage.' },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Slug is required.'
        if (!/^[a-z0-9/-]+$/.test(value)) return 'Slug must be lowercase with hyphens or slashes.'
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      label: 'Status',
    },
    // ─── SEO ───────────────────────────────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'OG Image',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          label: 'No Index',
          defaultValue: false,
        },
      ],
    },
    // ─── Page Builder ──────────────────────────────────────────────────────
    {
      name: 'dbLayout',
      type: 'array',
      label: 'Page Builder',
      admin: {
        description: 'Build the page with reusable dynamic sections.',
      },
      fields: [
        {
          name: 'blockDefinition',
          type: 'relationship',
          relationTo: 'block-definitions',
          required: true,
          label: 'Block Type',
          filterOptions: {
            isDeprecated: { not_equals: true },
          },
        },
        {
          name: 'blockVersion',
          type: 'relationship',
          relationTo: 'block-definition-versions',
          required: true,
          label: 'Schema Version',
          admin: {
            description:
              'Pinned schema version. Locked after first save to preserve backward compatibility.',
            condition: (_, siblingData) => Boolean(siblingData?.blockDefinition),
          },
          filterOptions: ({ siblingData }) => {
            const data = siblingData as Record<string, unknown> | undefined
            if (!data?.blockDefinition) return false
            return { blockDefinition: { equals: data.blockDefinition } }
          },
        },
        {
          name: 'instanceId',
          type: 'text',
          label: 'Instance ID',
          admin: {
            readOnly: true,
            description: 'Stable unique ID for this block instance (for reuse and targeting).',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Instance Label',
          admin: { description: 'Optional editor label for this block instance.' },
        },
        {
          name: 'data',
          type: 'json',
          required: true,
          label: 'Block Data',
          admin: {
            description:
              'Field values for this block instance. Must conform to the pinned schema version.',
            components: {
              Field: '@/components/BlockDataField#BlockDataField',
            },
          },
        },
        {
          name: 'hidden',
          type: 'checkbox',
          label: 'Hidden',
          defaultValue: false,
          admin: { description: 'Hide this block on the frontend without deleting it.' },
        },
        {
          name: 'anchor',
          type: 'text',
          label: 'Anchor ID',
          admin: {
            description:
              'Optional HTML anchor for deep-linking, e.g. "about-section". Rendered as id attribute.',
          },
        },
      ],
    },
    // ─── Content Blocks ────────────────────────────────────────────────────
    // hero,
    {
      name: 'contentBlocks',
      type: 'blocks',
      label: 'Content Blocks',
      blocks: [
        // Generic
        Testimonials,
      ],
      admin: {
        initCollapsed: true,
        description: 'Add structured content sections to this page.',
      },
    },
  ],
  timestamps: true,
}
