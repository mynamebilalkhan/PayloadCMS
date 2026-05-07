/**
 * registry-setup.ts
 *
 * Central place to register all React block components with the renderer.
 * Import this file once at the top of your frontend entry point (e.g. layout.tsx).
 */

import { registry } from '@/renderer'
import type { BlockComponent } from '@/renderer'
import { HeroBannerBlock } from './HeroBanner'
import { RichTextBlock } from './RichText'
import { CardGridBlock } from './CardGrid'

registry.register('hero-banner', HeroBannerBlock as unknown as BlockComponent)
registry.register('rich-text', RichTextBlock as unknown as BlockComponent)
registry.register('card-grid', CardGridBlock as unknown as BlockComponent)

export { registry }
