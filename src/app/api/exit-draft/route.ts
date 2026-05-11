import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const draft = await draftMode()
  draft.disable()

  const slug = req.nextUrl.searchParams.get('slug') ?? '/'
  const path = slug === '/' ? '/' : `/${slug}`
  redirect(path)
}
