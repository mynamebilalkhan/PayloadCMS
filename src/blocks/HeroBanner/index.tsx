import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeroVariant = 'default' | 'dark' | 'gradient' | 'minimal' | 'centered'
export type HeroSpacing = 'compact' | 'normal' | 'spacious'

export interface HeroBannerData {
  variant?: HeroVariant
  spacing?: HeroSpacing
  badge?: string
  heading: string
  headingHighlight?: string
  description?: string
  primaryCtaLabel?: string
  primaryCtaUrl?: string
  secondaryCtaLabel?: string
  secondaryCtaUrl?: string
  mockupImage?: { url: string; alt?: string }
  socialProofText?: string
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const V = {
  default: {
    section:      'bg-white',
    heading:      'text-gray-900',
    highlight:    'text-indigo-600',
    highlightBar: 'bg-indigo-100',
    description:  'text-gray-500',
    badge:        'border-indigo-200 bg-indigo-50 text-indigo-700',
    badgeDot:     'bg-indigo-500',
    primary:      'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600',
    secondary:    'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    blob1:        'bg-indigo-50 opacity-80',
    blob2:        'bg-violet-50 opacity-60',
    proof:        'border-gray-100 text-gray-500',
  },
  dark: {
    section:      'bg-gray-950',
    heading:      'text-white',
    highlight:    'text-indigo-400',
    highlightBar: 'bg-indigo-900/60',
    description:  'text-gray-400',
    badge:        'border-indigo-800 bg-indigo-950 text-indigo-300',
    badgeDot:     'bg-indigo-400',
    primary:      'bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-indigo-500',
    secondary:    'border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800',
    blob1:        'bg-indigo-900 opacity-30',
    blob2:        'bg-violet-900 opacity-20',
    proof:        'border-gray-800 text-gray-400',
  },
  gradient: {
    section:      'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700',
    heading:      'text-white',
    highlight:    'text-yellow-300',
    highlightBar: 'bg-white/20',
    description:  'text-indigo-100',
    badge:        'border-white/20 bg-white/10 text-white',
    badgeDot:     'bg-yellow-300',
    primary:      'bg-white text-indigo-700 hover:bg-indigo-50 focus-visible:outline-white',
    secondary:    'border-white/30 bg-white/10 text-white hover:bg-white/20',
    blob1:        'bg-white/10 opacity-100',
    blob2:        'bg-purple-800/40 opacity-100',
    proof:        'border-white/20 text-indigo-100',
  },
  minimal: {
    section:      'bg-gray-50',
    heading:      'text-gray-900',
    highlight:    'text-indigo-600',
    highlightBar: 'bg-indigo-50',
    description:  'text-gray-600',
    badge:        'border-gray-200 bg-white text-gray-600',
    badgeDot:     'bg-gray-400',
    primary:      'bg-gray-900 text-white hover:bg-gray-800 focus-visible:outline-gray-900',
    secondary:    'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    blob1:        'bg-gray-200 opacity-60',
    blob2:        'bg-gray-100 opacity-40',
    proof:        'border-gray-200 text-gray-500',
  },
  centered: {
    section:      'bg-white',
    heading:      'text-gray-900',
    highlight:    'text-indigo-600',
    highlightBar: 'bg-indigo-100',
    description:  'text-gray-500',
    badge:        'border-indigo-200 bg-indigo-50 text-indigo-700',
    badgeDot:     'bg-indigo-500',
    primary:      'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600',
    secondary:    'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    blob1:        'bg-indigo-50 opacity-80',
    blob2:        'bg-violet-50 opacity-60',
    proof:        'border-gray-100 text-gray-500',
  },
} satisfies Record<HeroVariant, Record<string, string>>

const spacingMap: Record<HeroSpacing, string> = {
  compact:   'py-16 sm:py-20',
  normal:    'py-24 sm:py-32',
  spacious:  'py-32 sm:py-40',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroBannerBlock({ data, anchor }: BlockComponentProps<HeroBannerData>) {
  const {
    variant = 'default',
    spacing = 'normal',
    badge,
    heading,
    headingHighlight,
    description,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    mockupImage,
    socialProofText,
  } = data

  const v = V[variant] ?? V.default
  const isCentered = variant === 'centered'

  return (
    <section id={anchor ?? undefined} className={`relative overflow-hidden ${v.section}`}>

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className={`absolute -top-48 right-0 h-[700px] w-[700px] rounded-full blur-3xl ${v.blob1}`} />
        <div className={`absolute top-32 -left-24 h-[400px] w-[400px] rounded-full blur-3xl ${v.blob2}`} />
      </div>

      <div className={`mx-auto max-w-7xl px-6 lg:px-8 ${spacingMap[spacing ?? 'normal']}`}>
        <div className={[
          'grid grid-cols-1 items-center gap-16',
          isCentered ? 'justify-items-center text-center' : 'lg:grid-cols-2',
        ].join(' ')}>

          {/* ── Copy ──────────────────────────────────────────────────── */}
          <div className={['flex flex-col gap-8', isCentered ? 'items-center max-w-3xl' : ''].join(' ')}>

            {badge && (
              <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${v.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${v.badgeDot}`} aria-hidden="true" />
                {badge}
                <ArrowIcon />
              </div>
            )}

            <div className="flex flex-col gap-5">
              <h1 className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${v.heading}`}>
                {heading}
                {headingHighlight && (
                  <> <span className="relative whitespace-nowrap">
                    <span className={`absolute bottom-1 left-0 right-0 h-3 rounded ${v.highlightBar}`} aria-hidden="true" />
                    <span className={`relative ${v.highlight}`}>{headingHighlight}</span>
                  </span></>
                )}
              </h1>
              {description && (
                <p className={`max-w-lg text-lg leading-relaxed ${v.description}`}>{description}</p>
              )}
            </div>

            {(primaryCtaLabel || secondaryCtaLabel) && (
              <div className={['flex flex-wrap items-center gap-4', isCentered ? 'justify-center' : ''].join(' ')}>
                {primaryCtaLabel && primaryCtaUrl && (
                  <a href={primaryCtaUrl} className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${v.primary}`}>
                    {primaryCtaLabel}
                    <ArrowIcon />
                  </a>
                )}
                {secondaryCtaLabel && secondaryCtaUrl && (
                  <a href={secondaryCtaUrl} className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold shadow-sm transition-colors ${v.secondary}`}>
                    <PlayIcon />
                    {secondaryCtaLabel}
                  </a>
                )}
              </div>
            )}

            {socialProofText && (
              <div className={`flex items-center gap-4 border-t pt-6 ${v.proof}`}>
                <div className="flex -space-x-2" aria-hidden="true">
                  {['bg-indigo-300','bg-violet-400','bg-indigo-500','bg-purple-300'].map((c,i) => (
                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-white ${c}`} />
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-semibold text-gray-500">+9k</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
                  </div>
                  <p className="text-xs">{socialProofText}</p>
                </div>
              </div>
            )}

          </div>

          {/* ── Mockup (hidden in centered variant) ──────────────────── */}
          {!isCentered && (
            <div className="relative lg:ml-4">
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-indigo-500 opacity-10 blur-2xl" aria-hidden="true" />
              {mockupImage?.url ? (
                <img src={mockupImage.url} alt={mockupImage.alt ?? ''} className="w-full rounded-2xl border border-gray-200 shadow-2xl" />
              ) : (
                <DashboardMockup dark={variant === 'dark' || variant === 'gradient'} />
              )}
              <FloatingBadge label="Deployment successful" sub="Just now · Production" icon="check" dark={variant === 'dark'} pos="-bottom-5 -left-5" />
              <FloatingBadge label="Sarah joined" sub="2 min ago" icon="user" dark={variant === 'dark'} pos="-right-5 -top-5" small />
            </div>
          )}

        </div>
      </div>
    </section>
  )
}

// ─── Floating badge ───────────────────────────────────────────────────────────

function FloatingBadge({ label, sub, pos, dark, small }: {
  label: string; sub: string; icon: string; pos: string; dark?: boolean; small?: boolean
}) {
  const bg   = dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'
  const text = dark ? 'text-white' : 'text-gray-900'
  const sub2 = dark ? 'text-gray-500' : 'text-gray-400'
  return (
    <div className={`absolute flex items-center gap-3 rounded-2xl border shadow-xl ${bg} ${small ? 'px-3.5 py-2.5' : 'px-4 py-3'} ${pos}`} aria-hidden="true">
      <div className={`flex shrink-0 items-center justify-center rounded-full bg-green-100 ${small ? 'h-7 w-7' : 'h-9 w-9'}`}>
        <CheckIcon />
      </div>
      <div>
        <p className={`text-xs font-semibold ${text}`}>{label}</p>
        <p className={`text-xs ${sub2}`}>{sub}</p>
      </div>
    </div>
  )
}

// ─── Dashboard mockup ─────────────────────────────────────────────────────────

function DashboardMockup({ dark }: { dark?: boolean }) {
  const base = dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  const chrome = dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'
  const bar = dark ? 'bg-gray-700' : 'bg-gray-200'
  const card = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'

  const bars = [
    { h: 'h-6',  c: 'bg-indigo-200' }, { h: 'h-9',  c: 'bg-indigo-300' },
    { h: 'h-11', c: 'bg-indigo-400' }, { h: 'h-8',  c: 'bg-indigo-300' },
    { h: 'h-14', c: 'bg-indigo-600' }, { h: 'h-12', c: 'bg-indigo-500' },
    { h: 'h-10', c: 'bg-indigo-400' }, { h: 'h-7',  c: 'bg-indigo-200' },
    { h: 'h-9',  c: 'bg-indigo-300' }, { h: 'h-11', c: 'bg-indigo-500' },
  ]

  return (
    <div className={`overflow-hidden rounded-2xl border shadow-2xl ${base}`} aria-hidden="true">
      <div className={`flex items-center gap-3 border-b px-4 py-3 ${chrome}`}>
        <div className="flex gap-1.5">
          {['bg-red-400','bg-yellow-400','bg-green-400'].map((c,i) => (
            <div key={i} className={`h-3 w-3 rounded-full ${c}`} />
          ))}
        </div>
        <div className={`mx-auto flex h-6 flex-1 items-center gap-2 rounded-md px-3 ${bar}`}>
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <div className="h-2 w-32 rounded bg-gray-300" />
        </div>
      </div>
      <div className="flex">
        <div className={`flex w-14 flex-col items-center gap-4 border-r py-5 ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
          <div className="h-7 w-7 rounded-lg bg-indigo-600" />
          <div className="flex flex-col gap-3 mt-2">
            {['bg-indigo-200','bg-gray-200','bg-gray-200','bg-gray-200'].map((c,i) => (
              <div key={i} className={`h-5 w-5 rounded ${c}`} />
            ))}
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className={`h-3 w-24 rounded ${dark ? 'bg-gray-600' : 'bg-gray-800'}`} />
            <div className="flex gap-2">
              <div className="h-7 w-16 rounded-lg bg-indigo-600" />
              <div className={`h-7 w-7 rounded-lg border ${card}`} />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {['bg-indigo-600 w-12','bg-violet-500 w-14','bg-indigo-400 w-10'].map((c,i) => (
              <div key={i} className={`rounded-xl border p-3 shadow-sm ${card}`}>
                <div className={`mb-2 h-2 w-12 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className={`mb-1 h-5 rounded ${c}`} />
                <div className={`h-1.5 w-10 rounded ${dark ? 'bg-gray-700' : 'bg-gray-100'}`} />
              </div>
            ))}
          </div>
          <div className={`mb-4 rounded-xl border p-3 shadow-sm ${card}`}>
            <div className="flex h-16 items-end gap-1.5">
              {bars.map((b, i) => <div key={i} className={`flex-1 rounded-t ${b.h} ${b.c}`} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg className="h-4 w-4 opacity-60" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M5 3.5l8 4.5-8 4.5V3.5z" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const heroBannerSchema = {
  fields: [
    {
      name: 'variant', type: 'select', label: 'Variant',
      options: [
        { label: 'Default (white)',    value: 'default'  },
        { label: 'Dark',              value: 'dark'     },
        { label: 'Gradient',          value: 'gradient' },
        { label: 'Minimal',           value: 'minimal'  },
        { label: 'Centered',          value: 'centered' },
      ],
      defaultValue: 'default',
    },
    {
      name: 'spacing', type: 'select', label: 'Vertical Spacing',
      options: [
        { label: 'Compact',   value: 'compact'  },
        { label: 'Normal',    value: 'normal'   },
        { label: 'Spacious',  value: 'spacious' },
      ],
      defaultValue: 'normal',
    },
    { name: 'badge',             type: 'text',     label: 'Badge Text' },
    { name: 'heading',           type: 'text',     label: 'Heading',             required: true },
    { name: 'headingHighlight',  type: 'text',     label: 'Highlighted Phrase' },
    { name: 'description',       type: 'textarea', label: 'Description' },
    { name: 'primaryCtaLabel',   type: 'text',     label: 'Primary CTA Label' },
    { name: 'primaryCtaUrl',     type: 'url',      label: 'Primary CTA URL' },
    { name: 'secondaryCtaLabel', type: 'text',     label: 'Secondary CTA Label' },
    { name: 'secondaryCtaUrl',   type: 'url',      label: 'Secondary CTA URL' },
    { name: 'mockupImage',       type: 'image',    label: 'Mockup / Screenshot (optional)' },
    { name: 'socialProofText',   type: 'text',     label: 'Social Proof Text' },
  ],
}
