/**
 * registry-setup.ts
 *
 * Central place to register all React block components with the renderer.
 * Import this file once at the top of your frontend entry point (e.g. layout.tsx).
 */

import { registry } from '@/renderer'
import type { BlockComponent } from '@/renderer'
import { HeroBannerBlock } from './HeroBanner'
import { RichTextBlock } from './RichText'
import { CardGridBlock } from './CardGrid'

// #region agent log
fetch('http://127.0.0.1:7540/ingest/a14dc86c-26b3-480a-82c3-a7aa9e20bfd7', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b0f619' },
  body: JSON.stringify({
    sessionId: 'b0f619',
    runId: 'pre-fix',
    hypothesisId: 'H1',
    location: 'src/blocks/registry-setup.ts:15',
    message: 'registry import shape',
    data: {
      registryType: typeof registry,
      registryConstructor: (registry as { constructor?: { name?: string } })?.constructor?.name ?? null,
      registryKeys: Object.keys((registry as Record<string, unknown>) ?? {}),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {})
// #endregion

// #region agent log
fetch('http://127.0.0.1:7540/ingest/a14dc86c-26b3-480a-82c3-a7aa9e20bfd7', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b0f619' },
  body: JSON.stringify({
    sessionId: 'b0f619',
    runId: 'pre-fix',
    hypothesisId: 'H2',
    location: 'src/blocks/registry-setup.ts:33',
    message: 'registry.register callable check',
    data: {
      hasRegisterProp: 'register' in (registry as object),
      registerType: typeof (registry as { register?: unknown })?.register,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {})
// #endregion

try {
  // #region agent log
  fetch('http://127.0.0.1:7540/ingest/a14dc86c-26b3-480a-82c3-a7aa9e20bfd7', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b0f619' },
    body: JSON.stringify({
      sessionId: 'b0f619',
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'src/blocks/registry-setup.ts:50',
      message: 'before first registry.register call',
      data: { slug: 'hero-banner' },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion
  registry.register('hero-banner', HeroBannerBlock as unknown as BlockComponent)
  registry.register('rich-text', RichTextBlock as unknown as BlockComponent)
  registry.register('card-grid', CardGridBlock as unknown as BlockComponent)

  // #region agent log
  fetch('http://127.0.0.1:7540/ingest/a14dc86c-26b3-480a-82c3-a7aa9e20bfd7', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b0f619' },
    body: JSON.stringify({
      sessionId: 'b0f619',
      runId: 'pre-fix',
      hypothesisId: 'H4',
      location: 'src/blocks/registry-setup.ts:63',
      message: 'all registrations completed',
      data: { ok: true },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7540/ingest/a14dc86c-26b3-480a-82c3-a7aa9e20bfd7', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b0f619' },
    body: JSON.stringify({
      sessionId: 'b0f619',
      runId: 'pre-fix',
      hypothesisId: 'H5',
      location: 'src/blocks/registry-setup.ts:77',
      message: 'registration threw',
      data: {
        errorName: error instanceof Error ? error.name : null,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion
  throw error
}

export { registry }
