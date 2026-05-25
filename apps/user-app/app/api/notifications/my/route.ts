import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { normalizeNotificationsResponse } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/** Backend `GET /api/notifications/my` */
export async function GET(request: NextRequest) {
  const token = getApiAuthToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const page = request.nextUrl.searchParams.get('page') ?? '1'
  const limit = request.nextUrl.searchParams.get('limit') ?? '20'

  const qs = new URLSearchParams({ page, limit })
  const url = `${getBackendBaseUrl()}/api/notifications/my?${qs.toString()}`

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

    const parsed = normalizeNotificationsResponse(payload)
    return NextResponse.json({ ...((payload as object) ?? {}), ...parsed })
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }
}
