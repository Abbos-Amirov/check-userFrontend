import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'

export const dynamic = 'force-dynamic'

/** Backend `POST /api/checks/confirm` — tasdiqlash va DB ga saqlash */
export async function POST(request: Request) {
  const token = getApiAuthToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON kutiladi' }, { status: 400 })
  }

  const url = `${getBackendBaseUrl()}/api/checks/confirm`

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const text = await upstream.text()
    let payload: unknown
    try {
      payload = text ? JSON.parse(text) : {}
    } catch {
      payload = { message: text }
    }

    return NextResponse.json(payload, { status: upstream.status })
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }
}
