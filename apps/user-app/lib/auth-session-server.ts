import { cookies } from 'next/headers'

export const AUTH_TOKEN_COOKIE = 'auth_token'
/** Session route bilan bir xil nom */
export const AUTH_USER_COOKIE = 'auth_user'

/** Server komponentlarda API login sessiyasini tekshirish */
export function getApiAuthToken(): string | undefined {
  return cookies().get(AUTH_TOKEN_COOKIE)?.value
}

export function hasApiSession(): boolean {
  return Boolean(getApiAuthToken())
}

/** Login/signup dan keyin cookie ga yozilgan profil (ixtiyoriy) */
export function getApiAuthUser(): Record<string, unknown> | null {
  const raw = cookies().get(AUTH_USER_COOKIE)?.value
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as unknown
    if (typeof v === 'object' && v !== null) return v as Record<string, unknown>
    return null
  } catch {
    return null
  }
}
