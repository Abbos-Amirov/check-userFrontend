import {
  readStatusFromSummaryPayload,
  resolveMonthStatusFromSources,
} from '@/lib/month-status-resolve'
import type { MonthSummaryStatus } from '@/types'

export type MonthSummaryResult = {
  totalAmount: number
  checkCount: number
  status: MonthSummaryStatus
  month?: string
}

function readNumber(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v)
  }
  return 0
}

function readPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const root = data as Record<string, unknown>
  if (root.data && typeof root.data === 'object' && root.data !== null) {
    return root.data as Record<string, unknown>
  }
  return root
}

export function normalizeMonthSummaryResponse(data: unknown): MonthSummaryResult | null {
  const payload = readPayload(data)
  if (!payload) return null

  const totalAmount = readNumber(payload, 'totalAmount', 'total_amount', 'total', 'amount')
  const checkCount = readNumber(payload, 'checkCount', 'check_count', 'count')
  const status = resolveMonthStatusFromSources({
    summaryPayload: data,
    fallbackStatus: checkCount > 0 ? 'uploaded' : 'empty',
  })

  if (!totalAmount && !checkCount && !readStatusFromSummaryPayload(data)) {
    return null
  }

  return {
    totalAmount,
    checkCount,
    status,
    month: typeof payload.month === 'string' ? payload.month : undefined,
  }
}
