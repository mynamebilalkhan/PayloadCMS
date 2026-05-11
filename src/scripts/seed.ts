/**
 * Seed script — registers all block definitions and creates a full demo home page.
 *
 * Run with:
 *   pnpm seed
 *
 * Re-running is safe:
 *   - Block definitions are upserted (schema updated if already exists)
 *   - Home page is created only if it doesn't exist, or updated if it has < 4 layout blocks
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { saveSchemaLocally } from '@/builder'

// ─── Schema imports ───────────────────────────────────────────────────────────
import { heroBannerSchema }  from '@/blocks/HeroBanner'
import { richTextSchema }    from '@/blocks/RichText'
import { cardGridSchema }    from '@/blocks/CardGrid'
import { featuresSchema }    from '@/blocks/Features'
import { ctaSchema }         from '@/blocks/CTA'
import { testimonialsSchema } from '@/blocks/Testimonials'
import { faqSchema }         from '@/blocks/FAQ'
import { pricingSchema }     from '@/blocks/Pricing'

// ─── Preset imports ───────────────────────────────────────────────────────────
import { heroBannerPresets }   from '@/blocks/HeroBanner/presets'
import { featuresPresets }     from '@/blocks/Features/presets'
import { ctaPresets }          from '@/blocks/CTA/presets'
import { testimonialsPresets } from '@/blocks/Testimonials/presets'
import { faqPresets }          from '@/blocks/FAQ/presets'
import { pricingPresets }      from '@/blocks/Pricing/presets'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toId = (s: string) => parseInt(s, 10)

// ─── Block definition registry ────────────────────────────────────────────────

const blockDefs = [
  { blockSlug: 'hero-banner',  name: 'Hero Banner',  category: 'layout'  as const, description: 'Full-width hero section with variants, CTAs, and mockup.',          schema: heroBannerSchema,   changelog: 'Added variants and spacing controls' },
  { blockSlug: 'rich-text',    name: 'Rich Text',    category: 'content' as const, description: 'Styled prose content with alignment support.',                       schema: richTextSchema,     changelog: 'Enhanced prose styling' },
  { blockSlug: 'card-grid',    name: 'Card Grid',    category: 'content' as const, description: 'Responsive grid of feature cards with color accents.',               schema: cardGridSchema,     changelog: 'Added subheading field' },
  { blockSlug: 'features',     name: 'Features',     category: 'content' as const, description: 'Icon-based feature grid with 5 layout variants.',                   schema: featuresSchema,     changelog: 'Initial version' },
  { blockSlug: 'cta',          name: 'CTA',          category: 'content' as const, description: 'Call-to-action section with 6 style variants and centered/split layouts.', schema: ctaSchema,     changelog: 'Initial version' },
  { blockSlug: 'testimonials', name: 'Testimonials', category: 'content' as const, description: 'Customer testimonial grid with ratings and featured layout.',        schema: testimonialsSchema, changelog: 'Initial version' },
  { blockSlug: 'faq',          name: 'FAQ',          category: 'content' as const, description: 'Accordion FAQ block with single and two-column layouts.',            schema: faqSchema,          changelog: 'Initial version' },
  { blockSlug: 'pricing',      name: 'Pricing',      category: 'content' as const, description: 'Pricing plan cards with highlight support and 4 style variants.',    schema: pricingSchema,      changelog: 'Initial version' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding block definitions...\n')

  const results: Record<string, { definitionId: string; versionId: string }> = {}

  for (const block of blockDefs) {
    const result = await saveSchemaLocally(payload, block)
    if (result.success) {
      results[block.blockSlug] = {
        definitionId: result.definitionId,
        versionId: result.versionId,
      }
      console.log(`✓ ${block.blockSlug} — v${result.versionNumber} (id: ${result.versionId})`)
      if (result.warnings?.length) result.warnings.forEach(w => console.warn(`  ⚠ ${w}`))
    } else {
      console.error(`✗ ${block.blockSlug}:`, result.errors?.join(', '))
    }
  }

  // Abort if any definition failed
  const missing = blockDefs.filter(b => !results[b.blockSlug])
  if (missing.length > 0) {
    console.error(`\n✗ Aborting page seed — failed: ${missing.map(b => b.blockSlug).join(', ')}`)
    process.exit(1)
  }

  // ─── Home page ──────────────────────────────────────────────────────────────

  const r = results as Record<string, { definitionId: string; versionId: string }>

  const layoutBlocks = [
    // 1 — Hero
    {
      blockDefinition: toId(r['hero-banner']!.definitionId),
      blockVersion:    toId(r['hero-banner']!.versionId),
      label: 'Hero',
      hidden: false,
      data: heroBannerPresets[0]!.data,
    },
    // 2 — Features (SaaS)
    {
      blockDefinition: toId(r['features']!.definitionId),
      blockVersion:    toId(r['features']!.versionId),
      label: 'Features',
      hidden: false,
      anchor: 'features',
      data: featuresPresets[0]!.data,
    },
    // 3 — Testimonials (default grid)
    {
      blockDefinition: toId(r['testimonials']!.definitionId),
      blockVersion:    toId(r['testimonials']!.versionId),
      label: 'Testimonials',
      hidden: false,
      anchor: 'testimonials',
      data: testimonialsPresets[0]!.data,
    },
    // 4 — Pricing (SaaS tiers)
    {
      blockDefinition: toId(r['pricing']!.definitionId),
      blockVersion:    toId(r['pricing']!.versionId),
      label: 'Pricing',
      hidden: false,
      anchor: 'pricing',
      data: pricingPresets[0]!.data,
    },
    // 5 — FAQ
    {
      blockDefinition: toId(r['faq']!.definitionId),
      blockVersion:    toId(r['faq']!.versionId),
      label: 'FAQ',
      hidden: false,
      anchor: 'faq',
      data: faqPresets[0]!.data,
    },
    // 6 — CTA (bottom of page)
    {
      blockDefinition: toId(r['cta']!.definitionId),
      blockVersion:    toId(r['cta']!.versionId),
      label: 'CTA',
      hidden: false,
      data: ctaPresets[0]!.data,
    },
  ]

  console.log('\nChecking home page...')

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: '/' } },
    limit: 1,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageData: any = {
    title: 'Home',
    slug: '/',
    status: 'published',
    seo: {
      metaTitle: 'Dynamic Block Site — Build faster with blocks',
      metaDescription: 'Compose beautiful pages from reusable content blocks. Powered by Payload CMS and Next.js.',
    },
    dbLayout: layoutBlocks,
  }

  if (existing.docs.length > 0) {
    const page = existing.docs[0]!
    const currentLayoutLength = ((page.dbLayout as unknown[]) ?? []).length

    if (currentLayoutLength < 4) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload.update as any)({
        collection: 'pages',
        id: page.id,
        data: pageData,
      })
      console.log(`✓ Home page updated with full block demo (was ${currentLayoutLength} blocks, now ${layoutBlocks.length})`)
    } else {
      console.log(`→ Home page already has ${currentLayoutLength} blocks — skipping update`)
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (payload.create as any)({
      collection: 'pages',
      data: pageData,
    })
    console.log(`✓ Home page created with ${layoutBlocks.length} prebuilt blocks`)
  }

  console.log('\nDone. Run `pnpm dev` and visit http://localhost:3000 to see the demo.')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
