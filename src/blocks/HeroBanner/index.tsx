/**
 * HeroBanner — example block component.
 * Register with: registry.register('hero-banner', HeroBannerBlock)
 *
 * Expected schema fields:
 *   - heading: text (required)
 *   - subheading: text
 *   - backgroundImage: image
 *   - ctaLabel: text
 *   - ctaUrl: url
 */

import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

interface HeroBannerData {
  heading: string
  subheading?: string
  backgroundImage?: { url: string; alt: string }
  ctaLabel?: string
  ctaUrl?: string
}

export function HeroBannerBlock({ data, anchor }: BlockComponentProps<HeroBannerData>) {
  const { heading, subheading, backgroundImage, ctaLabel, ctaUrl } = data

  return (
    <section
      id={anchor ?? undefined}
      className="relative min-h-[60vh] flex items-center justify-center text-center"
      style={
        backgroundImage?.url
          ? {
              backgroundImage: `url(${backgroundImage.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: '#1a1a2e' }
      }
    >
      <div className="relative z-10 px-6 py-12 max-w-3xl mx-auto text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{heading}</h1>
        {subheading && (
          <p className="text-xl md:text-2xl mb-8 opacity-90">{subheading}</p>
        )}
        {ctaLabel && ctaUrl && (
          <a
            href={ctaUrl}
            className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </section>
  )
}

/** Schema definition — publish via saveSchemaLocally() or POST /api/blocks/save */
export const heroBannerSchema = {
  fields: [
    { name: 'heading', type: 'text', label: 'Heading', required: true },
    { name: 'subheading', type: 'text', label: 'Subheading' },
    { name: 'backgroundImage', type: 'image', label: 'Background Image' },
    { name: 'ctaLabel', type: 'text', label: 'CTA Button Label' },
    { name: 'ctaUrl', type: 'url', label: 'CTA Button URL' },
  ],
}
