import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  admin: {
    group: 'Site Settings',
    description: 'Global site header — logo, navigation, and CTA button.',
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'navigationItems',
      type: 'array',
      label: 'Navigation Items',
      admin: { description: 'Links shown in the main navigation bar. Add children to create a dropdown.' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          admin: {
            description: 'Relative (e.g. /about) or absolute URL. Optional when children are present.',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Open in New Tab',
          defaultValue: false,
        },
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown Items',
          admin: {
            description: 'Add links here to turn this item into a dropdown menu.',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Label',
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              label: 'Open in New Tab',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'ctaButton',
      type: 'group',
      label: 'CTA Button',
      admin: { description: 'Primary call-to-action shown on the right side of the header.' },
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Button Text',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Button URL',
        },
      ],
    },
    {
      name: 'stickyHeader',
      type: 'checkbox',
      label: 'Sticky Header',
      defaultValue: true,
      admin: { description: 'Keep the header fixed at the top while scrolling.' },
    },
  ],
}
