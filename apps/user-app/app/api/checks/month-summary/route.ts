import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { normalizeMonthSummaryResponse } from '@/lib/check-month-summary'
import { resolveChecksRouteAuth } from '@/lib/checks-route-auth'
import type { MonthSummaryStatus } from '@/types'

export const dynamic = 'force-dynamic'

/** Backend `GET /api/checks/month-summary?month=YYYY-MM` */
export async function GET(request: NextRequest) {
  const auth = await resolveChecksRouteAuth()
  if (auth.mode === 'none') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const month = request.nextUrl.searchParams.get('month')
  if (!month) {
    return NextResponse.json({ error: 'month parametri kerak' }, { status: 400 })
  }

  if (auth.mode === 'api') {
    const token = getApiAuthToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = `${getBackendBaseUrl()}/api/checks/month-summary?month=${encodeURIComponent(month)}`

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

      const summary = normalizeMonthSummaryResponse(payload)
      if (summary) {
        return NextResponse.json({ ...((payload as object) ?? {}), summary })
      }

      return NextResponse.json(payload)
    } catch {
      return NextResponse.json(
        { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
        { status: 502 }
      )
    }
  }

  const { data: checks, error } = await auth.supabase
    .from('checks')
    .select('amount')
    .eq('user_id', auth.userId)
    .eq('month', month)

  if (error) {
    console.error('GET checks/month-summary:', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }

  const checkCount = checks?.length ?? 0
  const totalAmount = checks?.reduce((sum, c) => sum + Number(c.amount ?? 0), 0) ?? 0

  return NextResponse.json({
    summary: {
      totalAmount,
      checkCount,
      status: (checkCount > 0 ? 'uploaded' : 'empty') as MonthSummaryStatus,
      month,
    },
  })
}
