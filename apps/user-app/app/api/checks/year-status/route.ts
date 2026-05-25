import { NextRequest, NextResponse } from 'next/server'
import { computeMaxAccessibleMonth } from '@/lib/month-access'
import { getYearMonthStatuses } from '@/lib/year-month-status-server'
import { resolveChecksRouteAuth } from '@/lib/checks-route-auth'

export const dynamic = 'force-dynamic'

/** Yil bo‘yicha oy holati va ochiq oy chegarasi */
export async function GET(request: NextRequest) {
  const auth = await resolveChecksRouteAuth()
  if (auth.mode === 'none') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const yearRaw = request.nextUrl.searchParams.get('year')
  const year = yearRaw ? Number(yearRaw) : new Date().getFullYear()

  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: 'year noto‘g‘ri' }, { status: 400 })
  }

  try {
    const statuses = await getYearMonthStatuses(year)
    const maxAccessibleMonth = computeMaxAccessibleMonth(year, statuses)

    return NextResponse.json({
      year,
      statuses,
      maxAccessibleMonth,
    })
  } catch (error) {
    console.error('GET checks/year-status:', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}
