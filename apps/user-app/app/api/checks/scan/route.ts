import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { normalizeScanResponse } from '@/lib/check-scan'

export const dynamic = 'force-dynamic'

/** Backend `POST /api/checks/scan` — AI o‘qish (saqlanmaydi) */
export async function POST(request: Request) {
  const token = getApiAuthToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'FormData kutiladi' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'file kerak' }, { status: 400 })
  }

  const url = `${getBackendBaseUrl()}/api/checks/scan`

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
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

    if (!upstream.ok) {
      return NextResponse.json(payload, { status: upstream.status })
    }

    const draft = normalizeScanResponse(payload, getBackendBaseUrl())
    if (draft) {
      return NextResponse.json({ ...((payload as object) ?? {}), draft })
    }

    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }
}
