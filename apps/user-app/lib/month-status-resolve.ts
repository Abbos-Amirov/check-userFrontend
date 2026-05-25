import type { MonthSummaryStatus } from '@/types'

const STATUS_RANK: Record<MonthSummaryStatus, number> = {
  empty: 0,
  uploaded: 1,
  submitted: 2,
  approved: 3,
}

function readPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const root = data as Record<string, unknown>
  if (root.data && typeof root.data === 'object' && root.data !== null) {
    return root.data as Record<string, unknown>
  }
  return root
}

function normalizeStatusValue(value: unknown): MonthSummaryStatus | null {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  if (
    v === 'approved' ||
    v === 'paid' ||
    v === 'accepted' ||
    v === 'confirmed' ||
    v === 'complete' ||
    v === 'completed'
  ) {
    return 'approved'
  }
  if (v === 'submitted') return 'submitted'
  if (v === 'uploaded' || v === 'pending') return 'uploaded'
  if (v === 'empty' || v === 'draft') return 'empty'
  if (v === 'rejected') return 'uploaded'
  return null
}

function readStatusFromPayload(payload: Record<string, unknown>): MonthSummaryStatus | null {
  const nestedSummary =
    payload.monthSummary && typeof payload.monthSummary === 'object'
      ? (payload.monthSummary as Record<string, unknown>)
      : null

  const candidates = [
    payload.status,
    payload.monthlyStatus,
    payload.monthStatus,
    payload.monthly_status,
    payload.receiptStatus,
    payload.approvalStatus,
    nestedSummary?.status,
    nestedSummary?.monthlyStatus,
  ]

  for (const candidate of candidates) {
    const parsed = normalizeStatusValue(candidate)
    if (parsed) return parsed
  }

  return null
}

export function mergeMonthStatus(
  a?: MonthSummaryStatus,
  b?: MonthSummaryStatus
): MonthSummaryStatus {
  const left = a ?? 'empty'
  const right = b ?? 'empty'
  return STATUS_RANK[left] >= STATUS_RANK[right] ? left : right
}

export function isAllChecksApproved(
  checks: Array<{ status?: string | null }>
): boolean {
  return checks.length > 0 && checks.every((check) => check.status === 'approved')
}

export function resolveMonthStatusFromSources(input: {
  summaryPayload?: unknown
  checks?: Array<{ status?: string | null }>
  fallbackStatus?: MonthSummaryStatus
}): MonthSummaryStatus {
  const payload = readPayload(input.summaryPayload)
  const fromSummary = payload ? readStatusFromPayload(payload) : null

  if (fromSummary === 'approved') return 'approved'
  if (isAllChecksApproved(input.checks ?? [])) return 'approved'

  if (fromSummary) return fromSummary
  if (input.fallbackStatus) return input.fallbackStatus
  if ((input.checks?.length ?? 0) > 0) return 'uploaded'
  return 'empty'
}

export function readStatusFromSummaryPayload(data: unknown): MonthSummaryStatus | null {
  const payload = readPayload(data)
  if (!payload) return null
  return readStatusFromPayload(payload)
}
