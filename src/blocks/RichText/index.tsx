import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

interface RichTextData {
  content?: string
  alignment?: 'left' | 'center' | 'right'
}

export function RichTextBlock({ data, anchor }: BlockComponentProps<RichTextData>) {
  const { content, alignment = 'left' } = data

  if (!content) return null

  return (
    <section id={anchor ?? undefined} className={`px-6 py-10 max-w-3xl mx-auto text-${alignment}`}>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  )
}

export const richTextSchema = {
  fields: [
    { name: 'content', type: 'richtext', label: 'Content', required: true },
    {
      name: 'alignment',
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}
