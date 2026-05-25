'use client'

import { useI18n } from '@/components/i18n/I18nProvider'
import { useLogout } from '@/components/auth/useLogout'

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function LogoutIconButton() {
  const { t } = useI18n()
  const { logout, loading } = useLogout()

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={loading}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm transition-colors hover:bg-surface-2 active:scale-95 disabled:opacity-50"
      aria-label={t('auth.logout')}
      title={t('auth.logout')}
    >
      <LogOutIcon className={loading ? 'opacity-40' : undefined} />
    </button>
  )
}
