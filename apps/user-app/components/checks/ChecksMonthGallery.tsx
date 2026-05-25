'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import { extractApiErrorMessage } from '@/lib/auth-api'
import { formatKrwWon } from '@/lib/i18n/format'
import type { CheckFeedItem } from '@/types'

type Props = {
  calendarYear: number
}

function formatAmount(item: CheckFeedItem): string | null {
  if (!item.amount) return null
  if (item.currency === 'KRW') return formatKrwWon(item.amount)
  if (item.currency === 'CHF') return `${item.amount} CHF`
  return `${item.amount}`
}

function ReceiptLightbox({
  item,
  onClose,
}: {
  item: CheckFeedItem
  onClose: () => void
}) {
  const { t } = useI18n()
  const amount = formatAmount(item)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0a0f18]/97 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={t('home.checksImagePreview')}
      onClick={onClose}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 font-body text-[14px] font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-white/18 active:scale-[0.98]"
        >
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          {t('nav.back')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl font-light text-white transition-all hover:bg-white/18"
          aria-label={t('ai.dismiss')}
        >
          ×
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center px-3 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="checks-lightbox-frame w-full max-w-mobile overflow-hidden rounded-[28px] border border-white/10 bg-black/40 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <img
            src={item.receipt}
            alt=""
            className="mx-auto max-h-[calc(100vh-11rem)] w-full object-contain"
          />
        </div>
      </div>

      {(amount || item.storeName) && (
        <div
          className="shrink-0 border-t border-white/10 bg-black/30 px-5 py-4 text-center backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {amount && (
            <p className="font-display text-xl font-bold tabular-nums text-planner-gold">{amount}</p>
          )}
          {item.storeName && (
            <p className="mt-1 text-sm text-white/65">{item.storeName}</p>
          )}
        </div>
      )}
    </div>
  )
}

function CheckCard({
  item,
  index,
  onOpen,
}: {
  item: CheckFeedItem
  index: number
  onOpen: () => void
}) {
  const amount = formatAmount(item)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="checks-card group block w-full text-left"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="overflow-hidden rounded-[24px] border border-planner-line/50 bg-surface shadow-card ring-1 ring-black/[0.03] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-planner-gold/40 group-hover:shadow-card-hover group-active:scale-[0.985] dark:ring-white/[0.06]">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-planner-cream/80 via-white to-planner-parchment/50">
          <img
            src={item.receipt}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface/92 text-[13px] text-planner-ink shadow-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            ↗
          </span>
        </div>

        {(amount || item.storeName) && (
          <div className="relative border-t border-planner-line/40 bg-gradient-to-b from-white to-planner-cream/45 px-3 py-3 pl-4">
            <span
              aria-hidden
              className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-gradient-to-b from-planner-gold to-accent/80"
            />
            {amount && (
              <p className="font-display text-[15px] font-extrabold tabular-nums leading-none tracking-[-0.02em] text-planner-ink">
                {amount}
              </p>
            )}
            {item.storeName && (
              <p className="mt-1.5 truncate font-body text-[11px] font-medium text-planner-slate/75">
                {item.storeName}
              </p>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

function GalleryPlaceholder() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-[24px] border border-planner-line/40 bg-gradient-to-br from-white to-planner-cream/70"
        />
      ))}
    </div>
  )
}

export default function ChecksMonthGallery({ calendarYear }: Props) {
  const { t, dictionary } = useI18n()
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [previewItem, setPreviewItem] = useState<CheckFeedItem | null>(null)
  const [cache, setCache] = useState<Record<string, CheckFeedItem[]>>({})
  const [loadingMonth, setLoadingMonth] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')
  const loadedMonthsRef = useRef<Set<string>>(new Set())

  const monthKey = (monthNum: number) =>
    `${calendarYear}-${String(monthNum).padStart(2, '0')}`

  const fetchMonth = useCallback(
    async (monthNum: number) => {
      const key = `${calendarYear}-${String(monthNum).padStart(2, '0')}`
      if (loadedMonthsRef.current.has(key)) return
      loadedMonthsRef.current.add(key)

      setLoadingMonth(key)
      setLoadError('')
      try {
        const res = await fetch(`/api/checks/my-images?month=${encodeURIComponent(key)}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(extractApiErrorMessage(data, t('common.genericError')))
        }

        const images: CheckFeedItem[] = Array.isArray(data.images) ? data.images : []
        setCache((prev) => ({ ...prev, [key]: images }))
      } catch (e) {
        loadedMonthsRef.current.delete(key)
        setLoadError(e instanceof Error ? e.message : t('common.genericError'))
        setCache((prev) => ({ ...prev, [key]: [] }))
      } finally {
        setLoadingMonth(null)
      }
    },
    [calendarYear, t]
  )

  useEffect(() => {
    void fetchMonth(selectedMonth)
  }, [selectedMonth, fetchMonth])

  useEffect(() => {
    loadedMonthsRef.current = new Set()
    setCache({})
    const maxMonth =
      calendarYear === new Date().getFullYear() ? new Date().getMonth() + 1 : 12
    for (let m = 1; m <= maxMonth; m++) {
      void fetchMonth(m)
    }
  }, [calendarYear, fetchMonth])

  const monthsShort = dictionary.months.short

  const countsByMonth = useMemo(() => {
    const map = new Map<number, number>()
    for (const [key, items] of Object.entries(cache)) {
      const [y, mo] = key.split('-')
      if (Number(y) !== calendarYear) continue
      const m = Number(mo)
      if (m >= 1 && m <= 12) map.set(m, items.length)
    }
    return map
  }, [cache, calendarYear])

  const selectedKey = monthKey(selectedMonth)
  const filtered = cache[selectedKey] ?? []
  const isLoading = loadingMonth === selectedKey
  const isFuture = calendarYear === now.getFullYear() && selectedMonth > currentMonth

  return (
    <>
      <div className="checks-panel space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-planner-line/50 bg-surface/90 p-3 shadow-planner-panel backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-planner-fog">
              {calendarYear}
            </p>
            <p className="text-[10px] font-semibold text-planner-gold-dim">
              {t('home.checksMonthFilter')}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => {
              const monthNum = i + 1
              const count = countsByMonth.get(monthNum) ?? 0
              const isSelected = monthNum === selectedMonth
              const isCurrent = monthNum === currentMonth && calendarYear === now.getFullYear()
              const future = calendarYear === now.getFullYear() && monthNum > currentMonth

              return (
                <button
                  key={monthNum}
                  type="button"
                  onClick={() => setSelectedMonth(monthNum)}
                  className={`relative flex flex-col items-center gap-0.5 rounded-2xl border px-1 py-2.5 transition-all active:scale-[0.96] ${
                    isSelected
                      ? 'border-planner-gold/70 bg-gradient-to-b from-planner-navy to-planner-slate shadow-planner-month-active'
                      : future
                        ? 'border-planner-line/35 bg-planner-cream/35 opacity-45'
                        : 'border-planner-line/50 bg-gradient-to-b from-white to-planner-cream/60 hover:border-planner-gold/35'
                  }`}
                >
                  {isCurrent && !isSelected && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-planner-gold ring-2 ring-white" />
                  )}
                  <span
                    className={`font-display text-[15px] font-extrabold tabular-nums leading-none ${
                      isSelected ? 'text-planner-gold' : 'text-planner-ink'
                    }`}
                  >
                    {String(monthNum).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider ${
                      isSelected ? 'text-white/55' : 'text-planner-fog'
                    }`}
                  >
                    {monthsShort[i] ?? ''}
                  </span>
                  {count > 0 && (
                    <span
                      className={`mt-0.5 min-w-[18px] rounded-full px-1.5 py-px text-[9px] font-bold tabular-nums ${
                        isSelected
                          ? 'bg-planner-gold/30 text-planner-gold'
                          : 'bg-planner-parchment text-planner-slate'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <section className="checks-gallery-shell rounded-[28px] border border-planner-line/45 bg-surface/75 p-4 shadow-planner-soft backdrop-blur-sm">
          <div className="mb-4 flex items-end justify-between gap-3 border-b border-planner-line/40 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-planner-fog">
                {t('nav.checks')}
              </p>
              <h2 className="mt-1 font-display text-[20px] font-extrabold leading-tight tracking-[-0.03em] text-planner-ink">
                {dictionary.months.full[selectedMonth - 1]} {calendarYear}
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-planner-navy px-3 py-1.5 text-[11px] font-bold tabular-nums text-planner-gold">
              {t('home.checksMonthCount', { count: filtered.length })}
            </span>
          </div>

          {loadError && (
            <p className="mb-4 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-center text-body-sm text-danger">
              {loadError}
            </p>
          )}

          {isFuture ? (
            <div className="checks-empty-state">
              <span className="text-3xl">📅</span>
              <p>{t('home.checksFutureMonth')}</p>
            </div>
          ) : isLoading ? (
            <GalleryPlaceholder />
          ) : filtered.length === 0 ? (
            <div className="checks-empty-state">
              <span className="text-3xl">🧾</span>
              <p>{t('home.checksEmptyMonth')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((item, index) => (
                <CheckCard
                  key={item.id}
                  item={item}
                  index={index}
                  onOpen={() => setPreviewItem(item)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {previewItem && (
        <ReceiptLightbox item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </>
  )
}
