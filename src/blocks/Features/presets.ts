import type { BlockPreset } from '../types'

export const featuresPresets: BlockPreset[] = [
  {
    id: 'saas-features',
    name: 'SaaS Features',
    description: '6-feature grid for SaaS product pages',
    data: {
      variant: 'default',
      sectionLabel: 'Features',
      heading: 'Everything you need to ship',
      subheading: 'A complete toolkit for building, managing, and publishing content at scale — without the complexity.',
      columns: '3',
      features: [
        { icon: 'layers',   title: 'Dynamic Block Builder',    description: 'Compose pages from versioned, schema-validated block definitions with drag-and-drop ease.' },
        { icon: 'zap',      title: 'Live Preview',             description: 'See your changes in real time inside the admin panel with full Next.js draft mode support.' },
        { icon: 'shield',   title: 'Version Control',          description: 'Block schemas are immutable versions. Old pages pin to the version they were authored with.' },
        { icon: 'code',     title: 'Conditional Logic',        description: 'Show or hide fields based on other field values — no custom code required.' },
        { icon: 'settings', title: 'Advanced Validation',      description: 'Per-field validation rules with custom error messages, regex patterns, and cross-field checks.' },
        { icon: 'globe',    title: 'Global Components',        description: 'Manage your site header and footer from one place. Changes propagate everywhere instantly.' },
      ],
    },
  },
  {
    id: 'dark-features',
    name: 'Dark Features',
    description: 'Dark variant feature grid for tech products',
    data: {
      variant: 'dark',
      sectionLabel: 'Why us',
      heading: 'Built for developers,',
      subheading: 'Loved by teams of all sizes. From indie hackers to enterprise engineering teams.',
      columns: '3',
      features: [
        { icon: 'rocket',  title: 'Fast by default',     description: 'Optimized for Next.js App Router with streaming, caching, and edge-ready deployments.' },
        { icon: 'lock',    title: 'Secure',               description: 'End-to-end security with role-based access, audit logs, and SOC 2 compliance.' },
        { icon: 'chart',   title: 'Analytics built in',  description: 'Track page views, conversions, and engagement without leaving the admin panel.' },
        { icon: 'cpu',     title: 'AI-powered',           description: 'Auto-generate content suggestions, SEO metadata, and image alt text with built-in AI.' },
        { icon: 'users',   title: 'Team workflows',       description: 'Draft, review, and publish with approval flows designed for content teams.' },
        { icon: 'puzzle',  title: 'Extensible',           description: 'A plugin marketplace with hundreds of integrations — or build your own in minutes.' },
      ],
    },
  },
  {
    id: 'cards-features',
    name: 'Cards Features',
    description: 'Elevated card layout with accent icons',
    data: {
      variant: 'cards',
      sectionLabel: 'Capabilities',
      heading: 'A platform that grows with you',
      subheading: 'Start with the basics and unlock advanced capabilities as your team scales.',
      columns: '3',
      features: [
        { icon: 'star',   title: 'Easy onboarding',    description: 'Up and running in minutes with our guided setup wizard and starter templates.' },
        { icon: 'heart',  title: 'Delightful UX',      description: 'Thoughtfully designed admin interfaces that your content team will actually enjoy using.' },
        { icon: 'mail',   title: 'Notifications',      description: 'Stay in the loop with smart notifications for publishing, reviews, and comments.' },
        { icon: 'check',  title: 'Quality control',    description: 'Built-in spellcheck, broken link detection, and SEO score before every publish.' },
      ],
    },
  },
]
