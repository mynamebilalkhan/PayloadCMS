import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import path from 'path'
import sharp from 'sharp'

import {
  BlockDefinitions,
  BlockDefinitionVersions,
  Pages,
  Media,
} from '@/collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Block System',
    },
  },
  collections: [
    BlockDefinitions,
    BlockDefinitionVersions,
    Pages,
    Media,
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email', group: 'System' },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Full Name',
        },
      ],
    },
  ],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? 'postgresql://localhost:5432/payload_dynamic_blocks',
    },
  }),
  sharp,
  secret: process.env.PAYLOAD_SECRET ?? 'CHANGE_ME_IN_PRODUCTION',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
})
