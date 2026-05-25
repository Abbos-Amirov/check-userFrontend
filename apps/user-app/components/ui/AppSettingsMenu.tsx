'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/components/i18n/I18nProvider'
import { useLogout } from '@/components/auth/useLogout'
import { applyTheme, readStoredTheme, type ThemeMode } from '@/lib/theme'
import type { Locale } from '@/lib/i18n/types'

const HIDE_LOGOUT_PATHS = new Set(['/login', '/register'])

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
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

function MenuRow({
  icon,
  label,
  onClick,
  active,
  danger,
  disabled,
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-body-md transition-colors hover:bg-surface-2 disabled:opacity-50 ${
        danger ? 'text-danger' : active ? 'font-semibold text-accent' : 'text-primary'
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2/80">
        {icon}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      {active && <span className="text-accent">✓</span>}
    </button>
  )
}

export default function AppSettingsMenu() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useI18n()
  const { logout, loading: logoutLoading } = useLogout()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>('light')
  const ref = useRef<HTMLDivElement>(null)

  const showLogout = !HIDE_LOGOUT_PATHS.has(pathname)
  const isDark = theme === 'dark'

  useEffect(() => {
    setTheme(readStoredTheme())
  }, [])

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function toggleTheme() {
    const next: ThemeMode = isDark ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  async function pickLocale(next: Locale) {
    if (next !== locale) await setLocale(next)
  }

  async function handleLogout() {
    setOpen(false)
    await logout()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm transition-colors hover:bg-surface-2 active:scale-95"
        aria-label={t('nav.menu')}
        aria-expanded={open}
      >
        <HamburgerIcon />
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-[100] w-[min(280px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
          role="menu"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">
              {t('nav.menu')}
            </p>
          </div>

          <MenuRow
            icon={isDark ? <SunIcon /> : <MoonIcon />}
            label={isDark ? t('theme.switchLight') : t('theme.switchDark')}
            onClick={toggleTheme}
          />

          <div className="border-t border-border">
            <div className="flex items-center gap-2 px-4 py-2.5">
              <GlobeIcon />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
                {t('lang.switchLabel')}
              </span>
            </div>
            <MenuRow
              icon={<span className="text-[11px] font-bold">UZ</span>}
              label={t('lang.uz')}
              active={locale === 'uz'}
              onClick={() => void pickLocale('uz')}
            />
            <MenuRow
              icon={<span className="text-[11px] font-bold">KO</span>}
              label={t('lang.ko')}
              active={locale === 'ko'}
              onClick={() => void pickLocale('ko')}
            />
          </div>

          {showLogout && (
            <div className="border-t border-border">
              <MenuRow
                icon={<LogOutIcon />}
                label={t('auth.logout')}
                onClick={() => void handleLogout()}
                danger
                disabled={logoutLoading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
