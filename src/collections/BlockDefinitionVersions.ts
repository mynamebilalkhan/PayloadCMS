import type { CollectionConfig } from 'payload'
import { validateBlockSchema } from '@/validation'
import type { BlockSchema } from '@/validation/types'

/**
 * block-definition-versions: immutable schema snapshots.
 *
 * Rules:
 * - Versions are NEVER mutated after creation (enforced via beforeChange hook).
 * - Each new schema change creates a new version document.
 * - The parent BlockDefinition.currentVersion is updated to point to the new version.
 *
 * Version numbers auto-increment per block definition.
 */
export const BlockDefinitionVersions: CollectionConfig = {
  slug: 'block-definition-versions',
  admin: {
    useAsTitle: 'versionLabel',
    group: 'Block System',
    description: 'Immutable snapshots of block schemas. Never edited after creation.',
    defaultColumns: ['versionLabel', 'blockDefinition', 'versionNumber', 'createdAt'],
  },
  access: {
    read: () => true,
    // Versions are write-once: block updates on the existing version document
    update: () => false,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation !== 'create' || !data) return data

        // Validate schema JSON before saving
        if (data.schema) {
          let schema = typeof data.schema === 'string' ? JSON.parse(data.schema) : data.schema
          // Accept a bare array as shorthand — auto-wrap into { fields: [...] }
          if (Array.isArray(schema)) {
            schema = { fields: schema }
            data.schema = schema
          }
          const result = validateBlockSchema(schema as BlockSchema)
          if (!result.valid) {
            throw new Error(`Invalid block schema: ${result.errors.join('; ')}`)
          }
        }

        // Auto-assign version number + copy blockSlug from parent definition
        if (data.blockDefinition) {
          const [existing, parentDef] = await Promise.all([
            req.payload.find({
              collection: 'block-definition-versions',
              where: { blockDefinition: { equals: data.blockDefinition } },
              sort: '-versionNumber',
              limit: 1,
            }),
            req.payload.findByID({
              collection: 'block-definitions',
              id: data.blockDefinition as string,
            }),
          ])

          const lastVersion = existing.docs[0] as { versionNumber?: number } | undefined
          data.versionNumber = lastVersion?.versionNumber ? lastVersion.versionNumber + 1 : 1
          data.versionLabel = `v${data.versionNumber}`

          // Denormalise slug for fast renderer lookups
          if (parentDef?.slug) {
            data.blockSlug = parentDef.slug as string
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        // Update the parent BlockDefinition.currentVersion pointer
        if (doc.blockDefinition) {
          const definitionId =
            typeof doc.blockDefinition === 'object'
              ? doc.blockDefinition.id
              : doc.blockDefinition

          await req.payload.update({
            collection: 'block-definitions',
            id: definitionId,
            data: { currentVersion: doc.id },
            req,
          })
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'blockDefinition',
      type: 'relationship',
      relationTo: 'block-definitions',
      required: true,
      label: 'Block Definition',
      admin: { description: 'Parent block type this version belongs to.' },
    },
    {
      name: 'versionNumber',
      type: 'number',
      // NOT required at the field level — the beforeValidate hook always assigns this.
      // Marking it required would trigger client-side validation before the hook runs.
      label: 'Version Number',
      admin: { readOnly: true, description: 'Auto-assigned sequential version number.' },
    },
    {
      name: 'versionLabel',
      type: 'text',
      label: 'Version Label',
      admin: { readOnly: true, description: 'Display label, e.g. "v3".' },
    },
    {
      name: 'schema',
      type: 'json',
      required: true,
      label: 'Schema Fields',
      admin: {
        description: 'Define the fields for this block version. Immutable after creation.',
        components: {
          Field: '@/components/SchemaBuilderField#SchemaBuilderField',
        },
      },
    },
    {
      name: 'changelog',
      type: 'textarea',
      label: 'Changelog',
      admin: { description: 'Optional description of what changed in this version.' },
    },
    {
      name: 'isStable',
      type: 'checkbox',
      label: 'Stable',
      defaultValue: true,
      admin: { description: 'Unstable versions are hidden from the page builder by default.' },
    },
    // Denormalised for fast lookups without joins
    {
      name: 'blockSlug',
      type: 'text',
      label: 'Block Slug (denormalised)',
      admin: {
        readOnly: true,
        description: 'Copied from parent definition for fast renderer lookups.',
      },
    },
  ],
  timestamps: true,
}
