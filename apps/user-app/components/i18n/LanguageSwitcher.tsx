'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import type { Locale } from '@/lib/i18n/types'

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
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

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  async function pick(next: Locale) {
    setOpen(false)
    if (next !== locale) await setLocale(next)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm transition-colors hover:bg-surface-2 active:scale-95"
        aria-label={t('lang.switchLabel')}
        aria-expanded={open}
      >
        <GlobeIcon />
      </button>
      {open && (
        <ul
          className="absolute right-0 top-11 z-[100] min-w-[140px] overflow-hidden rounded-2xl border border-border bg-surface py-1 shadow-card"
          role="listbox"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={locale === 'uz'}
              onClick={() => pick('uz')}
              className={`flex w-full px-4 py-2.5 text-left text-body-md hover:bg-surface-2 ${
                locale === 'uz' ? 'font-semibold text-accent' : 'text-primary'
              }`}
            >
              {t('lang.uz')}
            </button>
          </li>
          <li>
            <button
              type="button"
              role="option"
              aria-selected={locale === 'ko'}
              onClick={() => pick('ko')}
              className={`flex w-full px-4 py-2.5 text-left text-body-md hover:bg-surface-2 ${
                locale === 'ko' ? 'font-semibold text-accent' : 'text-primary'
              }`}
            >
              {t('lang.ko')}
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
