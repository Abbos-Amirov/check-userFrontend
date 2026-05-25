'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/i18n/I18nProvider'

interface PageHeaderProps {
  title: string
  showBack?: boolean
}

export default function PageHeader({ title, showBack }: PageHeaderProps) {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 bg-bg/90 px-5 pb-3 pt-4 backdrop-blur-sm">
      {showBack && (
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-primary transition-colors active:bg-surface-2"
          aria-label={t('nav.back')}
        >
          ←
        </button>
      )}
      <h1 className="font-display text-xl font-bold text-primary">{title}</h1>
    </div>
  )
}
