'use client'

import type { MonthSummaryStatus } from '@/types'
import { useI18n } from '@/components/i18n/I18nProvider'

type StatusKey = MonthSummaryStatus | 'pending' | 'rejected' | 'paid'

const STYLE: Record<
  StatusKey,
  { bg: string; text: string; dictKey: string }
> = {
  empty: {
    bg: 'bg-neutral-soft',
    text: 'text-neutral',
    dictKey: 'badge.empty',
  },
  uploaded: {
    bg: 'bg-warning-soft',
    text: 'text-warning',
    dictKey: 'badge.uploaded',
  },
  submitted: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    dictKey: 'badge.submitted',
  },
  approved: {
    bg: 'bg-success-soft',
    text: 'text-success',
    dictKey: 'badge.approved',
  },
  pending: {
    bg: 'bg-warning-soft',
    text: 'text-warning',
    dictKey: 'badge.pending',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-danger',
    dictKey: 'badge.rejected',
  },
  paid: {
    bg: 'bg-success-soft',
    text: 'text-success',
    dictKey: 'badge.paid',
  },
}

interface BadgeProps {
  status: StatusKey
}

export default function Badge({ status }: BadgeProps) {
  const { t } = useI18n()
  const s = STYLE[status] ?? STYLE.pending
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium font-body ${s.bg} ${s.text}`}
    >
      {t(s.dictKey)}
    </span>
  )
}
