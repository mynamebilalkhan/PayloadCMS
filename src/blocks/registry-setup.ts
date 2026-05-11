/**
 * registry-setup.ts
 *
 * Central place to register all React block components with the renderer.
 * Import this file once at the top of the frontend entry point (layout.tsx).
 */

import { registry } from '@/renderer'
import type { BlockComponent } from '@/renderer'

// ─── Core blocks ──────────────────────────────────────────────────────────────
import { HeroBannerBlock } from './HeroBanner'
import { RichTextBlock }   from './RichText'
import { CardGridBlock }   from './CardGrid'

// ─── Prebuilt blocks ──────────────────────────────────────────────────────────
import { FeaturesBlock }     from './Features'
import { CTABlock }          from './CTA'
import { TestimonialsBlock } from './Testimonials'
import { FAQBlock }          from './FAQ'
import { PricingBlock }      from './Pricing'

// ─── Registrations ────────────────────────────────────────────────────────────

registry.register('hero-banner',  HeroBannerBlock  as unknown as BlockComponent)
registry.register('rich-text',    RichTextBlock    as unknown as BlockComponent)
registry.register('card-grid',    CardGridBlock    as unknown as BlockComponent)
registry.register('features',     FeaturesBlock    as unknown as BlockComponent)
registry.register('cta',          CTABlock         as unknown as BlockComponent)
registry.register('testimonials', TestimonialsBlock as unknown as BlockComponent)
registry.register('faq',          FAQBlock         as unknown as BlockComponent)
registry.register('pricing',      PricingBlock     as unknown as BlockComponent)

export { registry }
