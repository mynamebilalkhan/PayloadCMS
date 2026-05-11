import type { BlockPreset } from '../types'

export const testimonialsPresets: BlockPreset[] = [
  {
    id: 'default-testimonials',
    name: 'Default Testimonials',
    description: '3-column grid of customer testimonials',
    data: {
      variant: 'default',
      sectionLabel: 'Customer stories',
      heading: 'Loved by teams worldwide',
      subheading: 'Don\'t just take our word for it — hear from the people building with our platform every day.',
      testimonials: [
        {
          quote: 'We shipped our new marketing site in two weeks instead of two months. The block system changed how our whole team works.',
          name: 'Sarah Chen',
          title: 'Head of Marketing',
          company: 'Vercel',
          rating: 5,
        },
        {
          quote: 'Live Preview alone saved us hours every sprint. Our content team can now see changes without bugging engineers.',
          name: 'Marcus Johnson',
          title: 'Engineering Lead',
          company: 'Linear',
          rating: 5,
        },
        {
          quote: 'The variant system is brilliant. We went from "every page looks different" to a cohesive design system in days.',
          name: 'Priya Patel',
          title: 'Product Designer',
          company: 'Notion',
          rating: 5,
        },
        {
          quote: 'Schema versioning means our old pages never break when we update blocks. That was a game-changer for our team.',
          name: 'Tom Rivers',
          title: 'Senior Developer',
          company: 'Framer',
          rating: 5,
        },
        {
          quote: 'Onboarding non-technical editors used to take a full week. With this CMS it takes an afternoon.',
          name: 'Aisha Williams',
          title: 'Content Manager',
          company: 'Stripe',
          rating: 5,
        },
        {
          quote: 'The pricing was fair, the docs were excellent, and the support team responded in under an hour. Highly recommend.',
          name: 'Daniel Lee',
          title: 'Founder',
          company: 'BuildFast',
          rating: 5,
        },
      ],
    },
  },
  {
    id: 'featured-testimonials',
    name: 'Featured Testimonials',
    description: 'Large featured quote + two side quotes',
    data: {
      variant: 'featured',
      sectionLabel: 'What our customers say',
      heading: 'Real results from real teams',
      testimonials: [
        {
          quote: 'Switching to this CMS was the single best infrastructure decision we made last year. Our content velocity tripled, our bounce rate dropped, and our editorial team actually enjoys publishing now. I can\'t imagine going back.',
          name: 'Jessica Park',
          title: 'VP of Growth',
          company: 'Loom',
          rating: 5,
        },
        {
          quote: 'The conditional logic features saved us from building a custom admin. Huge win.',
          name: 'Alex Nguyen',
          title: 'Tech Lead',
          company: 'Raycast',
          rating: 5,
        },
        {
          quote: 'We migrated from another CMS in 48 hours. Incredible tooling.',
          name: 'Maria Santos',
          title: 'CTO',
          company: 'Pitch',
          rating: 5,
        },
      ],
    },
  },
  {
    id: 'dark-testimonials',
    name: 'Dark Testimonials',
    description: 'Dark-themed testimonial grid',
    data: {
      variant: 'dark',
      sectionLabel: 'Trusted globally',
      heading: 'Built for teams that ship',
      subheading: 'From solo founders to enterprise teams — here\'s what they\'re saying.',
      testimonials: [
        {
          quote: 'The developer experience is second to none. TypeScript-first, well-documented, and the community is fantastic.',
          name: 'Ryan Kim',
          title: 'Frontend Engineer',
          company: 'Resend',
          rating: 5,
        },
        {
          quote: 'Our SEO scores improved 40% after migrating to this platform. The metadata controls are exactly what we needed.',
          name: 'Laura Ortiz',
          title: 'SEO Specialist',
          company: 'Webflow',
          rating: 5,
        },
        {
          quote: 'Nested blocks let us build incredibly rich page layouts without any custom development. Remarkable.',
          name: 'Chris Bennett',
          title: 'Solutions Architect',
          company: 'Contentful',
          rating: 5,
        },
      ],
    },
  },
]
