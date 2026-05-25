export type MealAllowanceCurrent = {
  baseAmount: number
  extraAmount: number
  totalAmount: number
  reason: string | null
}

export type MealAllowanceMonthlySummary = {
  year: number
  month: number
  monthLabel: string
  hasAllowance: boolean
  current: MealAllowanceCurrent | null
  previous: MealAllowanceCurrent | null
}

function readNumber(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v)
  }
  return 0
}

function readString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string') return v.trim()
  }
  return ''
}

function normalizeCurrent(raw: unknown): MealAllowanceCurrent | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const totalAmount = readNumber(o, 'totalAmount', 'total_amount')
  if (!totalAmount && !readNumber(o, 'baseAmount', 'base_amount')) return null

  return {
    baseAmount: readNumber(o, 'baseAmount', 'base_amount'),
    extraAmount: readNumber(o, 'extraAmount', 'extra_amount'),
    totalAmount,
    reason: readString(o, 'reason') || null,
  }
}

export function normalizeMealAllowanceMonthlySummary(
  data: unknown
): MealAllowanceMonthlySummary | null {
  if (!data || typeof data !== 'object') return null

  const root = data as Record<string, unknown>
  const payload =
    root.data && typeof root.data === 'object' && root.data !== null
      ? (root.data as Record<string, unknown>)
      : root

  const year = readNumber(payload, 'year')
  const month = readNumber(payload, 'month')
  const current = normalizeCurrent(payload.current)
  const hasAllowance =
    payload.hasAllowance === true ||
    payload.has_allowance === true ||
    Boolean(current?.totalAmount)

  return {
    year: year || new Date().getFullYear(),
    month: month || new Date().getMonth() + 1,
    monthLabel: readString(payload, 'monthLabel', 'month_label'),
    hasAllowance,
    current,
    previous: normalizeCurrent(payload.previous),
  }
}
