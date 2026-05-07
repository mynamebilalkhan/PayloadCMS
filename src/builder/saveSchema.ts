/**
 * saveSchema — replaces the old "generate TS file" export logic.
 *
 * Instead of writing TypeScript block files to disk, this module:
 *   1. Normalises the raw schema input
 *   2. Validates it strictly
 *   3. Calls the Payload local API to persist the schema as a new version
 *
 * Designed to run server-side (Node / Next.js API route / Payload hook).
 * For client-side / external use, see saveSchemaViaHttp().
 */

import type { BasePayload } from 'payload'
import type { SaveSchemaRequest, SaveSchemaResult } from './types'
import { normaliseSchema } from './normalizer'
import { validateBlockSchema } from '@/validation'

// ─── Local API (server-side) ──────────────────────────────────────────────────

/**
 * Save / update a block schema using Payload's local API.
 * Call from server components, API routes, or Payload hooks.
 */
export async function saveSchemaLocally(
  payload: BasePayload,
  request: SaveSchemaRequest,
): Promise<SaveSchemaResult> {
  const { blockSlug, name, description, category, schema: rawSchema, changelog } = request

  // 1 — Normalise
  const schema = normaliseSchema(rawSchema as Parameters<typeof normaliseSchema>[0])

  // 2 — Validate
  const validation = validateBlockSchema(schema)
  if (!validation.valid) {
    return {
      success: false,
      definitionId: '',
      versionId: '',
      versionNumber: 0,
      errors: validation.errors,
      warnings: validation.warnings,
    }
  }

  try {
    // 3 — Find or create the BlockDefinition
    // Use string | number to stay compatible with both mongo (string) and postgres (number) IDs
    let definitionId: string | number

    const existing = await payload.find({
      collection: 'block-definitions',
      where: { slug: { equals: blockSlug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      definitionId = existing.docs[0].id

      // Optional: update mutable fields on the definition
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {}
      if (description !== undefined) updates.description = description
      if (category !== undefined) updates.category = category
      if (name !== undefined) updates.name = name

      if (Object.keys(updates).length > 0) {
        await payload.update({
          collection: 'block-definitions',
          id: definitionId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: updates as any,
        })
      }
    } else {
      if (!name) {
        return {
          success: false,
          definitionId: '',
          versionId: '',
          versionNumber: 0,
          errors: [`Block definition "${blockSlug}" not found. Provide a "name" to create it.`],
          warnings: validation.warnings,
        }
      }

      const created = await payload.create({
        collection: 'block-definitions',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          slug: blockSlug,
          name,
          description,
          category: (category ?? 'content') as 'content',
        } as any,
      })
      definitionId = created.id
    }

    // 4 — Create a new immutable version
    const version = await payload.create({
      collection: 'block-definition-versions',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        blockDefinition: definitionId,
        // BlockSchema is a valid JSON object; cast to satisfy Payload's json field type
        schema: schema as unknown as Record<string, unknown>,
        changelog: changelog ?? '',
        isStable: true,
        blockSlug,
      } as any,
    })

    return {
      success: true,
      definitionId: String(definitionId),
      versionId: String(version.id),
      versionNumber: (version as unknown as { versionNumber?: number }).versionNumber ?? 0,
      warnings: validation.warnings,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      definitionId: '',
      versionId: '',
      versionNumber: 0,
      errors: [`Unexpected error: ${message}`],
      warnings: validation.warnings,
    }
  }
}

// ─── HTTP API (client-side / external) ───────────────────────────────────────

interface SaveSchemaHttpOptions {
  /** Base URL of the Payload instance, e.g. "http://localhost:3000" */
  baseUrl: string
  /** Bearer token for Payload API authentication */
  apiKey: string
}

/**
 * Save a schema via Payload's REST API.
 * Use this from external tools (CLI, browser, other services).
 */
export async function saveSchemaViaHttp(
  request: SaveSchemaRequest,
  options: SaveSchemaHttpOptions,
): Promise<SaveSchemaResult> {
  const { blockSlug, name, description, category, schema: rawSchema, changelog } = request
  const { baseUrl, apiKey } = options

  // 1 — Normalise + validate locally before sending
  const schema = normaliseSchema(rawSchema as Parameters<typeof normaliseSchema>[0])
  const validation = validateBlockSchema(schema)
  if (!validation.valid) {
    return {
      success: false,
      definitionId: '',
      versionId: '',
      versionNumber: 0,
      errors: validation.errors,
      warnings: validation.warnings,
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  try {
    // 3a — Find or create definition
    const searchRes = await fetch(
      `${baseUrl}/api/block-definitions?where[slug][equals]=${encodeURIComponent(blockSlug)}&limit=1`,
      { headers },
    )
    if (!searchRes.ok) throw new Error(`Definition lookup failed: ${searchRes.statusText}`)

    const searchData = (await searchRes.json()) as { docs: Array<{ id: string }> }
    let definitionId: string

    if (searchData.docs.length > 0) {
      definitionId = String(searchData.docs[0].id)

      const patchBody: Record<string, unknown> = {}
      if (name) patchBody.name = name
      if (description) patchBody.description = description
      if (category) patchBody.category = category

      if (Object.keys(patchBody).length > 0) {
        await fetch(`${baseUrl}/api/block-definitions/${definitionId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(patchBody),
        })
      }
    } else {
      if (!name) {
        return {
          success: false,
          definitionId: '',
          versionId: '',
          versionNumber: 0,
          errors: [`Block definition "${blockSlug}" not found. Provide a "name" to create it.`],
        }
      }
      const createRes = await fetch(`${baseUrl}/api/block-definitions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ slug: blockSlug, name, description, category: category ?? 'content' }),
      })
      if (!createRes.ok) throw new Error(`Create definition failed: ${createRes.statusText}`)
      const created = (await createRes.json()) as { doc: { id: string } }
      definitionId = String(created.doc.id)
    }

    // 3b — Create version
    const versionRes = await fetch(`${baseUrl}/api/block-definition-versions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        blockDefinition: definitionId,
        schema,
        changelog: changelog ?? '',
        isStable: true,
        blockSlug,
      }),
    })
    if (!versionRes.ok) throw new Error(`Create version failed: ${versionRes.statusText}`)
    const versionData = (await versionRes.json()) as {
      doc: { id: string; versionNumber: number }
    }

    return {
      success: true,
      definitionId,
      versionId: String(versionData.doc.id),
      versionNumber: versionData.doc.versionNumber ?? 0,
      warnings: validation.warnings,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      definitionId: '',
      versionId: '',
      versionNumber: 0,
      errors: [`HTTP error: ${message}`],
      warnings: validation.warnings,
    }
  }
}
