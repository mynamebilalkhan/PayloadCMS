import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CTAVariant = 'default' | 'minimal' | 'dark' | 'gradient' | 'brand' | 'glass'
export type CTALayout  = 'centered' | 'split'

export interface CTAData {
  variant?: CTAVariant
  layout?: CTALayout
  sectionLabel?: string
  heading: string
  subheading?: string
  primaryCtaLabel?: string
  primaryCtaUrl?: string
  secondaryCtaLabel?: string
  secondaryCtaUrl?: string
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const V = {
  default: {
    outer:     'bg-indigo-50',
    inner:     'border border-indigo-100 bg-white rounded-3xl shadow-sm',
    label:     'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading:   'text-gray-900',
    sub:       'text-gray-500',
    primary:   'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
  },
  minimal: {
    outer:     'bg-gray-50',
    inner:     'border border-gray-200 bg-white rounded-3xl',
    label:     'text-gray-600 bg-white border-gray-200',
    heading:   'text-gray-900',
    sub:       'text-gray-500',
    primary:   'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  },
  dark: {
    outer:     'bg-gray-950',
    inner:     'border border-gray-800 bg-gray-900 rounded-3xl',
    label:     'text-indigo-400 bg-indigo-950 border-indigo-800',
    heading:   'text-white',
    sub:       'text-gray-400',
    primary:   'bg-indigo-500 text-white hover:bg-indigo-400',
    secondary: 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700',
  },
  gradient: {
    outer:     'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700',
    inner:     '',
    label:     'text-white bg-white/10 border-white/20',
    heading:   'text-white',
    sub:       'text-indigo-100',
    primary:   'bg-white text-indigo-700 hover:bg-indigo-50',
    secondary: 'border-white/30 bg-white/10 text-white hover:bg-white/20',
  },
  brand: {
    outer:     'bg-indigo-600',
    inner:     '',
    label:     'text-indigo-200 bg-indigo-500 border-indigo-400',
    heading:   'text-white',
    sub:       'text-indigo-200',
    primary:   'bg-white text-indigo-700 hover:bg-indigo-50',
    secondary: 'border-indigo-400 bg-indigo-500 text-white hover:bg-indigo-400',
  },
  glass: {
    outer:     'bg-gradient-to-br from-gray-900 to-gray-950',
    inner:     'border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl',
    label:     'text-indigo-300 bg-indigo-900/30 border-indigo-700',
    heading:   'text-white',
    sub:       'text-gray-300',
    primary:   'bg-indigo-500 text-white hover:bg-indigo-400',
    secondary: 'border-white/20 bg-white/5 text-white hover:bg-white/10',
  },
} satisfies Record<CTAVariant, Record<string, string>>

// ─── Component ────────────────────────────────────────────────────────────────

export function CTABlock({ data, anchor }: BlockComponentProps<CTAData>) {
  const {
    variant = 'default',
    layout = 'centered',
    sectionLabel,
    heading,
    subheading,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
  } = data

  const v = V[variant] ?? V.default
  const isSplit = layout === 'split'

  return (
    <section id={anchor ?? undefined} className={`relative py-20 sm:py-24 ${v.outer}`}>

      {/* Decorative glow for gradient/glass */}
      {(variant === 'gradient' || variant === 'glass') && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500 opacity-20 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 translate-x-1/2 rounded-full bg-indigo-500 opacity-20 blur-3xl" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={v.inner ? `p-8 sm:p-12 lg:p-16 ${v.inner}` : ''}>
          <div className={isSplit
            ? 'flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'
            : 'flex flex-col items-center gap-8 text-center'
          }>

            {/* Copy */}
            <div className={['flex flex-col gap-4', isSplit ? 'max-w-xl' : 'max-w-2xl items-center'].join(' ')}>
              {sectionLabel && (
                <span className={`inline-block w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${v.label}`}>
                  {sectionLabel}
                </span>
              )}
              <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${v.heading}`}>{heading}</h2>
              {subheading && (
                <p className={`text-lg leading-relaxed ${v.sub}`}>{subheading}</p>
              )}
            </div>

            {/* Buttons */}
            {(primaryCtaLabel || secondaryCtaLabel) && (
              <div className="flex flex-wrap items-center gap-4">
                {primaryCtaLabel && primaryCtaUrl && (
                  <a href={primaryCtaUrl} className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-colors ${v.primary}`}>
                    {primaryCtaLabel}
                    <ArrowIcon />
                  </a>
                )}
                {secondaryCtaLabel && secondaryCtaUrl && (
                  <a href={secondaryCtaUrl} className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold transition-colors ${v.secondary}`}>
                    {secondaryCtaLabel}
                  </a>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const ctaSchema = {
  fields: [
    {
      name: 'variant', type: 'select', label: 'Variant',
      options: [
        { label: 'Default',  value: 'default'  },
        { label: 'Minimal',  value: 'minimal'  },
        { label: 'Dark',     value: 'dark'     },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Brand',    value: 'brand'    },
        { label: 'Glass',    value: 'glass'    },
      ],
      defaultValue: 'default',
    },
    {
      name: 'layout', type: 'select', label: 'Layout',
      options: [
        { label: 'Centered', value: 'centered' },
        { label: 'Split',    value: 'split'    },
      ],
      defaultValue: 'centered',
    },
    { name: 'sectionLabel',      type: 'text',     label: 'Section Label' },
    { name: 'heading',           type: 'text',     label: 'Heading',   required: true },
    { name: 'subheading',        type: 'textarea', label: 'Subheading' },
    { name: 'primaryCtaLabel',   type: 'text',     label: 'Primary Button Label' },
    { name: 'primaryCtaUrl',     type: 'url',      label: 'Primary Button URL' },
    { name: 'secondaryCtaLabel', type: 'text',     label: 'Secondary Button Label' },
    { name: 'secondaryCtaUrl',   type: 'url',      label: 'Secondary Button URL' },
  ],
}
