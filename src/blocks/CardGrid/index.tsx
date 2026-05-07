import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

interface Card {
  title: string
  description?: string
  image?: { url: string; alt: string }
  linkLabel?: string
  linkUrl?: string
}

interface CardGridData {
  heading?: string
  columns?: 2 | 3 | 4
  cards?: Card[]
}

const colClass: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function CardGridBlock({ data, anchor }: BlockComponentProps<CardGridData>) {
  const { heading, columns = 3, cards = [] } = data

  return (
    <section id={anchor ?? undefined} className="px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {heading && <h2 className="text-3xl font-bold mb-8 text-center">{heading}</h2>}
        <div className={`grid gap-6 ${colClass[columns] ?? colClass[3]}`}>
          {cards.map((card, i) => (
            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {card.image?.url && (
                <img src={card.image.url} alt={card.image.alt ?? ''} className="w-full h-48 object-cover" />
              )}
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                {card.description && <p className="text-gray-600 mb-4">{card.description}</p>}
                {card.linkLabel && card.linkUrl && (
                  <a href={card.linkUrl} className="text-blue-600 font-medium hover:underline">
                    {card.linkLabel}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const cardGridSchema = {
  fields: [
    { name: 'heading', type: 'text', label: 'Section Heading' },
    {
      name: 'columns',
      type: 'select',
      label: 'Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Cards',
      fields: [
        { name: 'title', type: 'text', label: 'Title', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'image', type: 'image', label: 'Image' },
        { name: 'linkLabel', type: 'text', label: 'Link Label' },
        { name: 'linkUrl', type: 'url', label: 'Link URL' },
      ],
    },
  ],
}
