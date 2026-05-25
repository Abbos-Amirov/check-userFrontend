'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n/types'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { createTranslator, type Translator } from '@/lib/i18n/t'

type Ctx = {
  locale: Locale
  dictionary: Dictionary
  t: Translator
  setLocale: (l: Locale) => Promise<void>
}

const I18nContext = createContext<Ctx | null>(null)

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale
  dictionary: Dictionary
  children: ReactNode
}) {
  const router = useRouter()
  const t = useMemo(() => createTranslator(dictionary), [dictionary])

  const setLocale = useCallback(
    async (l: Locale) => {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: l }),
      })
      router.refresh()
    },
    [router]
  )

  const value = useMemo(
    () => ({ locale, dictionary, t, setLocale }),
    [locale, dictionary, t, setLocale]
  )

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  )
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n: I18nProvider ichida bo‘lishi kerak')
  }
  return ctx
}

/** Provider bo‘lmasa — faqat serverda ishlatiladi; clientda optional */
export function useI18nOptional(): Ctx | null {
  return useContext(I18nContext)
}
