import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

interface Card {
  title: string
  description?: string
  image?: { url: string; alt?: string }
  linkLabel?: string
  linkUrl?: string
}

interface CardGridData {
  heading?: string
  subheading?: string
  columns?: '2' | '3' | '4'
  cards?: Card[]
}

const colClass: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const accentColors = [
  'bg-indigo-100 text-indigo-600',
  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
]

export function CardGridBlock({ data, anchor }: BlockComponentProps<CardGridData>) {
  const { heading, subheading, columns = '3', cards = [] } = data

  return (
    <section id={anchor ?? undefined} className="relative bg-white py-20 sm:py-24">

      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-50 opacity-60 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section header */}
        {(heading || subheading) && (
          <div className="mb-14 text-center">
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* Cards */}
        <div className={`grid gap-6 ${colClass[columns] ?? colClass['3']}`}>
          {cards.map((card, i) => {
            const accent = accentColors[i % accentColors.length]!

            return (
              <div
                key={i}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Card image OR colored accent bar */}
                {card.image?.url ? (
                  <img
                    src={card.image.url}
                    alt={card.image.alt ?? card.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className={`h-1.5 w-full ${accent.split(' ')[0]}`} />
                )}

                <div className="flex flex-1 flex-col gap-4 p-6">

                  {/* Icon circle (shown when no image) */}
                  {!card.image?.url && (
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                      <GridIcon />
                    </div>
                  )}

                  {/* Title + description */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                      {card.title}
                    </h3>
                    {card.description && (
                      <p className="text-sm leading-relaxed text-gray-500">{card.description}</p>
                    )}
                  </div>

                  {/* Link */}
                  {card.linkLabel && card.linkUrl && (
                    <div className="mt-auto pt-2">
                      <a
                        href={card.linkUrl}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
                      >
                        {card.linkLabel}
                        <ArrowIcon />
                      </a>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const cardGridSchema = {
  fields: [
    { name: 'heading',    type: 'text',     label: 'Section Heading' },
    { name: 'subheading', type: 'textarea', label: 'Subheading' },
    {
      name: 'cards',
      type: 'array',
      label: 'Cards',
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'title',       type: 'text',     label: 'Card Title',   required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'image',       type: 'image',    label: 'Card Image' },
        { name: 'linkUrl',     type: 'url',      label: 'Link URL' },
        { name: 'linkLabel',   type: 'text',     label: 'Link Label' },
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
}
