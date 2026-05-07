import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { DynamicRenderer } from '@/renderer'
import type { PopulatedBlockInstance } from '@/renderer'
import type { Metadata } from 'next'

// ─── Types ────────────────────────────────────────────────────────────────────

type Params = Promise<{ slug?: string[] }>

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPage(slug: string) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 3, // populate blockDefinition + blockVersion relationships
  })

  return result.docs[0] ?? null
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug: slugParts } = await params
  const slug = slugParts?.join('/') ?? '/'
  const page = await getPage(slug)

  if (!page) return { title: 'Not Found' }

  const seo = page.seo as
    | {
        metaTitle?: string
        metaDescription?: string
        noIndex?: boolean
      }
    | undefined

  return {
    title: seo?.metaTitle ?? (page.title as string),
    description: seo?.metaDescription ?? undefined,
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

// ─── Static params (optional — for SSG) ───────────────────────────────────────
// Returns [] gracefully when the DB is unreachable (e.g. during local dev cold-start).

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const pages = await payload.find({
      collection: 'pages',
      where: { status: { equals: 'published' } },
      limit: 200,
    })
    return pages.docs.map((page) => ({
      slug: (page.slug as string).split('/').filter(Boolean),
    }))
  } catch {
    return []
  }
}

// ─── Page component ───────────────────────────────────────────────────────────

export default async function FrontendPage({ params }: { params: Params }) {
  const { slug: slugParts } = await params
  // The catch-all [[...slug]] means the homepage is slug = undefined → "/"
  const slug = slugParts?.join('/') ?? '/'

  const page = await getPage(slug)
  if (!page) notFound()

  const layout = (page.layout ?? []) as unknown as PopulatedBlockInstance[]

  return (
    <main>
      <DynamicRenderer layout={layout} />
    </main>
  )
}
