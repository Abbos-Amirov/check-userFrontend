import { NextResponse } from 'next/server'
import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from '@/lib/auth-session-server'

const MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 kun

export const dynamic = 'force-dynamic'

/** Backend JWT ni httpOnly cookie ga yozadi (faqat Next domenida) */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token =
      (typeof body.token === 'string' && body.token) ||
      (typeof body.accessToken === 'string' && body.accessToken)

    if (!token) {
      return NextResponse.json({ error: 'token kerak' }, { status: 400 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(AUTH_TOKEN_COOKIE, token, {
      httpOnly: true,
      path: '/',
      maxAge: MAX_AGE_SEC,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    if (body.user != null) {
      try {
        const raw = JSON.stringify(body.user)
        if (raw.length < 3900) {
          res.cookies.set(AUTH_USER_COOKIE, raw, {
            httpOnly: true,
            path: '/',
            maxAge: MAX_AGE_SEC,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        }
      } catch {
        /* user cookie ixtiyoriy */
      }
    }

    return res
  } catch {
    return NextResponse.json({ error: 'Noto\'g\'ri so\'rov' }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_TOKEN_COOKIE, '', {
    path: '/',
    maxAge: 0,
  })
  res.cookies.set(AUTH_USER_COOKIE, '', {
    path: '/',
    maxAge: 0,
  })
  return res
}
