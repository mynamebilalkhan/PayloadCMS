'use client'

import React, { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  url?: string | null
  openInNewTab?: boolean | null
  children?: ChildNavItem[] | null
}

export interface ChildNavItem {
  label: string
  url: string
  openInNewTab?: boolean | null
}

export interface SiteHeaderProps {
  logo?: { url?: string | null; alt?: string | null } | null
  navigationItems?: NavItem[] | null
  ctaButton?: { text?: string | null; url?: string | null } | null
  stickyHeader?: boolean | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SiteHeader({ logo, navigationItems, ctaButton, stickyHeader }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  // Index of the currently open desktop dropdown; null = all closed
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  // Index of the currently expanded mobile accordion; null = all collapsed
  const [openMobileSection, setOpenMobileSection] = useState<number | null>(null)

  const navItems = navigationItems ?? []
  const hasCta = Boolean(ctaButton?.text && ctaButton?.url)

  function toggleDropdown(i: number) {
    setOpenDropdown((prev) => (prev === i ? null : i))
  }

  function toggleMobileSection(i: number) {
    setOpenMobileSection((prev) => (prev === i ? null : i))
  }

  return (
    <header
      className={[
        'z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm',
        stickyHeader !== false ? 'sticky top-0' : '',
      ].join(' ')}
    >
      {/* Invisible backdrop — closes any open dropdown on outside click */}
      {openDropdown !== null && (
        <div
          className="fixed inset-0 z-10"
          aria-hidden="true"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2.5">
          {logo?.url ? (
            <img src={logo.url} alt={logo.alt ?? 'Logo'} className="h-8 w-auto" />
          ) : (
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" opacity="0.5" />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight text-gray-900">Payload</span>
            </span>
          )}
        </a>

        {/* Desktop navigation */}
        {navItems.length > 0 && (
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navItems.map((item, i) => {
              const hasChildren = (item.children?.length ?? 0) > 0
              const isOpen = openDropdown === i

              return hasChildren ? (
                // ── Dropdown item ──────────────────────────────────
                <div key={i} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown(i)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    {item.label}
                    <ChevronDownIcon
                      className={[
                        'transition-transform duration-200',
                        isOpen ? 'rotate-180' : '',
                      ].join(' ')}
                    />
                  </button>

                  {isOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full mt-2 min-w-[200px] overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
                    >
                      {item.children!.map((child, j) => (
                        <a
                          key={j}
                          href={child.url}
                          role="menuitem"
                          target={child.openInNewTab ? '_blank' : undefined}
                          rel={child.openInNewTab ? 'noopener noreferrer' : undefined}
                          className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // ── Regular link ───────────────────────────────────
                item.url ? (
                  <a
                    key={i}
                    href={item.url}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span key={i} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400">
                    {item.label}
                  </span>
                )
              )
            })}
          </nav>
        )}

        {/* Right: CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          {hasCta && (
            <a
              href={ctaButton!.url!}
              className="hidden items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:inline-flex"
            >
              {ctaButton!.text}
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              setMobileOpen((prev) => !prev)
              setOpenMobileSection(null)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          {navItems.length > 0 && (
            <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
              {navItems.map((item, i) => {
                const hasChildren = (item.children?.length ?? 0) > 0
                const isExpanded = openMobileSection === i

                return hasChildren ? (
                  // ── Mobile accordion ─────────────────────────────
                  <div key={i}>
                    <button
                      type="button"
                      onClick={() => toggleMobileSection(i)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={[
                          'transition-transform duration-200',
                          isExpanded ? 'rotate-180' : '',
                        ].join(' ')}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mb-1 ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-gray-100 pl-3">
                        {item.children!.map((child, j) => (
                          <a
                            key={j}
                            href={child.url}
                            target={child.openInNewTab ? '_blank' : undefined}
                            rel={child.openInNewTab ? 'noopener noreferrer' : undefined}
                            className="rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // ── Regular mobile link ──────────────────────────
                  item.url ? (
                    <a
                      key={i}
                      href={item.url}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </a>
                  ) : null
                )
              })}
            </nav>
          )}

          {hasCta && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <a
                href={ctaButton!.url!}
                className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                {ctaButton!.text}
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

// ─── Icon sub-components ──────────────────────────────────────────────────────

function MenuIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" d="M4 4l12 12M16 4L4 16" />
    </svg>
  )
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-3.5 w-3.5 ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6l5 5 5-5" />
    </svg>
  )
}
