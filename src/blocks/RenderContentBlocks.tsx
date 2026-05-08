type TestimonialsBlock = {
  blockType?: 'testimonials'
  blockName?: string | null
  items?: Array<{
    name?: string | null
    company?: string | null
    testimonial?: string | null
  }> | null
}

type ContentBlock = TestimonialsBlock & {
  id?: string | null
}

function TestimonialsBlockView({ block }: { block: TestimonialsBlock }) {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {block.blockName && <h2 className="mb-8 text-3xl font-bold">{block.blockName}</h2>}
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <figure key={index} className="rounded-lg border border-gray-200 p-6 shadow-sm">
              {item.testimonial && (
                <blockquote className="text-lg leading-relaxed">"{item.testimonial}"</blockquote>
              )}
              {(item.name || item.company) && (
                <figcaption className="mt-4 text-sm text-gray-600">
                  {item.name}
                  {item.name && item.company ? ', ' : ''}
                  {item.company}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function RenderContentBlocks({ blocks }: { blocks?: ContentBlock[] | null }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? `${block.blockType ?? 'block'}-${index}`

        switch (block.blockType) {
          case 'testimonials':
            return <TestimonialsBlockView block={block} key={key} />
          default:
            return null
        }
      })}
    </>
  )
}
