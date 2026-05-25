import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { normalizeUsersListResponse } from '@/lib/users-list'

export const dynamic = 'force-dynamic'

/** Backend `GET /api/users/all` proxy */
export async function GET(request: NextRequest) {
  const token = getApiAuthToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const page = request.nextUrl.searchParams.get('page') ?? '1'
  const limit = request.nextUrl.searchParams.get('limit') ?? '20'
  const workType = request.nextUrl.searchParams.get('workType')

  const qs = new URLSearchParams({ page, limit })
  if (workType === 'inside' || workType === 'outside') {
    qs.set('workType', workType)
  }

  const url = `${getBackendBaseUrl()}/api/users/all?${qs.toString()}`

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

    const parsed = normalizeUsersListResponse(
      payload,
      getBackendBaseUrl(),
      Number(page) || 1,
      Number(limit) || 20
    )

    return NextResponse.json({
      success: true,
      data: {
        users: parsed.users,
        byWorkType: parsed.byWorkType,
        counts: parsed.counts,
        page: parsed.page,
        limit: parsed.limit,
      },
    })
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }
}
