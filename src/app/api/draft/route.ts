import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  const slug = req.nextUrl.searchParams.get('slug') ?? '/'
  const path = slug === '/' ? '/' : `/${slug}`
  redirect(path)
}
