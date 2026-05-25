'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { useI18n } from '@/components/i18n/I18nProvider'
import { formatMoney } from '@/lib/i18n/format'
import type { Check } from '@/types'

function formatCheckDate(d: string | null, dash: string): string {
  if (!d) return dash
  return d
}

export default function CheckList({ checks }: { checks: Check[] }) {
  const { locale, dictionary, t } = useI18n()
  const dash = dictionary.common.dash

  return (
    <ul className="flex flex-col gap-2">
      {checks.map((check) => (
        <li key={check.id}>
          <Link
            href={`/check/${check.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors active:bg-surface-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={check.image_url}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl bg-surface-2 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-bold text-primary">
                {formatMoney(Number(check.amount), locale, dictionary.currencySuffix)}
              </p>
              <p className="truncate text-body-sm text-text-tertiary">
                {formatCheckDate(check.check_date, dash)} ·{' '}
                {check.store_name || t('common.store')}
              </p>
            </div>
            <Badge
              status={
                check.status === 'approved'
                  ? 'approved'
                  : check.status === 'rejected'
                    ? 'rejected'
                    : 'pending'
              }
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
