import type { MonthSummaryStatus } from '@/types'
import type { MonthlyReport } from '@/types'
import { mergeMonthStatus } from '@/lib/month-status-resolve'

export type MonthStatusMap = Record<string, MonthSummaryStatus>

export function monthKey(year: number, monthNum: number): string {
  return `${year}-${String(monthNum).padStart(2, '0')}`
}

export function resolveGridMonthStatus(
  monthStr: string,
  report?: MonthlyReport | null,
  checkCount = 0,
  apiStatus?: MonthSummaryStatus
): MonthSummaryStatus {
  const fromPlanner =
    report?.status === 'paid'
      ? 'approved'
      : report?.status === 'submitted'
        ? 'submitted'
        : checkCount > 0
          ? 'uploaded'
          : 'empty'

  return mergeMonthStatus(apiStatus, fromPlanner)
}

export function buildMonthStatusMapFromPlannerData(
  year: number,
  reports: MonthlyReport[],
  checkCounts: { month: string; id: string }[],
  apiStatuses?: MonthStatusMap
): MonthStatusMap {
  const statuses: MonthStatusMap = { ...apiStatuses }

  for (let monthNum = 1; monthNum <= 12; monthNum++) {
    const monthStr = monthKey(year, monthNum)
    const report = reports.find((r) => r.month === monthStr)
    const count = checkCounts.filter((c) => c.month === monthStr).length
    const plannerStatus = resolveGridMonthStatus(monthStr, report, count)
    statuses[monthStr] = mergeMonthStatus(statuses[monthStr], plannerStatus)
  }

  return statuses
}

/** Joriy yilda ochiq oy: bugungi oy + tasdiqlangan oy keyingisi. */
export function computeMaxAccessibleMonth(
  year: number,
  statuses: MonthStatusMap,
  now = new Date()
): number {
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (year > currentYear) return 0
  if (year < currentYear) return 12

  let max = currentMonth

  for (let monthNum = 1; monthNum < 12; monthNum++) {
    if (statuses[monthKey(year, monthNum)] === 'approved') {
      max = Math.max(max, monthNum + 1)
    }
  }

  return Math.min(max, 12)
}

export function isMonthAccessible(
  year: number,
  monthNum: number,
  statuses: MonthStatusMap,
  now = new Date()
): boolean {
  if (monthNum < 1 || monthNum > 12) return false
  return monthNum <= computeMaxAccessibleMonth(year, statuses, now)
}
