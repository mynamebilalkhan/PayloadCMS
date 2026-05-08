import type { Field } from 'payload'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  label: 'Hero',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'none',
      label: 'Type',
      options: [
        { label: 'None', value: 'none' },
        { label: 'High Impact', value: 'highImpact' },
        { label: 'Medium Impact', value: 'mediumImpact' },
        { label: 'Low Impact', value: 'lowImpact' },
      ],
      required: true,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      admin: {
        condition: (_, siblingData) => siblingData?.type !== 'none',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      admin: {
        condition: (_, siblingData) => siblingData?.type !== 'none',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: 'Media',
      admin: {
        condition: (_, siblingData) => ['highImpact', 'mediumImpact'].includes(siblingData?.type),
      },
    },
  ],
}
