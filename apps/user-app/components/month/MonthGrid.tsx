'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/i18n/I18nProvider'
import { formatMoney } from '@/lib/i18n/format'
import {
  buildMonthStatusMapFromPlannerData,
  computeMaxAccessibleMonth,
  resolveGridMonthStatus,
  type MonthStatusMap,
} from '@/lib/month-access'
import type { MonthlyReport } from '@/types'

interface Props {
  tone?: 'default' | 'prestige'
  year: number
  reports: MonthlyReport[]
  checkCounts: { month: string; id: string }[]
  initialStatuses?: MonthStatusMap
}

const STATUS_PRESTIGE: Record<string, { dot: string; ring: string }> = {
  empty: { dot: 'bg-planner-line', ring: 'ring-planner-line/40' },
  uploaded: { dot: 'bg-warning', ring: 'ring-warning/30' },
  submitted: { dot: 'bg-indigo-400', ring: 'ring-indigo-400/30' },
  approved: { dot: 'bg-success', ring: 'ring-success/30' },
  paid: { dot: 'bg-success', ring: 'ring-success/30' },
}

const STATUS_DOT: Record<string, string> = {
  empty: 'bg-gray-300',
  uploaded: 'bg-warning',
  submitted: 'bg-indigo-500',
  approved: 'bg-success',
  paid: 'bg-success',
}

export default function MonthGrid({
  tone = 'default',
  year,
  reports,
  checkCounts,
  initialStatuses,
}: Props) {
  const { locale, dictionary, t } = useI18n()
  const router = useRouter()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const monthsShort = dictionary.months.short

  const fallbackStatuses = useMemo(
    () =>
      buildMonthStatusMapFromPlannerData(year, reports, checkCounts, initialStatuses),
    [year, reports, checkCounts, initialStatuses]
  )

  const [statuses, setStatuses] = useState<MonthStatusMap>(fallbackStatuses)
  const [maxAccessibleMonth, setMaxAccessibleMonth] = useState(() =>
    computeMaxAccessibleMonth(year, fallbackStatuses)
  )

  useEffect(() => {
    setStatuses(fallbackStatuses)
    setMaxAccessibleMonth(computeMaxAccessibleMonth(year, fallbackStatuses))
  }, [fallbackStatuses, year])

  useEffect(() => {
    let cancelled = false

    async function loadStatuses() {
      try {
        const res = await fetch(`/api/checks/year-status?year=${year}`, {
          cache: 'no-store',
        })
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (data?.statuses && typeof data.statuses === 'object') {
          const nextStatuses = data.statuses as MonthStatusMap
          setStatuses(nextStatuses)
          setMaxAccessibleMonth(
            data.maxAccessibleMonth != null && !Number.isNaN(Number(data.maxAccessibleMonth))
              ? Number(data.maxAccessibleMonth)
              : computeMaxAccessibleMonth(year, nextStatuses)
          )
        }
      } catch {
        /* jim — fallbackStatuses qoladi */
      }
    }

    void loadStatuses()

    function refreshOnFocus() {
      if (document.visibilityState === 'visible') {
        void loadStatuses()
      }
    }

    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  }, [year])

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1
    const monthStr = `${year}-${String(monthNum).padStart(2, '0')}`
    const report = reports.find((r) => r.month === monthStr)
    const count = checkCounts.filter((c) => c.month === monthStr).length
    const status = resolveGridMonthStatus(
      monthStr,
      report,
      count,
      statuses[monthStr]
    )

    const isCurrent = monthNum === currentMonth && year === currentYear
    const isLocked = monthNum > maxAccessibleMonth

    return { monthNum, monthStr, report, count, status, isCurrent, isLocked }
  })

  const isPrestige = tone === 'prestige'

  return (
    <div
      id="year-grid"
      className={`grid scroll-mt-24 ${
        isPrestige
          ? 'grid-cols-3 gap-2.5 rounded-[26px] border border-planner-line/50 bg-surface/90 p-3.5 shadow-planner-panel backdrop-blur-sm sm:gap-3 sm:p-4'
          : 'grid-cols-3 gap-2.5'
      }`}
    >
      {months.map(
        ({ monthNum, monthStr, report, count, status, isCurrent, isLocked }, index) => {
          const prestigeStatus = STATUS_PRESTIGE[status] ?? STATUS_PRESTIGE.empty

          return (
            <button
              key={monthStr}
              type="button"
              onClick={() => !isLocked && router.push(`/month/${year}/${monthNum}`)}
              disabled={isLocked}
              title={isLocked ? t('month.lockedHint') : undefined}
              style={isPrestige ? { animationDelay: `${index * 35}ms` } : undefined}
              className={
                isPrestige
                  ? `planner-month-tile relative flex min-h-[108px] flex-col gap-1 overflow-hidden rounded-[18px] border p-3 text-left transition-all duration-200 ${
                      isCurrent
                        ? 'border-planner-gold/50 bg-gradient-to-br from-planner-navy via-planner-slate to-planner-ink shadow-planner-month-active'
                        : 'border-planner-line/60 bg-gradient-to-b from-white to-planner-cream/80 shadow-planner-soft hover:border-planner-gold/25 hover:shadow-planner-month-current'
                    } ${isLocked ? 'cursor-not-allowed opacity-[0.32]' : 'active:scale-[0.96]'}`
                  : `flex flex-col gap-1 rounded-2xl border bg-surface p-3 text-left transition-all ${
                      isCurrent
                        ? 'border-2 border-accent shadow-[0_4px_16px_rgba(232,83,63,0.15)]'
                        : 'border-border'
                    } ${isLocked ? 'cursor-not-allowed opacity-30' : 'active:scale-[0.96]'}`
              }
            >
              {isPrestige && isCurrent && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-planner-gold/25 blur-xl"
                />
              )}

              <span
                className={
                  isPrestige
                    ? `relative font-display text-[24px] font-extrabold leading-none tracking-[-0.04em] sm:text-[26px] ${
                        isCurrent ? 'text-planner-gold' : 'text-planner-ink'
                      }`
                    : 'font-display text-2xl font-bold leading-none text-primary'
                }
              >
                {String(monthNum).padStart(2, '0')}
              </span>
              <span
                className={
                  isPrestige
                    ? `relative text-[9px] font-bold uppercase tracking-[0.18em] sm:text-[10px] ${
                        isCurrent ? 'text-white/55' : 'text-planner-fog'
                      }`
                    : 'text-xs font-body text-text-tertiary'
                }
              >
                {monthsShort[monthNum - 1] ?? ''}
              </span>

              {report?.total_amount ? (
                <span
                  className={
                    isPrestige
                      ? `relative mt-auto text-[10px] font-semibold font-body leading-tight sm:text-[11px] ${
                          isCurrent ? 'text-white/80' : 'text-planner-slate'
                        }`
                      : 'text-[11px] font-medium font-body leading-tight text-primary'
                  }
                >
                  {formatMoney(
                    Number(report.total_amount),
                    locale,
                    dictionary.currencySuffix
                  )}
                </span>
              ) : count > 0 ? (
                <span
                  className={
                    isPrestige
                      ? `relative mt-auto text-[10px] font-semibold font-body sm:text-[11px] ${
                          isCurrent ? 'text-planner-gold/90' : 'text-planner-fog'
                        }`
                      : 'text-[11px] font-body text-text-secondary'
                  }
                >
                  {t('month.checksCount', { count })}
                </span>
              ) : (
                <span
                  className={
                    isPrestige
                      ? `relative mt-auto text-[10px] font-body ${
                          isCurrent ? 'text-white/35' : 'text-planner-line'
                        }`
                      : 'text-[11px] font-body text-[#C4C2BC]'
                  }
                >
                  {dictionary.common.dash}
                </span>
              )}

              {isPrestige ? (
                <span
                  className={`relative mt-1 inline-flex h-2 w-2 rounded-full ring-2 ${prestigeStatus.dot} ${prestigeStatus.ring}`}
                  aria-hidden
                />
              ) : (
                <div className={`mt-0.5 h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
              )}
            </button>
          )
        }
      )}
    </div>
  )
}
