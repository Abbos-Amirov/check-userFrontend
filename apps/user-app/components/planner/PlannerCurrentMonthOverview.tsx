'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import { formatKrwWon } from '@/lib/i18n/format'
import type { MealAllowanceMonthlySummary } from '@/lib/meal-allowance-summary'

const AMOUNT_CLASS =
  'min-w-0 w-full whitespace-nowrap font-display font-bold tabular-nums tracking-tight text-[clamp(13px,3.4vmin,22px)] leading-none'

type Props = {
  monthTitle: string
  monthNumber: number
}

type ChecksSummary = {
  totalAmount: number
  checkCount: number
}

export default function PlannerCurrentMonthOverview({
  monthTitle,
  monthNumber,
}: Props) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [allowance, setAllowance] = useState<MealAllowanceMonthlySummary | null>(null)
  const [checksSummary, setChecksSummary] = useState<ChecksSummary>({
    totalAmount: 0,
    checkCount: 0,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        let year = new Date().getFullYear()
        let month = monthNumber
        let nextAllowance: MealAllowanceMonthlySummary | null = null

        const allowanceRes = await fetch('/api/employee-meal-allowances/my/monthly-summary', {
          cache: 'no-store',
        })

        if (!cancelled && allowanceRes.ok) {
          const allowanceData = await allowanceRes.json()
          if (allowanceData.summary && typeof allowanceData.summary === 'object') {
            nextAllowance = allowanceData.summary as MealAllowanceMonthlySummary
            year = nextAllowance.year
            month = nextAllowance.month
          }
        }

        const monthStr = `${year}-${String(month).padStart(2, '0')}`
        const checksRes = await fetch(
          `/api/checks/month-summary?month=${encodeURIComponent(monthStr)}`,
          { cache: 'no-store' }
        )

        if (!cancelled) {
          if (nextAllowance) setAllowance(nextAllowance)

          if (checksRes.ok) {
            const checksData = await checksRes.json()
            const summary =
              checksData.summary ??
              (checksData.data && typeof checksData.data === 'object'
                ? checksData.data
                : checksData)

            setChecksSummary({
              totalAmount: Number(summary?.totalAmount ?? summary?.total_amount ?? 0),
              checkCount: Number(summary?.checkCount ?? summary?.check_count ?? 0),
            })
          }
        }
      } catch {
        /* jim */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [monthNumber])

  const allocatedAmount = allowance?.hasAllowance
    ? allowance.current?.totalAmount ?? 0
    : 0

  const usagePct =
    allocatedAmount > 0
      ? Math.min(100, Math.round((checksSummary.totalAmount / allocatedAmount) * 100))
      : 0

  const displayMonthNumber = allowance?.month ?? monthNumber
  const displayMonthTitle =
    allowance?.monthLabel ||
    monthTitle

  return (
    <section
      className="planner-hero relative mb-8 overflow-hidden rounded-[28px] border border-white/[0.12] shadow-planner-card"
      aria-labelledby="planner-overview-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-planner-navy via-[#152238] to-planner-ink"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-planner-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#2a4a6e]/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-planner-gold/50 to-transparent"
      />

      <div className="relative px-5 pb-6 pt-6 sm:px-6 sm:pt-7">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-bold uppercase tracking-[0.32em] text-planner-gold">
              <span>{t('home.plannerCurrentMonthBadge')}</span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 tabular-nums tracking-[0.15em] text-white">
                {String(displayMonthNumber).padStart(2, '0')}
              </span>
            </p>
            <h2
              id="planner-overview-heading"
              className="mt-2.5 font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.045em] text-white sm:text-[34px]"
            >
              {displayMonthTitle}
            </h2>
          </div>
          <div
            aria-hidden
            className="flex h-[52px] w-[52px] shrink-0 flex-col items-center justify-center rounded-2xl border border-planner-gold/35 bg-gradient-to-b from-white/15 to-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            <span className="font-display text-xl font-extrabold leading-none tabular-nums text-planner-gold">
              {String(displayMonthNumber).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
            <span className="text-white/45">{t('home.plannerUsageLabel')}</span>
            <span className="tabular-nums text-planner-gold">
              {loading ? '…' : `${usagePct}%`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-planner-gold-dim via-planner-gold to-[#f0dc82] shadow-[0_0_12px_rgba(212,175,55,0.45)] transition-all duration-700"
              style={{ width: loading ? '0%' : `${usagePct}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
          <div className="group flex min-w-0 flex-col gap-3 rounded-[20px] border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-md transition-colors hover:bg-white/[0.09] sm:p-4">
            <div className="rounded-xl border border-white/15 bg-black/25 px-3 py-2.5">
              <p className="font-display text-[10px] font-bold uppercase leading-snug tracking-[0.1em] text-white/85 sm:text-[11px]">
                {t('home.plannerAllocatedLabel')}
              </p>
            </div>
            {loading ? (
              <p className={`${AMOUNT_CLASS} text-white/50`}>{t('common.loading')}</p>
            ) : allowance?.hasAllowance ? (
              <>
                <p className={`${AMOUNT_CLASS} text-white`}>
                  {formatKrwWon(allocatedAmount)}
                </p>
                {allowance.current?.reason && (
                  <p className="text-[11px] leading-snug text-white/55">
                    {allowance.current.reason}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[13px] font-medium leading-snug text-white/70">
                {t('home.plannerNoAllowance')}
              </p>
            )}
          </div>

          <div className="group relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-[20px] border border-planner-gold/40 bg-gradient-to-br from-planner-gold/[0.14] to-white/[0.04] p-3.5 backdrop-blur-md sm:p-4">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-planner-gold/25 blur-2xl"
            />
            <div className="relative rounded-xl border border-planner-gold/45 bg-black/30 px-3 py-2.5">
              <p className="font-display text-[10px] font-bold uppercase leading-snug tracking-[0.1em] text-[#ecd893] sm:text-[11px]">
                {t('home.plannerChecksSumLabel')}
              </p>
            </div>
            <p className={`${AMOUNT_CLASS} relative font-extrabold text-[#f5e6a8]`}>
              {loading ? '…' : formatKrwWon(checksSummary.totalAmount)}
            </p>
            <p className="relative text-[10px] font-bold uppercase tracking-[0.14em] text-planner-gold sm:text-[11px]">
              {loading
                ? t('common.loading')
                : t('home.plannerChecksCountLabel', { count: checksSummary.checkCount })}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
