import { cookies } from 'next/headers'
import type { Locale } from '@/lib/i18n/types'
import { LOCALE_COOKIE } from '@/lib/i18n/types'
import { dictionaries } from '@/lib/i18n/dictionaries'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { createTranslator, type Translator } from '@/lib/i18n/t'

export function getLocale(): Locale {
  const v = cookies().get(LOCALE_COOKIE)?.value
  return v === 'ko' ? 'ko' : 'uz'
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function getTranslator(locale?: Locale): Translator {
  const loc = locale ?? getLocale()
  return createTranslator(getDictionary(loc))
}
