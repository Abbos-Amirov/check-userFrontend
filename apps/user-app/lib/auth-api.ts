/** Backend API (masalan Express) bazaviy URL */
export function getAuthApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000'
  )
}

export const AUTH_ROUTES = {
  signup: '/api/auth/signup',
  login: '/api/auth/login',
  logout: '/api/auth/logout',
} as const

export function extractAuthFromResponse(data: unknown): {
  token: string
  user?: unknown
} | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>

  const nested =
    d.data && typeof d.data === 'object' ? (d.data as Record<string, unknown>) : null

  const token =
    (typeof d.token === 'string' && d.token) ||
    (typeof d.accessToken === 'string' && d.accessToken) ||
    (typeof d.access_token === 'string' && d.access_token) ||
    (nested && typeof nested.token === 'string' && nested.token) ||
    (nested && typeof nested.accessToken === 'string' && nested.accessToken)

  if (!token) return null

  const user =
    d.user ??
    (nested && 'user' in nested ? nested.user : undefined) ??
    undefined

  return { token, user }
}

export function extractApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback
  const d = data as Record<string, unknown>
  const msg =
    (typeof d.message === 'string' && d.message) ||
    (typeof d.error === 'string' && d.error) ||
    (typeof d.msg === 'string' && d.msg)
  return msg || fallback
}
