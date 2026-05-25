import type { Locale } from '@/lib/i18n/types'
import type { Dictionary } from '@/lib/i18n/dictionary'

export function formatMoney(
  amount: number,
  locale: Locale,
  currencySuffix: string
): string {
  const nf = locale === 'ko' ? 'ko-KR' : 'uz-UZ'
  return `${new Intl.NumberFormat(nf).format(amount)} ${currencySuffix}`
}

/** Koreya voni (KRW) — raqam + ₩ (qat’iy bo‘shliq, qator tashlamaslik uchun). */
export function formatKrwWon(amount: number): string {
  return `${new Intl.NumberFormat('ko-KR').format(Math.round(amount))}\u00A0₩`
}

/** Ro‘yxatdan o‘tgan vaqt — locale bo‘yicha qisqa format */
export function formatRegisteredAt(iso: string, locale: Locale): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const tag = locale === 'ko' ? 'ko-KR' : 'uz-UZ'
  return new Intl.DateTimeFormat(tag, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

/** `YYYY-MM` → qisqa oy nomi + yil (masalan Yan 2026) */
export function formatMonthBadge(monthStr: string, dictionary: Dictionary): string {
  const [y, mo] = monthStr.split('-')
  const m = Number(mo)
  if (!y || !Number.isFinite(m) || m < 1 || m > 12) return monthStr
  const short = dictionary.months.short[m - 1]
  return `${short} ${y}`
}
