import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { normalizeNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

/** Backend `PATCH /api/notifications/{id}/read` */
export async function PATCH(_request: Request, { params }: Params) {
  const token = getApiAuthToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params.id?.trim()
  if (!id) {
    return NextResponse.json({ error: 'id kerak' }, { status: 400 })
  }

  const url = `${getBackendBaseUrl()}/api/notifications/${encodeURIComponent(id)}/read`

  try {
    const upstream = await fetch(url, {
      method: 'PATCH',
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

    const root =
      payload && typeof payload === 'object' && 'data' in payload
        ? (payload as Record<string, unknown>).data
        : payload
    const notification = normalizeNotification(root)

    return NextResponse.json({
      ...((payload as object) ?? {}),
      notification,
    })
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }
}
