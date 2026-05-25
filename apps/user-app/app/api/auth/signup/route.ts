import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const url = `${getBackendBaseUrl()}/api/auth/signup`
  const contentType = request.headers.get('content-type') ?? ''

  let upstream: Response
  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      upstream = await fetch(url, {
        method: 'POST',
        body: formData,
      })
    } else {
      let body: unknown
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'JSON yoki FormData kutiladi' }, { status: 400 })
      }
      upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }

  const text = await upstream.text()
  let payload: unknown
  try {
    payload = text ? JSON.parse(text) : {}
  } catch {
    payload = { message: text }
  }

  return NextResponse.json(payload, { status: upstream.status })
}
