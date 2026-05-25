import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON kutiladi' }, { status: 400 })
  }

  const url = `${getBackendBaseUrl()}/api/auth/login`
  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
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
