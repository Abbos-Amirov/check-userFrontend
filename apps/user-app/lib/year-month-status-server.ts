import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { normalizeMonthSummaryResponse } from '@/lib/check-month-summary'
import {
  buildMonthStatusMapFromPlannerData,
  monthKey,
  type MonthStatusMap,
} from '@/lib/month-access'
import {
  mergeMonthStatus,
  resolveMonthStatusFromSources,
} from '@/lib/month-status-resolve'
import {
  normalizeNotificationsResponse,
} from '@/lib/notifications'
import { createServerClientOptional } from '@/lib/supabase/server'
import type { Check, MonthlyReport } from '@/types'

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
    amount: Number(o.amount ?? o.total ?? 0),
    store_name:
      (typeof o.store_name === 'string' && o.store_name) ||
      (typeof o.storeName === 'string' && o.storeName) ||
      null,
    check_date:
      (typeof o.check_date === 'string' && o.check_date) ||
      (typeof o.purchaseDate === 'string' && o.purchaseDate) ||
      null,
    month: typeof o.month === 'string' ? o.month : '',
    status: normalizeCheckStatus(o.status),
    admin_note: typeof o.admin_note === 'string' ? o.admin_note : null,
    created_at: typeof o.created_at === 'string' ? o.created_at : undefined,
  }
}

async function fetchApprovedMonthsFromNotifications(
  token: string,
  year: number
): Promise<MonthStatusMap> {
  const statuses: MonthStatusMap = {}
  const url = `${getBackendBaseUrl()}/api/notifications/my?limit=50`

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) return statuses

    const payload = (await res.json()) as unknown
    const parsed = normalizeNotificationsResponse(payload)

    for (const row of parsed.notifications) {
      if (row.type !== 'monthly_receipt_approved') continue
      if (row.year !== year || !row.month) continue
      statuses[monthKey(year, row.month)] = 'approved'
    }
  } catch {
    /* ixtiyoriy */
  }

  return statuses
}

async function resolveBackendMonthStatus(
  token: string,
  month: string
): Promise<MonthStatusMap[string]> {
  const summaryUrl = `${getBackendBaseUrl()}/api/checks/month-summary?month=${encodeURIComponent(month)}`
  const checksUrl = `${getBackendBaseUrl()}/api/checks/my?month=${encodeURIComponent(month)}`

  let summaryPayload: unknown = null
  let checksPayload: unknown = null

  try {
    const [summaryRes, checksRes] = await Promise.all([
      fetch(summaryUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      }),
      fetch(checksUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      }),
    ])

    if (summaryRes.ok) {
      summaryPayload = await summaryRes.json()
    }
    if (checksRes.ok) {
      checksPayload = await checksRes.json()
    }
  } catch {
    return 'empty'
  }

  const checks = unwrapChecks(checksPayload)
    .map((row) => normalizeBackendCheck(row))
    .filter((check): check is Check => check !== null)

  const summary = summaryPayload ? normalizeMonthSummaryResponse(summaryPayload) : null

  return resolveMonthStatusFromSources({
    summaryPayload,
    checks,
    fallbackStatus: summary?.status,
  })
}

export async function fetchYearMonthStatusesFromBackend(
  token: string,
  year: number
): Promise<MonthStatusMap> {
  const statuses: MonthStatusMap = {}
  const approvedFromNotifications = await fetchApprovedMonthsFromNotifications(token, year)

  await Promise.all(
    Array.from({ length: 12 }, async (_, index) => {
      const monthNum = index + 1
      const monthStr = monthKey(year, monthNum)
      const resolved = await resolveBackendMonthStatus(token, monthStr)
      statuses[monthStr] = mergeMonthStatus(
        approvedFromNotifications[monthStr],
        resolved
      )
    })
  )

  return statuses
}

export async function getYearMonthStatuses(
  year: number,
  reports: MonthlyReport[] = [],
  checkCounts: { month: string; id: string }[] = []
): Promise<MonthStatusMap> {
  const token = getApiAuthToken()
  if (token) {
    const apiStatuses = await fetchYearMonthStatusesFromBackend(token, year)
    return buildMonthStatusMapFromPlannerData(year, reports, checkCounts, apiStatuses)
  }

  const supabase = createServerClientOptional()
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      return buildMonthStatusMapFromPlannerData(year, reports, checkCounts)
    }
  }

  return buildMonthStatusMapFromPlannerData(year, reports, checkCounts)
}
