'use client'

import Link from 'next/link'
import { useI18n } from '@/components/i18n/I18nProvider'
import { formatMoney } from '@/lib/i18n/format'
import type { MonthlyReport } from '@/types'

interface Props {
  year: number
  month: number
  totalAmount: number
  checkCount: number
  report?: MonthlyReport | null
}

export default function CurrentMonthHighlight({
  year,
  month,
  totalAmount,
  checkCount,
  report,
}: Props) {
  const { locale, dictionary, t } = useI18n()
  const monthName = dictionary.months.full[month - 1] ?? ''

  const statusKey =
    report?.status === 'paid'
      ? 'badge.approved'
      : report?.status === 'submitted'
        ? 'badge.submitted'
        : checkCount > 0
          ? 'badge.uploaded'
          : 'badge.empty'

  return (
    <div className="px-5">
      <Link
        href={`/month/${year}/${month}`}
        className="block rounded-3xl border-2 border-accent bg-accent-soft/60 p-4 transition-transform active:scale-[0.99]"
      >
        <p className="text-label text-accent">{t('currentMonth.label')}</p>
        <p className="mt-1 font-display text-display-md text-primary">
          {monthName} {year}
        </p>
        <p className="mt-3 font-display text-2xl font-bold text-primary">
          {formatMoney(totalAmount, locale, dictionary.currencySuffix)}
        </p>
        <div className="mt-2 flex items-center justify-between text-body-sm text-text-secondary">
          <span>{t('month.checksCount', { count: checkCount })}</span>
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-primary shadow-sm">
            {t(statusKey)}
          </span>
        </div>
      </Link>
    </div>
  )
}
