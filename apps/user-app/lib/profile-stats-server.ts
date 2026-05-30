import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { monthKey } from '@/lib/month-access'

export type ProfileCheckStats = {
  checksTotal: number
  activeMonths: number
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

function readMonthCount(payload: unknown, fallbackRows: number): number {
  if (payload && typeof payload === 'object') {
    const d = payload as Record<string, unknown>
    const summary =
      (d.monthSummary && typeof d.monthSummary === 'object'
        ? (d.monthSummary as Record<string, unknown>)
        : null) ||
      (d.data && typeof d.data === 'object'
        ? (d.data as Record<string, unknown>)
        : null)

    const count =
      (summary && typeof summary.checkCount === 'number' && summary.checkCount) ||
      (summary && typeof summary.check_count === 'number' && summary.check_count)

    if (typeof count === 'number' && Number.isFinite(count)) return count
  }
  return fallbackRows
}

async function fetchMonthCheckCount(token: string, month: string): Promise<number> {
  const url = `${getBackendBaseUrl()}/api/checks/my?month=${encodeURIComponent(month)}`

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) return 0

    const payload = (await res.json()) as unknown
    const rows = unwrapChecks(payload).length
    return readMonthCount(payload, rows)
  } catch {
    return 0
  }
}

/** Joriy yil bo‘yicha cheklar soni va faol oylar (backend JWT sessiya). */
export async function getProfileCheckStats(
  year: number
): Promise<ProfileCheckStats | null> {
  const token = getApiAuthToken()
  if (!token) return null

  const counts = await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      fetchMonthCheckCount(token, monthKey(year, index + 1))
    )
  )

  const checksTotal = counts.reduce((sum, c) => sum + c, 0)
  const activeMonths = counts.filter((c) => c > 0).length

  return { checksTotal, activeMonths }
}
