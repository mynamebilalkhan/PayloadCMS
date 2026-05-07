/**
 * POST /api/blocks/preview
 *
 * Renders a block instance as HTML for the admin preview panel.
 * Returns a minimal HTML document that can be displayed in an iframe.
 *
 * Body (JSON):
 *   { blockSlug: string, versionId: string, data: Record<string, unknown> }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateBlockData } from '@/validation'
import type { BlockSchema } from '@/validation/types'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { blockSlug?: string; versionId?: string; data?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { versionId, data } = body
  if (!versionId || !data) {
    return NextResponse.json({ error: '"versionId" and "data" are required.' }, { status: 400 })
  }

  // Load the version
  const version = await payload.findByID({
    collection: 'block-definition-versions',
    id: versionId,
    depth: 1,
  })

  if (!version) {
    return NextResponse.json({ error: 'Version not found.' }, { status: 404 })
  }

  const schema = version.schema as unknown as BlockSchema

  // Validate data against schema
  const validation = validateBlockData(schema, data)
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Data validation failed', details: validation.errors },
      { status: 422 },
    )
  }

  // Return validation pass + schema for client-side preview rendering
  return NextResponse.json({ valid: true, schema, data })
}
