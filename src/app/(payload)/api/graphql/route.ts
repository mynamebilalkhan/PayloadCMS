import { GRAPHQL_PLAYGROUND_GET, GRAPHQL_POST } from '@payloadcms/next/routes'
import config from '@payload-config'

export const GET = GRAPHQL_PLAYGROUND_GET(config)
export const POST = GRAPHQL_POST(config)
