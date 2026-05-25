import { NextResponse } from 'next/server'
import { deleteCheckImageByPublicUrl } from '@/lib/storage'
import {
  CHECKS_API_ONLY_MESSAGE,
  resolveChecksRouteAuth,
} from '@/lib/checks-route-auth'

export const dynamic = 'force-dynamic'

interface Params {
  params: { id: string }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const auth = await resolveChecksRouteAuth()
    if (auth.mode === 'none') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (auth.mode === 'api') {
      return NextResponse.json({ error: CHECKS_API_ONLY_MESSAGE }, { status: 503 })
    }

    const supabase = auth.supabase
    const userId = auth.userId

    const { data: check } = await supabase
      .from('checks')
      .select('id, status, image_url')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (!check) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
    }

    if (check.status !== 'pending') {
      return NextResponse.json(
        { error: "Faqat kutilayotgan chek o'chiriladi" },
        { status: 400 }
      )
    }

    try {
      await deleteCheckImageByPublicUrl(check.image_url)
    } catch (storageErr) {
      console.warn('Storage delete:', storageErr)
    }

    const { error } = await supabase.from('checks').delete().eq('id', check.id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE check:', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}
