import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from '@/lib/auth-session-server'

export const dynamic = 'force-dynamic'

/** Backend `POST /api/auth/logout` + local cookie tozalash */
export async function POST() {
  const token = cookies().get(AUTH_TOKEN_COOKIE)?.value
  const url = `${getBackendBaseUrl()}/api/auth/logout`

  if (token) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      })
    } catch {
      /* Backend ishlamasa ham local sessiya tozalanadi */
    }
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_TOKEN_COOKIE, '', { path: '/', maxAge: 0 })
  res.cookies.set(AUTH_USER_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
