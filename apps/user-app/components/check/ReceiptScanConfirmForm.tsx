'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { useI18n } from '@/components/i18n/I18nProvider'
import { extractApiErrorMessage } from '@/lib/auth-api'
import type { ReceiptParsed, ReceiptScanDraft } from '@/lib/check-scan'
import { buildConfirmBody } from '@/lib/check-scan'

type Props = {
  draft: ReceiptScanDraft
  defaultMonth: string
  onCancel: () => void
  onConfirmed: () => void
}

const inputClass =
  'h-12 w-full rounded-2xl border border-border bg-surface px-4 font-body text-[15px] text-primary placeholder:text-[#C4C2BC] focus:border-primary focus:outline-none'

export default function ReceiptScanConfirmForm({
  draft,
  defaultMonth,
  onCancel,
  onConfirmed,
}: Props) {
  const { t } = useI18n()
  const [storeName, setStoreName] = useState(draft.parsed.storeName)
  const [amount, setAmount] = useState(
    draft.parsed.amount != null ? String(draft.parsed.amount) : ''
  )
  const [purchaseDate, setPurchaseDate] = useState(draft.parsed.purchaseDate)
  const [cardInfo, setCardInfo] = useState(draft.parsed.cardInfo)
  const [month, setMonth] = useState(defaultMonth)
  const [items, setItems] = useState(
    draft.parsed.items.length > 0
      ? draft.parsed.items
      : [{ name: '', price: 0 }]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setStoreName(draft.parsed.storeName)
    setAmount(draft.parsed.amount != null ? String(draft.parsed.amount) : '')
    setPurchaseDate(draft.parsed.purchaseDate)
    setCardInfo(draft.parsed.cardInfo)
    setMonth(defaultMonth)
    setItems(
      draft.parsed.items.length > 0
        ? draft.parsed.items
        : [{ name: '', price: 0 }]
    )
    setError('')
  }, [draft, defaultMonth])

  function updateItem(index: number, patch: Partial<{ name: string; price: number }>) {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  function addItem() {
    setItems((prev) => [...prev, { name: '', price: 0 }])
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsedAmount = Number(amount)
    if (!month.trim()) {
      setError(t('receiptScan.monthRequired'))
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t('receiptScan.amountMin'))
      return
    }

    const form: ReceiptParsed & { month: string } = {
      storeName,
      amount: parsedAmount,
      purchaseDate,
      cardInfo,
      items,
      month: month.trim(),
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checks/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildConfirmBody(draft, form)),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, t('receiptScan.confirmFailed')))
      }
      onConfirmed()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('receiptScan.confirmFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleConfirm}
      className="overflow-hidden rounded-[24px] border border-planner-line/50 bg-surface shadow-planner-panel"
    >
      <div className="border-b border-planner-line/40 bg-gradient-to-r from-planner-navy to-planner-slate px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-planner-gold/20 text-base">
            🤖
          </span>
          <div>
            <p className="font-display text-[15px] font-bold text-white">{t('receiptScan.title')}</p>
            <p className="text-[11px] text-white/60">{t('receiptScan.subtitle')}</p>
          </div>
        </div>
      </div>

      {draft.imageUrl && (
        <div className="border-b border-planner-line/35 bg-planner-cream/30 p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-planner-fog">
            {t('receiptScan.preview')}
          </p>
          <div className="overflow-hidden rounded-2xl border border-planner-line/45 bg-surface">
            <img
              src={draft.imageUrl}
              alt=""
              className="max-h-48 w-full object-contain object-center"
            />
          </div>
        </div>
      )}

      <div className="space-y-3 p-4">
        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('receiptScan.storeName')}</label>
          <input
            className={inputClass}
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('receiptScan.amount')}</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('receiptScan.purchaseDate')}</label>
          <input
            className={inputClass}
            type="date"
            value={purchaseDate?.slice(0, 10) ?? ''}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('receiptScan.cardInfo')}</label>
          <input
            className={inputClass}
            value={cardInfo}
            onChange={(e) => setCardInfo(e.target.value)}
            placeholder={t('receiptScan.cardInfoPlaceholder')}
          />
        </div>

        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('receiptScan.month')}</label>
          <input
            className={inputClass}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="2025-05"
            pattern="\d{4}-\d{2}"
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-label text-text-secondary">{t('receiptScan.items')}</label>
            <button
              type="button"
              onClick={addItem}
              className="text-[13px] font-semibold text-accent"
            >
              + {t('receiptScan.addItem')}
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className={`${inputClass} min-w-0 flex-1`}
                  value={item.name}
                  placeholder={t('receiptScan.itemName')}
                  onChange={(e) => updateItem(index, { name: e.target.value })}
                />
                <input
                  className={`${inputClass} w-24 shrink-0`}
                  type="number"
                  min="0"
                  step="any"
                  value={item.price || ''}
                  placeholder="0"
                  onChange={(e) =>
                    updateItem(index, { price: Number(e.target.value) || 0 })
                  }
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="flex h-12 w-10 shrink-0 items-center justify-center rounded-2xl border border-border text-text-tertiary"
                  aria-label={t('receiptScan.removeItem')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-center text-body-sm text-danger">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
            {t('receiptScan.cancel')}
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            {loading ? t('receiptScan.confirming') : t('receiptScan.confirm')}
          </Button>
        </div>
      </div>
    </form>
  )
}
