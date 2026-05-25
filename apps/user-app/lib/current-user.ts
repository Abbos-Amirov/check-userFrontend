import type { WorkType } from '@/lib/auth-signup'

/** Backend `/api/users/me` va cookie dan normalizatsiya qilingan foydalanuvchi */
export type CurrentUser = {
  id?: string
  fullName: string
  employeeId: string
  phone: string | null
  avatarUrl: string | null
  workType?: WorkType | null
}

function readString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return null
}

function unwrapUserPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>

  if (d.user && typeof d.user === 'object' && d.user !== null) {
    return d.user as Record<string, unknown>
  }

  const nested =
    d.data && typeof d.data === 'object' && d.data !== null
      ? (d.data as Record<string, unknown>)
      : null

  if (nested?.user && typeof nested.user === 'object' && nested.user !== null) {
    return nested.user as Record<string, unknown>
  }

  if (nested && (nested.fullName || nested.full_name || nested.employeeId || nested.employee_id)) {
    return nested
  }

  if (d.fullName || d.full_name || d.employeeId || d.employee_id || d.name) {
    return d
  }

  return null
}

/** Next.js `public/` dagi assetlar — backend proxy kerak emas */
const NEXT_PUBLIC_ASSET_PREFIXES = ['/demo-users/', '/demo-checks/']

function isNextPublicAsset(path: string): boolean {
  return NEXT_PUBLIC_ASSET_PREFIXES.some((prefix) => path.startsWith(prefix))
}

/** Backend static fayllar — Next.js rewrite orqali proxy qilinadi */
function isBackendMediaPath(path: string): boolean {
  return /^\/(uploads|static|media|files|avatars?)(\/|$)/i.test(path)
}

function readAvatarFromObject(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (!value || typeof value !== 'object') return null
  const o = value as Record<string, unknown>
  for (const key of ['url', 'path', 'src', 'href', 'location']) {
    const v = o[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return null
}

function readAvatarUrl(raw: Record<string, unknown>): string | null {
  const direct = readString(
    raw,
    'avatarUrl',
    'avatar_url',
    'avatarPath',
    'avatar_path',
    'photoUrl',
    'photo_url',
    'imageUrl',
    'image_url',
    'profileImage',
    'profile_image',
    'picture',
    'photo'
  )
  if (direct) return direct

  for (const key of ['avatar', 'photo', 'image', 'profilePicture', 'profile_picture']) {
    const nested = readAvatarFromObject(raw[key])
    if (nested) return nested
  }

  return null
}

function readWorkType(raw: Record<string, unknown>): WorkType | null {
  const v = raw.workType ?? raw.work_type
  if (v === 'inside' || v === 'outside') return v
  return null
}

/** Backend / cookie / Supabase qatorlarini bitta shaklga keltiradi */
export function normalizeCurrentUser(data: unknown): CurrentUser | null {
  const raw = unwrapUserPayload(data)
  if (!raw) return null

  const fullName =
    readString(raw, 'fullName', 'full_name', 'name') ?? ''
  const employeeId =
    readString(raw, 'employeeId', 'employee_id') ?? ''

  if (!fullName && !employeeId) return null

  const phone = readString(raw, 'phone', 'phoneNumber', 'phone_number')
  const avatarUrl = readAvatarUrl(raw)

  const id = readString(raw, 'id', '_id', 'userId', 'user_id') ?? undefined

  return {
    id,
    fullName,
    employeeId,
    phone,
    avatarUrl,
    workType: readWorkType(raw),
  }
}

/** Supabase `users` jadvali qatori */
export function normalizeSupabaseUserRow(row: {
  id?: string
  full_name?: string
  employee_id?: string
  phone?: string | null
  avatar_url?: string | null
}): CurrentUser {
  return {
    id: row.id,
    fullName: row.full_name?.trim() || '',
    employeeId: row.employee_id?.trim() || '',
    phone: row.phone?.trim() || null,
    avatarUrl: row.avatar_url?.trim() || null,
    workType: null,
  }
}

/** Backend media yo‘lini brauzer ochadigan URL ga aylantiradi */
export function resolveUserAvatarUrl(
  avatarUrl: string | null | undefined,
  backendBaseUrl?: string
): string | null {
  if (!avatarUrl?.trim()) return null
  let trimmed = avatarUrl.trim()

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }

  const base = backendBaseUrl?.replace(/\/$/, '') ?? ''

  // http://localhost:5000/uploads/... → /uploads/... (same-origin proxy)
  if (
    (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
    base &&
    trimmed.startsWith(`${base}/`)
  ) {
    trimmed = trimmed.slice(base.length)
  } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (!trimmed.startsWith('/')) {
    trimmed = `/${trimmed.replace(/^\//, '')}`
  }

  if (isNextPublicAsset(trimmed)) {
    return trimmed
  }

  // Backend uploads — Next.js rewrite orqali proxy (localhost:3000/uploads → 5000)
  if (isBackendMediaPath(trimmed)) {
    return trimmed
  }

  // uploads/avatar.png kabi nisbiy yo‘l
  if (/^(uploads|static|media|files|avatars?)\//i.test(trimmed.replace(/^\//, ''))) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }

  if (base) {
    return `${base}${trimmed}`
  }

  return trimmed
}
