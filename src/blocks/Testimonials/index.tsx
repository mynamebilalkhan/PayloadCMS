import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TestimonialsVariant = 'default' | 'minimal' | 'dark' | 'featured'

export interface TestimonialItem {
  quote: string
  name: string
  title?: string
  company?: string
  avatar?: { url: string; alt?: string }
  rating?: number
}

export interface TestimonialsData {
  variant?: TestimonialsVariant
  sectionLabel?: string
  heading?: string
  subheading?: string
  testimonials?: TestimonialItem[]
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const V = {
  default: {
    section: 'bg-white',
    label:   'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading: 'text-gray-900',
    sub:     'text-gray-500',
    card:    'bg-gray-50 border border-gray-100',
    quote:   'text-gray-700',
    name:    'text-gray-900',
    meta:    'text-gray-500',
  },
  minimal: {
    section: 'bg-gray-50',
    label:   'text-gray-600 bg-white border-gray-200',
    heading: 'text-gray-900',
    sub:     'text-gray-500',
    card:    'bg-white border border-gray-200 shadow-sm',
    quote:   'text-gray-700',
    name:    'text-gray-900',
    meta:    'text-gray-500',
  },
  dark: {
    section: 'bg-gray-950',
    label:   'text-indigo-400 bg-indigo-950 border-indigo-800',
    heading: 'text-white',
    sub:     'text-gray-400',
    card:    'bg-gray-900 border border-gray-800',
    quote:   'text-gray-300',
    name:    'text-white',
    meta:    'text-gray-500',
  },
  featured: {
    section: 'bg-white',
    label:   'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading: 'text-gray-900',
    sub:     'text-gray-500',
    card:    'bg-indigo-50 border border-indigo-100',
    quote:   'text-gray-700',
    name:    'text-gray-900',
    meta:    'text-gray-500',
  },
} satisfies Record<TestimonialsVariant, Record<string, string>>

// ─── Component ────────────────────────────────────────────────────────────────

export function TestimonialsBlock({ data, anchor }: BlockComponentProps<TestimonialsData>) {
  const {
    variant = 'default',
    sectionLabel,
    heading,
    subheading,
    testimonials = [],
  } = data

  const v = V[variant] ?? V.default
  const isFeatured = variant === 'featured' && testimonials.length > 0

  return (
    <section id={anchor ?? undefined} className={`relative py-20 sm:py-24 ${v.section}`}>

      {variant === 'dark' && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-800 to-transparent" aria-hidden="true" />
      )}

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        {(sectionLabel || heading || subheading) && (
          <div className="mb-16 text-center">
            {sectionLabel && (
              <span className={`mb-4 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${v.label}`}>
                {sectionLabel}
              </span>
            )}
            {heading && (
              <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${v.heading}`}>{heading}</h2>
            )}
            {subheading && (
              <p className={`mt-4 mx-auto max-w-2xl text-lg leading-relaxed ${v.sub}`}>{subheading}</p>
            )}
          </div>
        )}

        {/* Featured layout: large first card + grid */}
        {isFeatured ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Large featured card */}
            <TestimonialCard item={testimonials[0]!} v={v} large />
            {/* Side stack */}
            <div className="flex flex-col gap-6">
              {testimonials.slice(1, 3).map((t, i) => (
                <TestimonialCard key={i} item={t} v={v} />
              ))}
            </div>
          </div>
        ) : (
          /* Standard grid */
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} item={t} v={v} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

// ─── Testimonial card ─────────────────────────────────────────────────────────

function TestimonialCard({
  item, v, large,
}: {
  item: TestimonialItem
  v: Record<string, string>
  large?: boolean
}) {
  const rating = Math.min(5, Math.max(1, Math.round(item.rating ?? 5)))
  const initials = item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={`flex flex-col gap-5 rounded-2xl p-6 ${large ? 'sm:p-8' : ''} ${v.card}`}>
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < rating} />
        ))}
      </div>

      {/* Quote */}
      <blockquote className={`leading-relaxed ${large ? 'text-lg' : 'text-sm'} ${v.quote}`}>
        &ldquo;{item.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mt-auto flex items-center gap-3">
        {item.avatar?.url ? (
          <img
            src={item.avatar.url}
            alt={item.avatar.alt ?? item.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
            {initials}
          </div>
        )}
        <div>
          <p className={`text-sm font-semibold ${v.name}`}>{item.name}</p>
          {(item.title || item.company) && (
            <p className={`text-xs ${v.meta}`}>
              {[item.title, item.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const testimonialsSchema = {
  fields: [
    {
      name: 'variant', type: 'select', label: 'Variant',
      options: [
        { label: 'Default',  value: 'default'  },
        { label: 'Minimal',  value: 'minimal'  },
        { label: 'Dark',     value: 'dark'     },
        { label: 'Featured', value: 'featured' },
      ],
      defaultValue: 'default',
    },
    { name: 'sectionLabel', type: 'text',     label: 'Section Label' },
    { name: 'heading',      type: 'text',     label: 'Section Heading' },
    { name: 'subheading',   type: 'textarea', label: 'Subheading' },
    {
      name: 'testimonials', type: 'array', label: 'Testimonials', minRows: 1,
      fields: [
        { name: 'quote',   type: 'textarea', label: 'Quote',          required: true },
        { name: 'name',    type: 'text',     label: 'Name',           required: true },
        { name: 'title',   type: 'text',     label: 'Title / Role' },
        { name: 'company', type: 'text',     label: 'Company' },
        { name: 'avatar',  type: 'image',    label: 'Avatar' },
        {
          name: 'rating', type: 'select', label: 'Star Rating',
          options: [
            { label: '5 stars', value: '5' },
            { label: '4 stars', value: '4' },
            { label: '3 stars', value: '3' },
          ],
          defaultValue: '5',
        },
      ],
    },
  ],
}
