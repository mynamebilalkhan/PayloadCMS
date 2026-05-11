import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

interface RichTextData {
  content?: string
  alignment?: 'left' | 'center' | 'right'
}

const alignClass: Record<string, string> = {
  left:   'text-left',
  center: 'text-center mx-auto',
  right:  'text-right ml-auto',
}

export function RichTextBlock({ data, anchor }: BlockComponentProps<RichTextData>) {
  const { content, alignment = 'left' } = data

  if (!content) return null

  return (
    <section id={anchor ?? undefined} className="relative bg-white py-16 sm:py-20">

      {/* Subtle top divider */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={[
            'max-w-3xl',
            alignClass[alignment] ?? alignClass.left,
          ].join(' ')}
        >
          <div
            className={[
              'prose prose-lg prose-gray max-w-none',
              'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900',
              'prose-p:text-gray-600 prose-p:leading-relaxed',
              'prose-a:text-indigo-600 prose-a:font-medium hover:prose-a:text-indigo-700',
              'prose-strong:text-gray-900 prose-strong:font-semibold',
              'prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-indigo-700 prose-code:font-mono prose-code:text-sm',
              'prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic',
              'prose-ul:marker:text-indigo-500 prose-ol:marker:text-indigo-600',
              alignment === 'center' ? '[&>*]:mx-auto' : '',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

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
