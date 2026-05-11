'use client'

import React, { useState } from 'react'
import type { BlockComponentProps } from '@/renderer/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FAQVariant = 'default' | 'minimal' | 'dark' | 'flush'

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQData {
  variant?: FAQVariant
  sectionLabel?: string
  heading?: string
  subheading?: string
  layout?: 'single-column' | 'two-column'
  items?: FAQItem[]
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const V = {
  default: {
    section:  'bg-white',
    label:    'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading:  'text-gray-900',
    sub:      'text-gray-500',
    item:     'rounded-xl border border-gray-100 bg-gray-50',
    question: 'text-gray-900',
    answer:   'text-gray-600',
    icon:     'text-indigo-600',
    divider:  '',
  },
  minimal: {
    section:  'bg-gray-50',
    label:    'text-gray-600 bg-white border-gray-200',
    heading:  'text-gray-900',
    sub:      'text-gray-500',
    item:     'rounded-xl border border-gray-200 bg-white',
    question: 'text-gray-900',
    answer:   'text-gray-600',
    icon:     'text-gray-500',
    divider:  '',
  },
  dark: {
    section:  'bg-gray-950',
    label:    'text-indigo-400 bg-indigo-950 border-indigo-800',
    heading:  'text-white',
    sub:      'text-gray-400',
    item:     'rounded-xl border border-gray-800 bg-gray-900',
    question: 'text-white',
    answer:   'text-gray-400',
    icon:     'text-indigo-400',
    divider:  '',
  },
  flush: {
    section:  'bg-white',
    label:    'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading:  'text-gray-900',
    sub:      'text-gray-500',
    item:     'border-0 border-b border-gray-100 rounded-none',
    question: 'text-gray-900',
    answer:   'text-gray-600',
    icon:     'text-gray-400',
    divider:  '',
  },
} satisfies Record<FAQVariant, Record<string, string>>

// ─── Component ────────────────────────────────────────────────────────────────

export function FAQBlock({ data, anchor }: BlockComponentProps<FAQData>) {
  const {
    variant = 'default',
    sectionLabel,
    heading,
    subheading,
    layout = 'single-column',
    items = [],
  } = data

  const v = V[variant] ?? V.default
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(i: number) {
    setOpenIndex(prev => (prev === i ? null : i))
  }

  return (
    <section id={anchor ?? undefined} className={`relative py-20 sm:py-24 ${v.section}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        {(sectionLabel || heading || subheading) && (
          <div className="mb-14 text-center">
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

        {/* Items */}
        {items.length > 0 && (
          <div className={[
            layout === 'two-column' ? 'grid gap-3 sm:grid-cols-2' : 'mx-auto max-w-3xl flex flex-col gap-3',
            variant === 'flush' ? 'gap-0' : '',
          ].join(' ')}>
            {items.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <div key={i} className={`overflow-hidden ${v.item}`}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className={`flex w-full items-start justify-between gap-4 px-5 py-4 text-left`}
                  >
                    <span className={`text-sm font-semibold leading-snug ${v.question}`}>
                      {item.question}
                    </span>
                    <ChevronIcon open={isOpen} className={v.icon} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className={`text-sm leading-relaxed ${v.answer}`}>{item.answer}</p>
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

function ChevronIcon({ open, className }: { open: boolean; className: string }) {
  return (
    <svg
      className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className}`}
      viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6l5 5 5-5" />
    </svg>
  )
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const faqSchema = {
  fields: [
    {
      name: 'variant', type: 'select', label: 'Variant',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Dark',    value: 'dark'    },
        { label: 'Flush',   value: 'flush'   },
      ],
      defaultValue: 'default',
    },
    {
      name: 'layout', type: 'select', label: 'Layout',
      options: [
        { label: 'Single Column', value: 'single-column' },
        { label: 'Two Column',    value: 'two-column'    },
      ],
      defaultValue: 'single-column',
    },
    { name: 'sectionLabel', type: 'text',     label: 'Section Label' },
    { name: 'heading',      type: 'text',     label: 'Section Heading' },
    { name: 'subheading',   type: 'textarea', label: 'Subheading' },
    {
      name: 'items', type: 'array', label: 'FAQ Items', minRows: 1,
      fields: [
        { name: 'question', type: 'text',     label: 'Question', required: true },
        { name: 'answer',   type: 'textarea', label: 'Answer',   required: true },
      ],
    },
  ],
}
