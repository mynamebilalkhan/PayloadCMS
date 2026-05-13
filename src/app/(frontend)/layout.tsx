import React from 'react'
import './globals.css'
import '@/blocks/registry-setup'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SiteHeader } from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/Footer'
import { ThemeProvider } from '@/theme/context'
import { resolveTheme, tokensToCSS, buildGoogleFontsURL } from '@/theme/resolver'
import { defaultTheme } from '@/theme/tokens'
import type { SiteHeaderProps } from '@/components/layout/Header'
import type { SiteFooterProps } from '@/components/layout/Footer'
import type { ThemeTokens } from '@/theme/tokens'

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getGlobals(): Promise<{
  header: SiteHeaderProps
  footer: SiteFooterProps
  theme: ThemeTokens
}> {
  try {
    const payload = await getPayload({ config })
    const [header, footer, themeRaw] = await Promise.all([
      payload.findGlobal({ slug: 'header', depth: 1 }),
      payload.findGlobal({ slug: 'footer', depth: 1 }),
      payload.findGlobal({ slug: 'theme',  depth: 0 }),
    ])
    return {
      header: header as unknown as SiteHeaderProps,
      footer: footer as unknown as SiteFooterProps,
      theme:  resolveTheme(themeRaw as unknown as Record<string, unknown>),
    }
  } catch {
    return { header: {}, footer: {}, theme: defaultTheme }
  }
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Dynamic Block Site',
  description: 'Payload CMS dynamic block system',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const { header, footer, theme } = await getGlobals()
  const themeCSS = tokensToCSS(theme)
  const googleFontsURL = buildGoogleFontsURL(theme)

  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        {googleFontsURL && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href={googleFontsURL} />
          </>
        )}
        {/* Resolved theme tokens as CSS custom properties */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body className="antialiased">
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
      </body>
    </html>
  )
}
