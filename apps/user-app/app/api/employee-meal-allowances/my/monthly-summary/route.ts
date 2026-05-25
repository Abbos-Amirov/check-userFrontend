import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { normalizeMealAllowanceMonthlySummary } from '@/lib/meal-allowance-summary'

export const dynamic = 'force-dynamic'

/** Backend `GET /api/employee-meal-allowances/my/monthly-summary` */
export async function GET() {
  const token = getApiAuthToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = `${getBackendBaseUrl()}/api/employee-meal-allowances/my/monthly-summary`

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

    const summary = normalizeMealAllowanceMonthlySummary(payload)
    return NextResponse.json({
      ...((payload as object) ?? {}),
      summary,
    })
  } catch {
    return NextResponse.json(
      { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
      { status: 502 }
    )
  }
}
