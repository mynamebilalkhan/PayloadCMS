import React from 'react'
import type { BlockComponentProps } from '@/renderer/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeaturesVariant = 'default' | 'minimal' | 'dark' | 'gradient' | 'cards'
export type FeaturesColumns = '2' | '3' | '4'

export interface FeatureItem {
  icon?: string
  title: string
  description?: string
  linkLabel?: string
  linkUrl?: string
}

export interface FeaturesData {
  variant?: FeaturesVariant
  sectionLabel?: string
  heading?: string
  subheading?: string
  columns?: FeaturesColumns
  features?: FeatureItem[]
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const V = {
  default: {
    section:    'bg-white',
    label:      'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading:    'text-gray-900',
    sub:        'text-gray-500',
    card:       'bg-white border border-gray-100 shadow-sm hover:shadow-md',
    iconWrap:   'bg-indigo-50 text-indigo-600',
    title:      'text-gray-900',
    desc:       'text-gray-500',
    link:       'text-indigo-600 hover:text-indigo-800',
  },
  minimal: {
    section:    'bg-gray-50',
    label:      'text-gray-600 bg-white border-gray-200',
    heading:    'text-gray-900',
    sub:        'text-gray-500',
    card:       'bg-transparent border-0 shadow-none',
    iconWrap:   'bg-gray-100 text-gray-600',
    title:      'text-gray-900',
    desc:       'text-gray-500',
    link:       'text-gray-700 hover:text-gray-900',
  },
  dark: {
    section:    'bg-gray-950',
    label:      'text-indigo-400 bg-indigo-950 border-indigo-800',
    heading:    'text-white',
    sub:        'text-gray-400',
    card:       'bg-gray-900 border border-gray-800 hover:border-gray-700',
    iconWrap:   'bg-indigo-900/60 text-indigo-400',
    title:      'text-white',
    desc:       'text-gray-400',
    link:       'text-indigo-400 hover:text-indigo-300',
  },
  gradient: {
    section:    'bg-gradient-to-b from-indigo-950 to-gray-950',
    label:      'text-indigo-300 bg-indigo-900/40 border-indigo-700',
    heading:    'text-white',
    sub:        'text-indigo-200',
    card:       'bg-white/5 border border-white/10 hover:bg-white/10',
    iconWrap:   'bg-indigo-500/20 text-indigo-300',
    title:      'text-white',
    desc:       'text-indigo-200',
    link:       'text-indigo-300 hover:text-white',
  },
  cards: {
    section:    'bg-gray-50',
    label:      'text-indigo-600 bg-indigo-50 border-indigo-100',
    heading:    'text-gray-900',
    sub:        'text-gray-500',
    card:       'bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    iconWrap:   'bg-indigo-600 text-white',
    title:      'text-gray-900',
    desc:       'text-gray-500',
    link:       'text-indigo-600 hover:text-indigo-800',
  },
} satisfies Record<FeaturesVariant, Record<string, string>>

const colClass: Record<FeaturesColumns, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FeaturesBlock({ data, anchor }: BlockComponentProps<FeaturesData>) {
  const {
    variant = 'default',
    sectionLabel,
    heading,
    subheading,
    columns = '3',
    features = [],
  } = data

  const v = V[variant] ?? V.default

  return (
    <section id={anchor ?? undefined} className={`relative py-20 sm:py-24 ${v.section}`}>

      {/* Ambient glow for gradient/dark variants */}
      {(variant === 'gradient' || variant === 'dark') && (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-indigo-900/20 to-transparent" aria-hidden="true" />
      )}

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        {(sectionLabel || heading || subheading) && (
          <div className="mb-16 text-center">
            {sectionLabel && (
              <span className={`mb-4 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${v.label}`}>
                {sectionLabel}
              </span>
            )}
            {heading && (
              <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${v.heading}`}>{heading}</h2>
            )}
            {subheading && (
              <p className={`mt-4 mx-auto max-w-2xl text-lg leading-relaxed ${v.sub}`}>{subheading}</p>
            )}
          </div>
        )}

        {/* Feature grid */}
        {features.length > 0 && (
          <div className={`grid gap-6 ${colClass[columns as FeaturesColumns] ?? colClass['3']}`}>
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group flex flex-col gap-4 rounded-2xl p-6 transition-all duration-200 ${v.card}`}
              >
                {/* Icon */}
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${v.iconWrap}`}>
                  <FeatureIcon name={feature.icon} />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className={`text-base font-semibold leading-snug ${v.title}`}>{feature.title}</h3>
                  {feature.description && (
                    <p className={`text-sm leading-relaxed ${v.desc}`}>{feature.description}</p>
                  )}
                </div>

                {/* Link */}
                {feature.linkLabel && feature.linkUrl && (
                  <a href={feature.linkUrl} className={`mt-auto inline-flex items-center gap-1 text-sm font-medium transition-colors ${v.link}`}>
                    {feature.linkLabel}
                    <ArrowIcon />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

// ─── Icon system ──────────────────────────────────────────────────────────────

const iconPaths: Record<string, JSX.Element> = {
  zap:      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  shield:   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  layers:   <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
  globe:    <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>,
  code:     <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
  chart:    <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  star:     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  heart:    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
  check:    <><polyline points="20 6 9 17 4 12"/></>,
  rocket:   <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></>,
  puzzle:   <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />,
  users:    <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  mail:     <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  lock:     <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
  bolt:     <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  cpu:      <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
}

function FeatureIcon({ name }: { name?: string }) {
  const content = (name && iconPaths[name]) ?? iconPaths.zap!
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {content}
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export const featuresSchema = {
  fields: [
    {
      name: 'variant', type: 'select', label: 'Variant',
      options: [
        { label: 'Default',  value: 'default'  },
        { label: 'Minimal',  value: 'minimal'  },
        { label: 'Dark',     value: 'dark'     },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Cards',    value: 'cards'    },
      ],
      defaultValue: 'default',
    },
    { name: 'sectionLabel', type: 'text',     label: 'Section Label (small tag above heading)' },
    { name: 'heading',      type: 'text',     label: 'Section Heading' },
    { name: 'subheading',   type: 'textarea', label: 'Subheading' },
    {
      name: 'columns', type: 'select', label: 'Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      defaultValue: '3',
    },
    {
      name: 'features', type: 'array', label: 'Features', minRows: 1,
      fields: [
        {
          name: 'icon', type: 'select', label: 'Icon',
          options: [
            { label: 'Zap',      value: 'zap'      },
            { label: 'Shield',   value: 'shield'   },
            { label: 'Layers',   value: 'layers'   },
            { label: 'Globe',    value: 'globe'    },
            { label: 'Code',     value: 'code'     },
            { label: 'Chart',    value: 'chart'    },
            { label: 'Settings', value: 'settings' },
            { label: 'Star',     value: 'star'     },
            { label: 'Heart',    value: 'heart'    },
            { label: 'Check',    value: 'check'    },
            { label: 'Rocket',   value: 'rocket'   },
            { label: 'Puzzle',   value: 'puzzle'   },
            { label: 'Users',    value: 'users'    },
            { label: 'Mail',     value: 'mail'     },
            { label: 'Lock',     value: 'lock'     },
            { label: 'CPU',      value: 'cpu'      },
          ],
        },
        { name: 'title',       type: 'text',     label: 'Feature Title', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'linkLabel',   type: 'text',     label: 'Link Label' },
        { name: 'linkUrl',     type: 'url',      label: 'Link URL' },
      ],
    },
  ],
}
