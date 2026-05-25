import { extractApiErrorMessage } from '@/lib/auth-api'

/** JWT ni cookie ga yozadi, keyin `/api/users/me` dan yangilangan profilni saqlaydi */
export async function persistSession(
  token: string,
  user?: unknown,
  sessionFailed?: string
) {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, user }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(extractApiErrorMessage(data, sessionFailed ?? 'Session'))
  }

  try {
    const meRes = await fetch('/api/users/me')
    if (meRes.ok) {
      const mePayload = await meRes.json()
      const freshUser =
        mePayload &&
        typeof mePayload === 'object' &&
        'user' in mePayload &&
        (mePayload as { user?: unknown }).user != null
          ? (mePayload as { user: unknown }).user
          : mePayload

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, user: freshUser }),
      })
    }
  } catch {
    /* /me ixtiyoriy — login/signup token bilan davom etadi */
  }
}
