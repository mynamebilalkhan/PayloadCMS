/**
 * Seed script — creates initial block definitions in the database.
 *
 * Run with:
 *   pnpm seed
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { saveSchemaLocally } from '@/builder'
import { heroBannerSchema } from '@/blocks/HeroBanner'

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding block definitions...\n')

  const blocks: Parameters<typeof saveSchemaLocally>[1][] = [
    {
      blockSlug: 'hero-banner',
      name: 'Hero Banner',
      description: 'Full-width hero section with heading, subheading, image, and CTA.',
      category: 'layout',
      schema: heroBannerSchema,
      changelog: 'Initial version',
    },
    {
      blockSlug: 'rich-text',
      name: 'Rich Text',
      description: 'WYSIWYG content block.',
      category: 'content',
      schema: {
        fields: [
          { name: 'content', type: 'richtext', label: 'Content', required: true },
          {
            name: 'alignment',
            type: 'select',
            label: 'Text Alignment',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ],
            defaultValue: 'left',
          },
        ],
      },
      changelog: 'Initial version',
    },
    {
      blockSlug: 'card-grid',
      name: 'Card Grid',
      description: 'Grid of cards with title, description, and optional image.',
      category: 'content',
      schema: {
        fields: [
          { name: 'heading', type: 'text', label: 'Section Heading' },
          {
            name: 'cards',
            type: 'array',
            label: 'Cards',
            minRows: 1,
            maxRows: 12,
            fields: [
              { name: 'title', type: 'text', label: 'Card Title', required: true },
              { name: 'description', type: 'textarea', label: 'Description' },
              { name: 'image', type: 'image', label: 'Card Image' },
              { name: 'linkUrl', type: 'url', label: 'Link URL' },
              { name: 'linkLabel', type: 'text', label: 'Link Label' },
            ],
          },
          {
            name: 'columns',
            type: 'select',
            label: 'Columns',
            options: [
              { label: '2 Columns', value: '2' },
              { label: '3 Columns', value: '3' },
              { label: '4 Columns', value: '4' },
            ],
            defaultValue: '3',
          },
        ],
      },
      changelog: 'Initial version',
    },
  ]

  for (const block of blocks) {
    const result = await saveSchemaLocally(payload, block)
    if (result.success) {
      console.log(`✓ ${block.blockSlug} — version ${result.versionNumber} (${result.versionId})`)
      if (result.warnings?.length) {
        result.warnings.forEach((w) => console.warn(`  ⚠ ${w}`))
      }
    } else {
      console.error(`✗ ${block.blockSlug}:`, result.errors?.join(', '))
    }
  }

  console.log('\nDone.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
