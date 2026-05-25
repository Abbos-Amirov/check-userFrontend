'use client'

import { useI18nOptional } from '@/components/i18n/I18nProvider'

export default function LoadingSpinner({ className = '' }: { className?: string }) {
  const i18n = useI18nOptional()
  const label = i18n?.t('common.loading') ?? 'Loading'
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent ${className}`}
      role="status"
      aria-label={label}
    />
  )
}
