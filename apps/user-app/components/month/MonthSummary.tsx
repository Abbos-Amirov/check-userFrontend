'use client'

import Card from '@/components/ui/Card'
import { useI18n } from '@/components/i18n/I18nProvider'
import { formatKrwWon } from '@/lib/i18n/format'
import type { MonthSummaryStatus } from '@/types'

/** Ko‘rsatma UI: oq kartochkada «umumiy summa» (KRW / ₩). */

interface MonthSummaryProps {
  year: number
  month: number
  totalAmount: number
  checkCount: number
  status: MonthSummaryStatus
}

const STATUS_KEY: Record<MonthSummaryStatus, string> = {
  empty: 'badge.empty',
  uploaded: 'badge.uploaded',
  submitted: 'badge.submitted',
  approved: 'badge.approved',
}

export default function MonthSummaryCard({
  year,
  month,
  totalAmount,
  checkCount,
  status,
}: MonthSummaryProps) {
  const { dictionary, t } = useI18n()
  const monthName = dictionary.months.full[month - 1] ?? ''

  return (
    <Card className="p-5">
      <p className="text-body-sm text-text-tertiary">
        {monthName} {year}
      </p>
      <p className="mt-3 text-body-sm font-medium text-text-secondary">{t('month.umumiySummaTitle')}</p>
      <p className="font-display text-3xl font-bold text-primary">
        {formatKrwWon(totalAmount)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="text-xs text-text-tertiary">
          {t('month.checksCount', { count: checkCount })}
        </span>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium font-body text-primary">
          {t(STATUS_KEY[status])}
        </span>
      </div>
    </Card>
  )
}
