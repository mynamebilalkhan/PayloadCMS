import React from 'react'
import './globals.css'
import '@/blocks/registry-setup'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SiteHeader } from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/Footer'
import type { SiteHeaderProps } from '@/components/layout/Header'
import type { SiteFooterProps } from '@/components/layout/Footer'

// ─── Globals fetch ────────────────────────────────────────────────────────────
// Runs on every request. Payload caches at the DB level; Next.js deduplicates
// within a single render pass. Falls back to empty objects so the page never
// crashes when globals haven't been seeded yet.

async function getGlobals(): Promise<{ header: SiteHeaderProps; footer: SiteFooterProps }> {
  try {
    const payload = await getPayload({ config })
    const [header, footer] = await Promise.all([
      payload.findGlobal({ slug: 'header', depth: 1 }),
      payload.findGlobal({ slug: 'footer', depth: 1 }),
    ])
    return {
      header: header as unknown as SiteHeaderProps,
      footer: footer as unknown as SiteFooterProps,
    }
  } catch {
    return { header: {}, footer: {} }
  }
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Dynamic Block Site',
  description: 'Payload CMS dynamic block system',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const { header, footer } = await getGlobals()

  return (
    <html lang="en">
      <body className="antialiased">
        <SiteHeader
          logo={header.logo}
          navigationItems={header.navigationItems}
          ctaButton={header.ctaButton}
          stickyHeader={header.stickyHeader}
        />
        <main>{children}</main>
        <SiteFooter
          logo={footer.logo}
          columns={footer.columns}
          copyright={footer.copyright}
          socialLinks={footer.socialLinks}
        />
      </body>
    </html>
  )
}
