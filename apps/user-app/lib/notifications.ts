export type NotificationType = 'monthly_receipt_approved' | 'monthly_receipt_rejected'

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  message: string
  year: number | null
  month: number | null
  rejectReason: string | null
  read: boolean
  createdAt: string
}

export type NotificationsListResult = {
  notifications: AppNotification[]
  unreadCount: number
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
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
  }
  return null
}

function readBool(obj: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'boolean') return v
  }
  return false
}

function normalizeType(value: unknown): NotificationType {
  if (value === 'monthly_receipt_rejected') return 'monthly_receipt_rejected'
  return 'monthly_receipt_approved'
}

export function normalizeNotification(row: unknown): AppNotification | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>
  const id = readString(o, 'id', '_id')
  if (!id) return null

  return {
    id,
    type: normalizeType(o.type),
    title: readString(o, 'title'),
    message: readString(o, 'message'),
    year: readNumber(o, 'year'),
    month: readNumber(o, 'month'),
    rejectReason: readString(o, 'rejectReason', 'reject_reason') || null,
    read: readBool(o, 'read', 'isRead', 'is_read'),
    createdAt: readString(o, 'createdAt', 'created_at'),
  }
}

export function normalizeNotificationsResponse(data: unknown): NotificationsListResult {
  const empty: NotificationsListResult = {
    notifications: [],
    unreadCount: 0,
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  }

  if (!data || typeof data !== 'object') return empty

  const root = data as Record<string, unknown>
  const payload =
    root.data && typeof root.data === 'object' && root.data !== null
      ? (root.data as Record<string, unknown>)
      : root

  const rows = Array.isArray(payload.notifications)
    ? payload.notifications
    : Array.isArray(root.notifications)
      ? root.notifications
      : []

  const notifications = rows
    .map((row) => normalizeNotification(row))
    .filter((n): n is AppNotification => n !== null)

  const paginationRaw =
    payload.pagination && typeof payload.pagination === 'object'
      ? (payload.pagination as Record<string, unknown>)
      : {}

  return {
    notifications,
    unreadCount: readNumber(payload, 'unreadCount', 'unread_count') ?? 0,
    pagination: {
      total: readNumber(paginationRaw, 'total') ?? notifications.length,
      page: readNumber(paginationRaw, 'page') ?? 1,
      limit: readNumber(paginationRaw, 'limit') ?? 20,
      totalPages: readNumber(paginationRaw, 'totalPages', 'total_pages') ?? 1,
    },
  }
}
