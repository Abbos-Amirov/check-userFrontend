'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CheckList from '@/components/check/CheckList'
import ReceiptScanConfirmForm from '@/components/check/ReceiptScanConfirmForm'
import MonthSummaryCard from '@/components/month/MonthSummary'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { useI18n } from '@/components/i18n/I18nProvider'
import { extractApiErrorMessage } from '@/lib/auth-api'
import type { ReceiptScanDraft } from '@/lib/check-scan'
import type { Check, MonthSummaryStatus } from '@/types'

export default function MonthPage() {
  const { t, dictionary } = useI18n()
  const params = useParams()
  const router = useRouter()
  const year = Number(params.year)
  const month = Number(params.month)

  const monthStr =
    Number.isFinite(year) && Number.isFinite(month)
      ? `${year}-${String(month).padStart(2, '0')}`
      : ''

  const [checks, setChecks] = useState<Check[]>([])
  const [monthSummary, setMonthSummary] = useState<{
    totalAmount: number
    checkCount: number
    status: MonthSummaryStatus
  }>({ totalAmount: 0, checkCount: 0, status: 'empty' })
  const [scanDraft, setScanDraft] = useState<ReceiptScanDraft | null>(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [monthCalcLoading, setMonthCalcLoading] = useState(false)
  const [monthCalcTotal, setMonthCalcTotal] = useState<number | null>(null)
  const [loadError, setLoadError] = useState('')
  const [accessChecked, setAccessChecked] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  const refresh = useCallback(async () => {
    if (!monthStr) return
    try {
      const res = await fetch(`/api/checks/my?month=${encodeURIComponent(monthStr)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('common.genericError'))
      setChecks(data.checks ?? [])
      setMonthSummary(
        data.monthSummary ?? { totalAmount: 0, checkCount: 0, status: 'empty' }
      )
      setLoadError('')
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : t('common.genericError'))
    }
  }, [monthStr, t])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!Number.isFinite(year) || !Number.isFinite(month)) return

    let cancelled = false

    async function verifyAccess() {
      try {
        const res = await fetch(`/api/checks/year-status?year=${year}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          if (!cancelled) setAccessChecked(true)
          return
        }

        const data = await res.json()
        const maxAccessibleMonth = Number(data.maxAccessibleMonth ?? 0)
        if (!cancelled) {
          setAccessDenied(month > maxAccessibleMonth)
          setAccessChecked(true)
        }
      } catch {
        if (!cancelled) setAccessChecked(true)
      }
    }

    void verifyAccess()

    function refreshOnFocus() {
      if (document.visibilityState === 'visible') {
        void verifyAccess()
      }
    }

    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  }, [year, month])

  async function handleFileSelect(file: File) {
    if (!monthStr) return
    setScanLoading(true)
    setScanDraft(null)
    setLoadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/checks/scan', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, t('receiptScan.scanFailed')))
      }

      const draft =
        data.draft ??
        (data.data && typeof data.data === 'object' ? data.data : null)

      if (!draft?.tempImageKey) {
        throw new Error(t('receiptScan.scanFailed'))
      }

      setScanDraft({
        tempImageKey: draft.tempImageKey,
        imageUrl: draft.imageUrl ?? '',
        parsed: draft.parsed ?? {
          storeName: '',
          amount: null,
          purchaseDate: '',
          cardInfo: '',
          items: [],
        },
      })
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : t('receiptScan.scanFailed'))
    } finally {
      setScanLoading(false)
    }
  }

  async function handleMonthCalculate() {
    if (!monthStr) return
    setMonthCalcLoading(true)
    setLoadError('')
    try {
      const res = await fetch(
        `/api/checks/month-summary?month=${encodeURIComponent(monthStr)}`
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, t('common.genericError')))
      }

      const summary =
        data.summary ??
        (data.data && typeof data.data === 'object' ? data.data : data)

      const totalAmount = Number(summary?.totalAmount ?? summary?.total_amount ?? 0)
      const checkCount = Number(summary?.checkCount ?? summary?.check_count ?? 0)
      const status = summary?.status ?? (checkCount > 0 ? 'uploaded' : 'empty')

      setMonthCalcTotal(totalAmount)
      setMonthSummary({
        totalAmount,
        checkCount,
        status,
      })
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : t('common.genericError'))
    } finally {
      setMonthCalcLoading(false)
    }
  }

  const invalid = !monthStr || month < 1 || month > 12 || !Number.isFinite(year)
  const headerTitle = `${dictionary.months.full[month - 1] ?? ''} ${year}`

  if (invalid) {
    return (
      <div className="min-h-screen bg-bg px-5 pb-[120px] pt-14">
        <p className="text-body-md text-text-secondary">{t('month.invalidMonth')}</p>
        <button
          type="button"
          className="mt-4 text-accent"
          onClick={() => router.push('/home')}
        >
          {t('month.backHome')}
        </button>
      </div>
    )
  }

  if (accessChecked && accessDenied) {
    return (
      <div className="min-h-screen bg-bg px-5 pb-[120px] pt-14">
        <PageHeader title={headerTitle} showBack />
        <p className="mt-6 text-body-md text-text-secondary">{t('month.lockedHint')}</p>
        <button
          type="button"
          className="mt-4 text-accent"
          onClick={() => router.push('/home/planner#year-grid')}
        >
          {t('nav.year')}
        </button>
      </div>
    )
  }

  const totalAmount =
    monthCalcTotal ?? monthSummary.totalAmount ?? checks.reduce((s, c) => s + Number(c.amount), 0)

  return (
    <div className="min-h-screen bg-bg pb-[220px]">
      <PageHeader title={headerTitle} showBack />

      <div className="px-5 pt-2">
        <MonthSummaryCard
          year={year}
          month={month}
          totalAmount={totalAmount}
          checkCount={monthSummary.checkCount || checks.length}
          status={monthSummary.status}
        />
      </div>

      {loadError && (
        <p className="mx-5 mt-3 text-center text-body-sm text-danger">{loadError}</p>
      )}

      {scanDraft && (
        <div className="mt-4 px-5">
          <ReceiptScanConfirmForm
            draft={scanDraft}
            defaultMonth={monthStr}
            onCancel={() => setScanDraft(null)}
            onConfirmed={async () => {
              setScanDraft(null)
              await refresh()
            }}
          />
        </div>
      )}

      <div className="mt-6 px-5">
        <h2 className="mb-3 font-display text-base font-semibold text-primary">
          {t('month.checksTitle')}
        </h2>
        {checks.length === 0 ? (
          <EmptyState
            emoji="🧾"
            title={t('month.emptyChecksTitle')}
            description={t('month.emptyChecksDesc')}
          />
        ) : (
          <CheckList checks={checks} />
        )}
      </div>

      {scanLoading && (
        <p className="mt-4 text-center text-body-sm text-text-secondary">{t('month.aiReading')}</p>
      )}

      <div className="fixed bottom-[72px] left-1/2 z-20 w-full max-w-mobile -translate-x-1/2 space-y-2.5 border-t border-border bg-bg/95 px-5 py-4 backdrop-blur-sm">
        <label className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary font-body text-[15px] font-medium text-white transition-all active:scale-[0.98]">
          <span className="text-lg">+</span>
          {t('month.addCheck')}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            disabled={scanLoading || Boolean(scanDraft)}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileSelect(f)
              e.target.value = ''
            }}
          />
        </label>

        {checks.length > 0 && (
          <button
            type="button"
            onClick={handleMonthCalculate}
            disabled={monthCalcLoading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-body text-[15px] font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {monthCalcLoading ? t('month.aiCalculating') : t('month.calcMonth')}
          </button>
        )}
      </div>
    </div>
  )
}
