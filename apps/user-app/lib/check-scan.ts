import { resolveUserAvatarUrl } from '@/lib/current-user'

export type ReceiptScanItem = {
  name: string
  price: number
}

export type ReceiptParsed = {
  storeName: string
  amount: number | null
  purchaseDate: string
  cardInfo: string
  items: ReceiptScanItem[]
}

export type ReceiptScanDraft = {
  tempImageKey: string
  imageUrl: string
  parsed: ReceiptParsed
}

export type ReceiptConfirmPayload = {
  tempImageKey: string
  month: string
  amount: number
  storeName?: string
  purchaseDate?: string
  cardInfo?: string
  items?: ReceiptScanItem[]
}

function readString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string') return v.trim()
  }
  return ''
}

function readNumber(obj: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v)
  }
  return null
}

function unwrapData(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  if (d.data && typeof d.data === 'object' && d.data !== null) {
    return d.data as Record<string, unknown>
  }
  return d
}

function normalizeItems(raw: unknown): ReceiptScanItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const o = row as Record<string, unknown>
      const name = readString(o, 'name', 'title', 'productName', 'product_name')
      const price = readNumber(o, 'price', 'amount', 'cost') ?? 0
      if (!name) return null
      return { name, price }
    })
    .filter((x): x is ReceiptScanItem => x !== null)
}

export function normalizeParsed(raw: unknown): ReceiptParsed {
  if (!raw || typeof raw !== 'object') {
    return { storeName: '', amount: null, purchaseDate: '', cardInfo: '', items: [] }
  }
  const o = raw as Record<string, unknown>
  return {
    storeName: readString(o, 'storeName', 'store_name', 'store'),
    amount: readNumber(o, 'amount', 'total', 'totalAmount', 'total_amount'),
    purchaseDate: readString(o, 'purchaseDate', 'purchase_date', 'date', 'check_date'),
    cardInfo: readString(o, 'cardInfo', 'card_info', 'card'),
    items: normalizeItems(o.items ?? o.products ?? o.lineItems),
  }
}

export function normalizeScanResponse(
  data: unknown,
  backendBaseUrl?: string
): ReceiptScanDraft | null {
  const payload = unwrapData(data)
  if (!payload) return null

  const tempImageKey = readString(payload, 'tempImageKey', 'temp_image_key', 'tempKey')
  if (!tempImageKey) return null

  const rawImage = readString(payload, 'imageUrl', 'image_url', 'url')
  const imageUrl =
    resolveUserAvatarUrl(rawImage || null, backendBaseUrl) ?? rawImage ?? ''

  const parsed = normalizeParsed(payload.parsed ?? payload)

  return { tempImageKey, imageUrl, parsed }
}

export function buildConfirmBody(
  draft: ReceiptScanDraft,
  form: ReceiptParsed & { month: string }
): ReceiptConfirmPayload {
  const amount = form.amount ?? 0
  const body: ReceiptConfirmPayload = {
    tempImageKey: draft.tempImageKey,
    month: form.month,
    amount,
  }

  if (form.storeName.trim()) body.storeName = form.storeName.trim()
  if (form.purchaseDate.trim()) body.purchaseDate = form.purchaseDate.trim()
  if (form.cardInfo.trim()) body.cardInfo = form.cardInfo.trim()

  const items = form.items.filter((i) => i.name.trim())
  if (items.length > 0) {
    body.items = items.map((i) => ({
      name: i.name.trim(),
      price: Number(i.price) || 0,
    }))
  }

  return body
}
