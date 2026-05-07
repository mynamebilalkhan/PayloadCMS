/**
 * POST /api/blocks/save
 *
 * External endpoint for saving / publishing block schemas.
 * This is what the payload-block-builder CLI / UI calls instead of
 * generating TypeScript files.
 *
 * Body (JSON):
 *   SaveSchemaRequest — see src/builder/types.ts
 *
 * Auth: requires a valid Payload API key passed as `Authorization: Bearer <token>`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { saveSchemaLocally } from '@/builder/saveSchema'
import type { SaveSchemaRequest } from '@/builder/types'

export async function POST(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  // Validate the token against Payload's users collection
  const { user } = await payload.auth({
    headers: req.headers,
  })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: SaveSchemaRequest
  try {
    body = (await req.json()) as SaveSchemaRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.blockSlug || !body.schema) {
    return NextResponse.json(
      { error: '"blockSlug" and "schema" are required.' },
      { status: 400 },
    )
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const result = await saveSchemaLocally(payload, body)

  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed', details: result.errors }, { status: 422 })
  }

  return NextResponse.json(result, { status: 201 })
}
