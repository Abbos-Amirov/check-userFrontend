import { resolveUserAvatarUrl } from '@/lib/current-user'
import type { CheckFeedItem } from '@/types'

export type { CheckFeedItem }

function readString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function readNumber(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v)
  }
  return 0
}

function unwrapImages(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  const d = data as Record<string, unknown>
  const nested =
    d.data && typeof d.data === 'object' && d.data !== null
      ? (d.data as Record<string, unknown>)
      : null

  for (const source of [d, nested]) {
    if (!source) continue
    for (const key of ['images', 'checks', 'items', 'receipts']) {
      if (Array.isArray(source[key])) return source[key] as unknown[]
    }
  }

  return []
}

export function normalizeMyImagesRow(
  row: unknown,
  options: { month: string; avatarSrc: string; backendBaseUrl?: string }
): CheckFeedItem | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>

  const id =
    readString(o, 'id', '_id', 'checkId', 'check_id') ||
    (typeof o.tempImageKey === 'string' ? o.tempImageKey : '')
  if (!id) return null

  const rawImage =
    readString(o, 'imageUrl', 'image_url', 'url', 'receipt', 'image', 'path') || ''
  const receipt = resolveUserAvatarUrl(rawImage || null, options.backendBaseUrl) ?? rawImage
  if (!receipt) return null

  const month = readString(o, 'month') || options.month
  const storeName = readString(o, 'storeName', 'store_name', 'store')
  const amount = readNumber(o, 'amount', 'total', 'totalAmount', 'total_amount')

  return {
    id,
    avatar: options.avatarSrc,
    receipt,
    month,
    storeName,
    amount,
    currency: 'KRW',
  }
}

export function normalizeMyImagesResponse(
  data: unknown,
  options: { month: string; avatarSrc: string; backendBaseUrl?: string }
): CheckFeedItem[] {
  return unwrapImages(data)
    .map((row) => normalizeMyImagesRow(row, options))
    .filter((item): item is CheckFeedItem => item !== null)
}
