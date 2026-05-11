import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PricingVariant = 'default' | 'minimal' | 'dark' | 'gradient'

export interface PricingFeature {
  text: string
}

export interface PricingPlan {
  name: string
  description?: string
  price: string
  period?: string
  highlighted?: boolean
  badge?: string
  features?: PricingFeature[]
  ctaLabel?: string
  ctaUrl?: string
}

export interface PricingData {
  variant?: PricingVariant
  sectionLabel?: string
  heading?: string
  subheading?: string
  plans?: PricingPlan[]
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const V = {
  default: {
    section:     'bg-gray-50',
    label:       'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading:     'text-gray-900',
    sub:         'text-gray-500',
    card:        'bg-white border border-gray-200 shadow-sm',
    cardHL:      'bg-indigo-600 border-indigo-600 shadow-xl',
    badge:       'bg-indigo-100 text-indigo-700',
    badgeHL:     'bg-white/20 text-white',
    planName:    'text-gray-900',
    planNameHL:  'text-white',
    planDesc:    'text-gray-500',
    planDescHL:  'text-indigo-200',
    price:       'text-gray-900',
    priceHL:     'text-white',
    period:      'text-gray-500',
    periodHL:    'text-indigo-200',
    feature:     'text-gray-600',
    featureHL:   'text-indigo-100',
    checkCircle: 'text-indigo-600',
    checkCircHL: 'text-white',
    cta:         'bg-indigo-600 text-white hover:bg-indigo-700',
    ctaHL:       'bg-white text-indigo-700 hover:bg-indigo-50',
    divider:     'border-gray-100',
    dividerHL:   'border-indigo-500',
  },
  minimal: {
    section:     'bg-white',
    label:       'text-gray-600 bg-gray-50 border-gray-200',
    heading:     'text-gray-900',
    sub:         'text-gray-500',
    card:        'bg-white border-2 border-gray-200',
    cardHL:      'bg-white border-2 border-gray-900 shadow-lg',
    badge:       'bg-gray-100 text-gray-700',
    badgeHL:     'bg-gray-900 text-white',
    planName:    'text-gray-900',
    planNameHL:  'text-gray-900',
    planDesc:    'text-gray-500',
    planDescHL:  'text-gray-500',
    price:       'text-gray-900',
    priceHL:     'text-gray-900',
    period:      'text-gray-500',
    periodHL:    'text-gray-500',
    feature:     'text-gray-600',
    featureHL:   'text-gray-600',
    checkCircle: 'text-gray-700',
    checkCircHL: 'text-gray-900',
    cta:         'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ctaHL:       'bg-gray-900 text-white hover:bg-gray-800',
    divider:     'border-gray-100',
    dividerHL:   'border-gray-200',
  },
  dark: {
    section:     'bg-gray-950',
    label:       'text-indigo-400 bg-indigo-950 border-indigo-800',
    heading:     'text-white',
    sub:         'text-gray-400',
    card:        'bg-gray-900 border border-gray-800',
    cardHL:      'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-900/30',
    badge:       'bg-gray-800 text-gray-300',
    badgeHL:     'bg-white/20 text-white',
    planName:    'text-white',
    planNameHL:  'text-white',
    planDesc:    'text-gray-400',
    planDescHL:  'text-indigo-200',
    price:       'text-white',
    priceHL:     'text-white',
    period:      'text-gray-400',
    periodHL:    'text-indigo-200',
    feature:     'text-gray-400',
    featureHL:   'text-indigo-100',
    checkCircle: 'text-indigo-400',
    checkCircHL: 'text-white',
    cta:         'bg-indigo-500 text-white hover:bg-indigo-400',
    ctaHL:       'bg-white text-indigo-700 hover:bg-indigo-50',
    divider:     'border-gray-800',
    dividerHL:   'border-indigo-500',
  },
  gradient: {
    section:     'bg-gradient-to-b from-white to-indigo-50',
    label:       'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading:     'text-gray-900',
    sub:         'text-gray-500',
    card:        'bg-white border border-gray-200 shadow-sm',
    cardHL:      'bg-gradient-to-b from-indigo-600 to-violet-700 border-0 shadow-2xl shadow-indigo-200',
    badge:       'bg-indigo-100 text-indigo-700',
    badgeHL:     'bg-white/20 text-white',
    planName:    'text-gray-900',
    planNameHL:  'text-white',
    planDesc:    'text-gray-500',
    planDescHL:  'text-indigo-200',
    price:       'text-gray-900',
    priceHL:     'text-white',
    period:      'text-gray-500',
    periodHL:    'text-indigo-200',
    feature:     'text-gray-600',
    featureHL:   'text-indigo-100',
    checkCircle: 'text-indigo-600',
    checkCircHL: 'text-white',
    cta:         'bg-indigo-600 text-white hover:bg-indigo-700',
    ctaHL:       'bg-white text-indigo-700 hover:bg-indigo-50',
    divider:     'border-gray-100',
    dividerHL:   'border-white/20',
  },
} satisfies Record<PricingVariant, Record<string, string>>

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingBlock({ data, anchor }: BlockComponentProps<PricingData>) {
  const {
    variant = 'default',
    sectionLabel,
    heading,
    subheading,
    plans = [],
  } = data

  const v = V[variant] ?? V.default

  return (
    <section id={anchor ?? undefined} className={`relative py-20 sm:py-24 ${v.section}`}>
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

        {/* Plans grid */}
        {plans.length > 0 && (
          <div className={[
            'grid gap-6 items-stretch',
            plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' :
            plans.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          ].join(' ')}>
            {plans.map((plan, i) => {
              const hl = Boolean(plan.highlighted)
              return (
                <div
                  key={i}
                  className={`relative flex flex-col rounded-2xl p-7 transition-all ${hl ? v.cardHL : v.card}`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <span className={`mb-4 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${hl ? v.badgeHL : v.badge}`}>
                      {plan.badge}
                    </span>
                  )}

                  {/* Plan name + description */}
                  <div className="mb-5">
                    <h3 className={`text-lg font-bold ${hl ? v.planNameHL : v.planName}`}>{plan.name}</h3>
                    {plan.description && (
                      <p className={`mt-1 text-sm ${hl ? v.planDescHL : v.planDesc}`}>{plan.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-extrabold tracking-tight ${hl ? v.priceHL : v.price}`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className={`mb-1 text-sm ${hl ? v.periodHL : v.period}`}>{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  {(plan.features?.length ?? 0) > 0 && (
                    <>
                      <hr className={`mb-6 border-t ${hl ? v.dividerHL : v.divider}`} />
                      <ul className="mb-8 flex flex-col gap-3">
                        {plan.features!.map((f, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${hl ? v.checkCircHL : v.checkCircle}`} />
                            <span className={`text-sm ${hl ? v.featureHL : v.feature}`}>{f.text}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* CTA */}
                  {plan.ctaLabel && (
                    <div className="mt-auto">
                      <a
                        href={plan.ctaUrl ?? '#'}
                        className={`block w-full rounded-xl px-5 py-3 text-center text-sm font-semibold transition-colors ${hl ? v.ctaHL : v.cta}`}
                      >
                        {plan.ctaLabel}
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 4" />
    </svg>
  )
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const pricingSchema = {
  fields: [
    {
      name: 'variant', type: 'select', label: 'Variant',
      options: [
        { label: 'Default',  value: 'default'  },
        { label: 'Minimal',  value: 'minimal'  },
        { label: 'Dark',     value: 'dark'     },
        { label: 'Gradient', value: 'gradient' },
      ],
      defaultValue: 'default',
    },
    { name: 'sectionLabel', type: 'text',     label: 'Section Label' },
    { name: 'heading',      type: 'text',     label: 'Section Heading' },
    { name: 'subheading',   type: 'textarea', label: 'Subheading' },
    {
      name: 'plans', type: 'array', label: 'Pricing Plans', minRows: 1, maxRows: 4,
      fields: [
        { name: 'name',        type: 'text',     label: 'Plan Name',    required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'price',       type: 'text',     label: 'Price (e.g. $49)', required: true },
        { name: 'period',      type: 'text',     label: 'Period (e.g. /month)' },
        { name: 'highlighted', type: 'checkbox', label: 'Highlight this plan',    defaultValue: false },
        { name: 'badge',       type: 'text',     label: 'Badge (e.g. Most Popular)' },
        {
          name: 'features', type: 'array', label: 'Features',
          fields: [
            { name: 'text', type: 'text', label: 'Feature', required: true },
          ],
        },
        { name: 'ctaLabel', type: 'text', label: 'CTA Button Label' },
        { name: 'ctaUrl',   type: 'url',  label: 'CTA Button URL' },
      ],
    },
  ],
}
