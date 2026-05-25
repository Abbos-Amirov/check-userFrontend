import { NextResponse } from 'next/server'
import type { Locale } from '@/lib/i18n/types'
import { LOCALE_COOKIE } from '@/lib/i18n/types'

const ALLOWED: Locale[] = ['uz', 'ko']

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const locale = body.locale as string
    if (!ALLOWED.includes(locale as Locale)) {
      return NextResponse.json({ error: 'invalid locale' }, { status: 400 })
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}
