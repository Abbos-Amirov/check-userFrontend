import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/auth-api-server'
import { getApiAuthToken } from '@/lib/auth-session-server'
import { normalizeMyImagesResponse } from '@/lib/check-feed'
import { resolveChecksRouteAuth } from '@/lib/checks-route-auth'
import { DEFAULT_PROFILE_AVATAR_SRC } from '@/lib/profile-defaults'

export const dynamic = 'force-dynamic'

/** Backend `GET /api/checks/my-images?month=YYYY-MM` */
export async function GET(request: NextRequest) {
  const auth = await resolveChecksRouteAuth()
  if (auth.mode === 'none') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const month = request.nextUrl.searchParams.get('month')
  if (!month) {
    return NextResponse.json({ error: 'month parametri kerak' }, { status: 400 })
  }

  if (auth.mode === 'api') {
    const token = getApiAuthToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = `${getBackendBaseUrl()}/api/checks/my-images?month=${encodeURIComponent(month)}`

    try {
      const upstream = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      const text = await upstream.text()
      let payload: unknown
      try {
        payload = text ? JSON.parse(text) : {}
      } catch {
        payload = { message: text }
      }

      if (!upstream.ok) {
        return NextResponse.json(payload, { status: upstream.status })
      }

      const images = normalizeMyImagesResponse(payload, {
        month,
        avatarSrc: DEFAULT_PROFILE_AVATAR_SRC,
        backendBaseUrl: getBackendBaseUrl(),
      })

      return NextResponse.json({ ...((payload as object) ?? {}), images })
    } catch {
      return NextResponse.json(
        { error: `Backend ga ulanib bo‘lmadi. URL: ${url}` },
        { status: 502 }
      )
    }
  }

  const { data: rows, error } = await auth.supabase
    .from('checks')
    .select('id, image_url, month, store_name, amount')
    .eq('user_id', auth.userId)
    .eq('month', month)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GET checks/my-images:', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }

  const images = normalizeMyImagesResponse(
    { images: rows ?? [] },
    { month, avatarSrc: DEFAULT_PROFILE_AVATAR_SRC }
  )

  return NextResponse.json({ images })
}
