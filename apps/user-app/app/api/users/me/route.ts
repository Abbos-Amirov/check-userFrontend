import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import {
  AUTH_USER_COOKIE,
  getApiAuthToken,
} from '@/lib/auth-session-server'
import { normalizeCurrentUser } from '@/lib/current-user'

export const dynamic = 'force-dynamic'

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7

function extractUserPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload
  const d = payload as Record<string, unknown>
  if (d.user && typeof d.user === 'object') return d.user
  const nested =
    d.data && typeof d.data === 'object'
      ? (d.data as Record<string, unknown>)
      : null
  if (nested?.user && typeof nested.user === 'object') return nested.user
  return payload
}

function attachUserCookie(res: NextResponse, user: unknown) {
  try {
    const raw = JSON.stringify(user)
    if (raw.length < 3900) {
      res.cookies.set(AUTH_USER_COOKIE, raw, {
        httpOnly: true,
        path: '/',
        maxAge: SESSION_MAX_AGE_SEC,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }
  } catch {
    /* ixtiyoriy */
  }
}

/** Backend `GET /api/users/me` proxy — brauzer cookie JWT bilan */
export async function GET() {
  const token = getApiAuthToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = `${getBackendBaseUrl()}/api/users/me`

  try {
    const upstream = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    const text = await upstream.text()
    let payload: unknown
    try {
      payload = text ? JSON.parse(text) : {}
    } catch {
      payload = { message: text }
    }

    if (!upstream.ok) {
      return NextResponse.json(payload, { status: upstream.status })
    }

    const user = normalizeCurrentUser(payload)
    if (user) {
      return NextResponse.json({ user, ...((payload as object) ?? {}) })
    }

    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }
}

/** Backend `PATCH /api/users/me` — multipart profil yangilash */
export async function PATCH(request: Request) {
  const token = getApiAuthToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = `${getBackendBaseUrl()}/api/users/me`

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'FormData kutiladi' }, { status: 400 })
  }

  try {
    const upstream = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: 'no-store',
    })

    const text = await upstream.text()
    let payload: unknown
    try {
      payload = text ? JSON.parse(text) : {}
    } catch {
      payload = { message: text }
    }

    const res = NextResponse.json(payload, { status: upstream.status })

    if (upstream.ok) {
      attachUserCookie(res, extractUserPayload(payload))
    }

    return res
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }
}
