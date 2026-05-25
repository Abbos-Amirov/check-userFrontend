'use client'

import { useMemo, useState } from 'react'
import MonthGrid from '@/components/month/MonthGrid'
import { useI18n } from '@/components/i18n/I18nProvider'
import { homeYearPickerYears } from '@/lib/year-range'
import type { MonthStatusMap } from '@/lib/month-access'
import type { MonthlyReport } from '@/types'

interface Props {
  tone?: 'default' | 'prestige'
  calendarYear: number
  initialYear: number
  reports: MonthlyReport[]
  checkCounts: { month: string; id: string }[]
  initialStatuses?: MonthStatusMap
}

export default function YearMonthSection({
  tone = 'default',
  calendarYear,
  initialYear,
  reports,
  checkCounts,
  initialStatuses,
}: Props) {
  const { t } = useI18n()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(initialYear)

  const years = useMemo(
    () => homeYearPickerYears(calendarYear),
    [calendarYear]
  )

  const filteredReports = useMemo(
    () => reports.filter((r) => r.month.startsWith(`${selectedYear}-`)),
    [reports, selectedYear]
  )
  const filteredChecks = useMemo(
    () => checkCounts.filter((c) => c.month.startsWith(`${selectedYear}-`)),
    [checkCounts, selectedYear]
  )

  const isPrestige = tone === 'prestige'

  return (
    <div className={isPrestige ? 'planner-panel space-y-5' : 'space-y-3'}>
      {isPrestige && (
        <div className="flex items-center gap-3 px-0.5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-planner-line to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-planner-fog">
            {t('home.yearSectionLabel')}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-planner-line to-transparent" />
        </div>
      )}

      <button
        type="button"
        onClick={() => setPickerOpen((o) => !o)}
        aria-expanded={pickerOpen}
        className={
          isPrestige
            ? 'flex w-full items-center justify-between gap-3 rounded-[24px] border border-planner-line/70 bg-surface px-5 py-4 text-left shadow-planner-panel transition-all hover:border-planner-gold/40 hover:shadow-planner-soft active:scale-[0.99]'
            : 'flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-left shadow-card transition-colors hover:bg-surface-2 active:scale-[0.99]'
        }
      >
        <div>
          <p
            className={
              isPrestige
                ? 'text-[10px] font-bold uppercase tracking-[0.28em] text-planner-fog'
                : 'text-[11px] font-medium uppercase tracking-wide text-text-tertiary'
            }
          >
            {t('home.yearSectionLabel')}
          </p>
          <p
            className={
              isPrestige
                ? 'mt-1.5 font-display text-[22px] font-extrabold tracking-tight text-planner-ink'
                : 'font-display text-xl font-bold text-primary'
            }
          >
            {selectedYear}{' '}
            <span
              className={
                isPrestige
                  ? 'text-[17px] font-bold text-planner-fog'
                  : 'text-base font-semibold text-text-secondary'
              }
            >
              {t('home.yearTitle')}
            </span>
          </p>
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base transition-all duration-300 ${
            isPrestige
              ? `border border-planner-gold/30 bg-gradient-to-b from-planner-cream to-planner-parchment text-planner-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${pickerOpen ? 'rotate-180 border-planner-gold/50' : ''}`
              : `border border-border bg-bg text-primary ${pickerOpen ? 'rotate-180' : ''}`
          }`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {pickerOpen && (
        <div
          className={
            isPrestige
              ? 'max-h-[220px] overflow-y-auto rounded-[24px] border border-planner-line/70 bg-surface p-3.5 shadow-planner-panel'
              : 'max-h-[220px] overflow-y-auto rounded-2xl border border-border bg-surface p-3 shadow-card'
          }
          role="listbox"
          aria-label={t('home.yearListLabel')}
        >
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                role="option"
                aria-selected={y === selectedYear}
                onClick={() => {
                  setSelectedYear(y)
                  setPickerOpen(false)
                }}
                className={
                  isPrestige
                    ? `rounded-xl border px-1 py-2.5 text-center font-display text-sm font-bold transition-all active:scale-[0.96] ${
                        y === selectedYear
                          ? 'border-planner-gold bg-gradient-to-b from-planner-parchment to-planner-cream text-planner-ink shadow-[0_0_0_1px_rgba(212,175,55,0.4),inset_0_1px_0_rgba(255,255,255,0.8)]'
                          : 'border-planner-line/60 bg-planner-cream/60 text-planner-slate hover:border-planner-gold/30 hover:bg-planner-parchment/80'
                      }`
                    : `rounded-xl border px-1 py-2.5 text-center font-display text-sm font-semibold transition-all active:scale-[0.96] ${
                        y === selectedYear
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-bg text-primary hover:bg-surface-2'
                      }`
                }
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      )}

      <MonthGrid
        tone={tone}
        year={selectedYear}
        reports={filteredReports}
        checkCounts={filteredChecks}
        initialStatuses={initialStatuses}
      />
    </div>
  )
}
