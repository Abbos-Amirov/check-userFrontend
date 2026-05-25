'use client'

import type { AICheckResult } from '@/types'
import Button from '@/components/ui/Button'
import { useI18n } from '@/components/i18n/I18nProvider'
import { formatMoney } from '@/lib/i18n/format'

interface Props {
  result: AICheckResult
  onDismiss: () => void
}

export default function AIReadResult({ result, onDismiss }: Props) {
  const { t, locale, dictionary } = useI18n()
  const confidencePct = Math.round((result.confidence || 0) * 100)

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft">
            <span className="text-base">🤖</span>
          </div>
          <span className="font-display text-sm font-semibold text-primary">{t('ai.title')}</span>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium font-body ${
            result.confidence > 0.8
              ? 'bg-success-soft text-success'
              : 'bg-warning-soft text-warning'
          }`}
        >
          {confidencePct}% {t('ai.accuracy')}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-[#F0EEE9] py-2">
          <span className="text-body-md text-text-secondary">{t('ai.sum')}</span>
          <span className="font-display text-lg font-bold text-primary">
            {result.amount != null
              ? formatMoney(Number(result.amount), locale, dictionary.currencySuffix)
              : dictionary.common.dash}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-[#F0EEE9] py-2">
          <span className="text-body-md text-text-secondary">{t('check.store')}</span>
          <span className="text-body-md font-medium text-primary">
            {result.storeName || dictionary.common.dash}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-body-md text-text-secondary">{t('check.date')}</span>
          <span className="text-body-md font-medium text-primary">
            {result.date || dictionary.common.dash}
          </span>
        </div>
      </div>

      <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={onDismiss}>
        {t('ai.dismiss')}
      </Button>
    </div>
  )
}
