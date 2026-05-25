import { getBackendBaseUrl } from '@/lib/auth-api-server'
import {
  getApiAuthToken,
  getApiAuthUser,
  hasApiSession,
} from '@/lib/auth-session-server'
import {
  normalizeCurrentUser,
  normalizeSupabaseUserRow,
  resolveUserAvatarUrl,
  type CurrentUser,
} from '@/lib/current-user'
import { DEFAULT_PROFILE_AVATAR_SRC } from '@/lib/profile-defaults'
import { createServerClientOptional } from '@/lib/supabase/server'

export type { CurrentUser }

/** JWT bilan backend `GET /api/users/me` */
export async function fetchBackendCurrentUser(
  token: string
): Promise<CurrentUser | null> {
  const url = `${getBackendBaseUrl()}/api/users/me`

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) return null

    const payload = (await res.json()) as unknown
    return normalizeCurrentUser(payload)
  } catch {
    return null
  }
}

/**
 * Joriy foydalanuvchi: avval backend `/me`, keyin Supabase profil, oxirida cookie.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = getApiAuthToken()
  if (token) {
    const fromBackend = await fetchBackendCurrentUser(token)
    if (fromBackend) return fromBackend
  }

  const supabase = createServerClientOptional()
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: row } = await supabase
        .from('users')
        .select('id, full_name, employee_id, phone, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (row) return normalizeSupabaseUserRow(row)
    }
  }

  const cookieUser = getApiAuthUser()
  if (cookieUser) return normalizeCurrentUser(cookieUser)

  return null
}

export function getCurrentUserAvatarSrc(user: CurrentUser | null): string {
  const backendBase = getBackendBaseUrl()
  const resolved =
    resolveUserAvatarUrl(user?.avatarUrl, backendBase) ??
    user?.avatarUrl?.trim() ??
    null
  return resolved || DEFAULT_PROFILE_AVATAR_SRC
}

export async function requireAppSession(): Promise<boolean> {
  if (hasApiSession()) return true
  const supabase = createServerClientOptional()
  if (!supabase) return false
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return Boolean(user)
}
