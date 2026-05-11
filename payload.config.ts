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
import { Header, Footer } from '@/globals'

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
    livePreview: {
      url: ({ data }) => {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
        const slug = (data?.slug as string) ?? '/'
        return `${serverUrl}/api/draft?slug=${encodeURIComponent(slug)}`
      },
      collections: ['pages'],
      breakpoints: [
        { label: 'Mobile',  name: 'mobile',  width: 375,  height: 667  },
        { label: 'Tablet',  name: 'tablet',  width: 768,  height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900  },
      ],
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
  globals: [Header, Footer],
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
