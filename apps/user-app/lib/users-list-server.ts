import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import type { WorkType } from '@/lib/auth-signup'
import type { CurrentUser } from '@/lib/current-user'
import {
  createEmptyUsersListResult,
  excludeCurrentUserFromResult,
  normalizeUsersListResponse,
  type UsersListResult,
} from '@/lib/users-list'

export type FetchUsersAllParams = {
  page?: number
  limit?: number
  workType?: WorkType
}

/** Backend `GET /api/users/all` */
export async function fetchBackendUsersAll(
  token: string,
  params: FetchUsersAllParams = {}
): Promise<UsersListResult | null> {
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (params.workType) {
    qs.set('workType', params.workType)
  }

  const url = `${getBackendBaseUrl()}/api/users/all?${qs.toString()}`

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
    return normalizeUsersListResponse(payload, getBackendBaseUrl(), page, limit)
  } catch {
    return null
  }
}

export async function getCommunityUsers(
  currentUser: CurrentUser | null,
  params: FetchUsersAllParams = {}
): Promise<UsersListResult> {
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  const token = getApiAuthToken()
  if (!token) {
    return createEmptyUsersListResult(page, limit)
  }

  const result = await fetchBackendUsersAll(token, { page, limit, workType: params.workType })

  if (!result) {
    return createEmptyUsersListResult(page, limit)
  }

  return excludeCurrentUserFromResult(result, currentUser)
}
