import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { resolveMonthStatusFromSources } from '@/lib/month-status-resolve'
import { resolveChecksRouteAuth } from '@/lib/checks-route-auth'
import type { Check, MonthSummaryStatus } from '@/types'

export const dynamic = 'force-dynamic'

const EMPTY_SUMMARY = {
  totalAmount: 0,
  checkCount: 0,
  status: 'empty' as MonthSummaryStatus,
}

function readNumber(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return 0
}

function normalizeCheckStatus(value: unknown): Check['status'] {
  if (typeof value !== 'string') return 'pending'
  const v = value.trim().toLowerCase()
  if (
    v === 'approved' ||
    v === 'accepted' ||
    v === 'confirmed' ||
    v === 'complete' ||
    v === 'completed' ||
    v === 'paid'
  ) {
    return 'approved'
  }
  if (v === 'rejected') return 'rejected'
  return 'pending'
}

function normalizeBackendCheck(row: unknown): Check | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>
  const id = typeof o.id === 'string' ? o.id : typeof o._id === 'string' ? o._id : null
  if (!id) return null

  return {
    id,
    user_id: typeof o.user_id === 'string' ? o.user_id : typeof o.userId === 'string' ? o.userId : '',
    image_url:
      (typeof o.image_url === 'string' && o.image_url) ||
      (typeof o.imageUrl === 'string' && o.imageUrl) ||
      '',
    amount: readNumber(o, 'amount', 'total'),
    store_name:
      (typeof o.store_name === 'string' && o.store_name) ||
      (typeof o.storeName === 'string' && o.storeName) ||
      null,
    check_date:
      (typeof o.check_date === 'string' && o.check_date) ||
      (typeof o.purchaseDate === 'string' && o.purchaseDate) ||
      (typeof o.purchase_date === 'string' && o.purchase_date) ||
      null,
    month: typeof o.month === 'string' ? o.month : '',
    status: normalizeCheckStatus(o.status),
    admin_note: typeof o.admin_note === 'string' ? o.admin_note : null,
    created_at: typeof o.created_at === 'string' ? o.created_at : undefined,
  }
}

function unwrapChecks(data: unknown): unknown[] {
  if (!data || typeof data !== 'object') return []
  const d = data as Record<string, unknown>
  if (Array.isArray(d.checks)) return d.checks
  const nested =
    d.data && typeof d.data === 'object' ? (d.data as Record<string, unknown>) : null
  if (nested && Array.isArray(nested.checks)) return nested.checks
  if (Array.isArray(d.data)) return d.data
  return []
}

async function fetchBackendChecksMy(month: string) {
  const token = getApiAuthToken()
  if (!token) return null

  const url = `${getBackendBaseUrl()}/api/checks/my?month=${encodeURIComponent(month)}`
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) return null
    return (await res.json()) as unknown
  } catch (error) {
    console.warn('GET checks/my backend unreachable:', url, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveChecksRouteAuth()
    if (auth.mode === 'none') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const month = request.nextUrl.searchParams.get('month')
    if (!month) {
      return NextResponse.json({ error: 'month parametri kerak' }, { status: 400 })
    }

    if (auth.mode === 'api') {
      const payload = await fetchBackendChecksMy(month)
      if (!payload) {
        return NextResponse.json({ checks: [], monthSummary: EMPTY_SUMMARY })
      }

      const rows = unwrapChecks(payload)
      const checks = rows
        .map((row) => normalizeBackendCheck(row))
        .filter((c): c is Check => c !== null)

      const nested =
        payload && typeof payload === 'object' && 'data' in payload
          ? ((payload as Record<string, unknown>).data as Record<string, unknown>)
          : (payload as Record<string, unknown>)

      const summaryRaw =
        nested?.monthSummary && typeof nested.monthSummary === 'object'
          ? (nested.monthSummary as Record<string, unknown>)
          : nested

      const checkCount = checks.length
      const totalAmount =
        readNumber(summaryRaw ?? {}, 'totalAmount', 'total_amount') ||
        checks.reduce((s, c) => s + Number(c.amount ?? 0), 0)

      const status = resolveMonthStatusFromSources({
        summaryPayload: payload,
        checks,
        fallbackStatus: checkCount > 0 ? 'uploaded' : 'empty',
      })

      return NextResponse.json({
        checks,
        monthSummary: { totalAmount, checkCount, status },
      })
    }

    const { data: checks, error: checksError } = await auth.supabase
      .from('checks')
      .select('*')
      .eq('user_id', auth.userId)
      .eq('month', month)
      .order('created_at', { ascending: false })

    if (checksError) throw checksError

    const { data: report } = await auth.supabase
      .from('monthly_reports')
      .select('*')
      .eq('user_id', auth.userId)
      .eq('month', month)
      .maybeSingle()

    const checkCount = checks?.length ?? 0
    let status: MonthSummaryStatus = 'empty'
    if (report?.status === 'paid') status = 'approved'
    else if (report?.status === 'submitted') status = 'submitted'
    else if (checkCount > 0) status = 'uploaded'

    const totalAmount =
      checks?.reduce((sum, c) => sum + Number(c.amount ?? 0), 0) ?? 0

    return NextResponse.json({
      checks: checks ?? [],
      monthSummary: {
        totalAmount,
        checkCount,
        status,
      },
    })
  } catch (error) {
    console.error('GET checks/my:', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}
