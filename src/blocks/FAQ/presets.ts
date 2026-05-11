import type { BlockPreset } from '../types'

export const faqPresets: BlockPreset[] = [
  {
    id: 'product-faq',
    name: 'Product FAQ',
    description: 'Standard product FAQ in single column',
    data: {
      variant: 'default',
      sectionLabel: 'FAQ',
      heading: 'Frequently asked questions',
      subheading: 'Everything you need to know about the product and billing. Can\'t find the answer you\'re looking for? Reach out to our support team.',
      layout: 'single-column',
      items: [
        {
          question: 'What is the block system and how does it work?',
          answer: 'The block system lets you compose pages from reusable, schema-validated content blocks. Each block type has a versioned schema that defines its fields. When you add a block to a page, it pins to a specific schema version — so schema updates never break your existing content.',
        },
        {
          question: 'Can I use this with my existing Next.js project?',
          answer: 'Yes. The system is built on Next.js 15 App Router and Payload CMS 3.x. You can integrate it into an existing Next.js project by installing the required packages and configuring the Payload adapter.',
        },
        {
          question: 'How does Live Preview work?',
          answer: 'Live Preview uses Next.js Draft Mode to show your unpublished content in real time inside the admin panel. When you save changes in the editor, the iframe automatically refreshes using router.refresh() — no page reload required.',
        },
        {
          question: 'Is there a free plan?',
          answer: 'Yes! Our free plan includes unlimited projects, up to 3 users, and 10GB of storage. Paid plans unlock advanced features like custom roles, audit logs, and priority support.',
        },
        {
          question: 'Can I host this on Vercel?',
          answer: 'Absolutely. The stack is optimized for Vercel deployment with full support for Vercel\'s Edge Network, Image Optimization, and ISR. We also support other platforms like Netlify, Railway, and self-hosting.',
        },
        {
          question: 'What database does it use?',
          answer: 'PostgreSQL via the Payload CMS postgres adapter. We recommend Neon, Supabase, or Railway for managed Postgres in production. A local PostgreSQL instance works great for development.',
        },
      ],
    },
  },
  {
    id: 'two-column-faq',
    name: 'Two Column FAQ',
    description: 'FAQ in two-column grid layout',
    data: {
      variant: 'minimal',
      sectionLabel: 'Got questions?',
      heading: 'We have answers',
      layout: 'two-column',
      items: [
        { question: 'How long does setup take?',         answer: 'Most teams are up and running in under an hour with our guided setup wizard.' },
        { question: 'Do you support multi-language?',    answer: 'Yes. Built-in i18n support for over 50 languages with locale-aware content routing.' },
        { question: 'What payment methods do you take?', answer: 'All major credit cards, PayPal, and bank transfer for annual enterprise plans.' },
        { question: 'Is my data secure?',                answer: 'We are SOC 2 Type II certified with end-to-end encryption at rest and in transit.' },
        { question: 'Can I cancel anytime?',             answer: 'Yes. No lock-in contracts. Cancel from your account dashboard at any time.' },
        { question: 'Do you offer a free trial?',        answer: '14-day free trial on all paid plans. No credit card required to start.' },
      ],
    },
  },
  {
    id: 'dark-faq',
    name: 'Dark FAQ',
    description: 'FAQ with dark theme and flush variant',
    data: {
      variant: 'dark',
      heading: 'Common questions',
      layout: 'single-column',
      items: [
        { question: 'What tech stack does this use?',   answer: 'Payload CMS 3.76 + Next.js 15 App Router + PostgreSQL + React 19 + Tailwind CSS 4.x.' },
        { question: 'Is it open source?',               answer: 'The core is open source under MIT. Extended enterprise features are available under a commercial license.' },
        { question: 'How do I migrate from another CMS?', answer: 'We provide migration scripts for WordPress, Contentful, and Sanity. Custom migration support is available on enterprise plans.' },
      ],
    },
  },
]
