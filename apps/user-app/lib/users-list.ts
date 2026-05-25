import type { WorkType } from '@/lib/auth-signup'
import {
  normalizeCurrentUser,
  resolveUserAvatarUrl,
  type CurrentUser,
} from '@/lib/current-user'
import { DEFAULT_PROFILE_AVATAR_SRC } from '@/lib/profile-defaults'

export type CommunityUserItem = {
  id: string
  fullName: string
  employeeId: string
  avatarSrc: string
  registeredAt: string | null
  workType: WorkType | null
}

export type UsersAllCounts = {
  total: number
  inside: number
  outside: number
}

export type UsersAllByWorkType = {
  inside: CommunityUserItem[]
  outside: CommunityUserItem[]
}

export type UsersListResult = {
  users: CommunityUserItem[]
  byWorkType: UsersAllByWorkType
  counts: UsersAllCounts
  page: number
  limit: number
}

const EMPTY_BY_WORK_TYPE: UsersAllByWorkType = { inside: [], outside: [] }
const EMPTY_COUNTS: UsersAllCounts = { total: 0, inside: 0, outside: 0 }

function readString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return null
}

function readNumber(obj: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return null
}

/** `{ success, data: { users, byWorkType, counts } }` ichidagi `data` */
function unwrapDataPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>

  if (d.data && typeof d.data === 'object' && d.data !== null) {
    return d.data as Record<string, unknown>
  }

  if (d.users || d.byWorkType || d.counts) {
    return d
  }

  return null
}

function readRegisteredAt(raw: Record<string, unknown>): string | null {
  return (
    readString(raw, 'createdAt', 'created_at', 'registeredAt', 'registered_at') ??
    null
  )
}

export function normalizeCommunityUserItem(
  row: unknown,
  backendBaseUrl?: string,
  fallbackWorkType?: WorkType | null
): CommunityUserItem | null {
  if (!row || typeof row !== 'object') return null
  const raw = row as Record<string, unknown>
  const base = normalizeCurrentUser(row)
  if (!base) return null

  const id = readString(raw, 'id', '_id', 'userId', 'user_id') ?? base.id ?? ''
  const avatarSrc =
    resolveUserAvatarUrl(base.avatarUrl, backendBaseUrl) ??
    base.avatarUrl ??
    DEFAULT_PROFILE_AVATAR_SRC

  return {
    id: id || `${base.employeeId}-${base.fullName}`,
    fullName: base.fullName,
    employeeId: base.employeeId,
    avatarSrc,
    registeredAt: readRegisteredAt(raw),
    workType: base.workType ?? fallbackWorkType ?? null,
  }
}

function normalizeUserRows(
  rows: unknown[],
  backendBaseUrl?: string,
  fallbackWorkType?: WorkType | null
): CommunityUserItem[] {
  return rows
    .map((row) => normalizeCommunityUserItem(row, backendBaseUrl, fallbackWorkType))
    .filter((u): u is CommunityUserItem => u !== null)
}

function splitUsersByWorkType(users: CommunityUserItem[]): UsersAllByWorkType {
  const inside: CommunityUserItem[] = []
  const outside: CommunityUserItem[] = []

  for (const user of users) {
    if (user.workType === 'outside') {
      outside.push(user)
    } else {
      inside.push(user)
    }
  }

  return { inside, outside }
}

function readCounts(payload: Record<string, unknown>, byWorkType: UsersAllByWorkType): UsersAllCounts {
  const countsRaw =
    payload.counts && typeof payload.counts === 'object'
      ? (payload.counts as Record<string, unknown>)
      : null

  return {
    total: readNumber(countsRaw ?? {}, 'total') ?? byWorkType.inside.length + byWorkType.outside.length,
    inside: readNumber(countsRaw ?? {}, 'inside') ?? byWorkType.inside.length,
    outside: readNumber(countsRaw ?? {}, 'outside') ?? byWorkType.outside.length,
  }
}

export function normalizeUsersListResponse(
  data: unknown,
  backendBaseUrl?: string,
  fallbackPage = 1,
  fallbackLimit = 20
): UsersListResult {
  const payload = unwrapDataPayload(data)

  if (!payload) {
    return {
      users: [],
      byWorkType: EMPTY_BY_WORK_TYPE,
      counts: EMPTY_COUNTS,
      page: fallbackPage,
      limit: fallbackLimit,
    }
  }

  const users = normalizeUserRows(
    Array.isArray(payload.users) ? payload.users : [],
    backendBaseUrl
  )

  const byWorkTypeRaw =
    payload.byWorkType && typeof payload.byWorkType === 'object'
      ? (payload.byWorkType as Record<string, unknown>)
      : null

  let byWorkType: UsersAllByWorkType

  if (byWorkTypeRaw) {
    byWorkType = {
      inside: normalizeUserRows(
        Array.isArray(byWorkTypeRaw.inside) ? byWorkTypeRaw.inside : [],
        backendBaseUrl,
        'inside'
      ),
      outside: normalizeUserRows(
        Array.isArray(byWorkTypeRaw.outside) ? byWorkTypeRaw.outside : [],
        backendBaseUrl,
        'outside'
      ),
    }
  } else {
    byWorkType = splitUsersByWorkType(users)
  }

  const counts = readCounts(payload, byWorkType)

  const page = readNumber(payload, 'page', 'currentPage') ?? fallbackPage
  const limit = readNumber(payload, 'limit', 'pageSize') ?? fallbackLimit

  return { users, byWorkType, counts, page, limit }
}

export function formatCommunityUserLabel(fullName: string, employeeId: string): string {
  if (fullName && employeeId) return `${fullName} · ${employeeId}`
  return fullName || employeeId || '—'
}

/** Joriy foydalanuvchini ro‘yxatdan olib tashlash */
export function excludeCurrentUserFromList(
  users: CommunityUserItem[],
  current: CurrentUser | null
): CommunityUserItem[] {
  if (!current) return users
  return users.filter((u) => {
    if (current.id && u.id && current.id === u.id) return false
    if (
      current.employeeId &&
      u.employeeId &&
      current.employeeId === u.employeeId
    ) {
      return false
    }
    return true
  })
}

export function excludeCurrentUserFromResult(
  result: UsersListResult,
  current: CurrentUser | null
): UsersListResult {
  const users = excludeCurrentUserFromList(result.users, current)
  const inside = excludeCurrentUserFromList(result.byWorkType.inside, current)
  const outside = excludeCurrentUserFromList(result.byWorkType.outside, current)

  return {
    ...result,
    users,
    byWorkType: { inside, outside },
    counts: {
      total: users.length || inside.length + outside.length,
      inside: inside.length,
      outside: outside.length,
    },
  }
}

export function createEmptyUsersListResult(
  page = 1,
  limit = 20
): UsersListResult {
  return {
    users: [],
    byWorkType: EMPTY_BY_WORK_TYPE,
    counts: EMPTY_COUNTS,
    page,
    limit,
  }
}
