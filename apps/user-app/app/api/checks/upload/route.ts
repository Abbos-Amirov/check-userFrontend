import { NextRequest, NextResponse } from 'next/server'
import { readSingleCheck } from '@/lib/claude'
import {
  CHECKS_API_ONLY_MESSAGE,
  resolveChecksRouteAuth,
} from '@/lib/checks-route-auth'
import { uploadCheckImage } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const month = formData.get('month') as string | null

    if (!file || !month) {
      return NextResponse.json({ error: "Fayl yoki oy ko'rsatilmagan" }, { status: 400 })
    }

    const imageUrl = await uploadCheckImage(file, userId, month)
    const aiResult = await readSingleCheck(imageUrl)

    const safeDate =
      aiResult.date && !Number.isNaN(Date.parse(aiResult.date)) ? aiResult.date : null

    const { data: check, error: dbError } = await supabase
      .from('checks')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        amount: aiResult.amount ?? 0,
        store_name: aiResult.storeName,
        check_date: safeDate,
        month,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({
      checkId: check.id,
      imageUrl,
      aiResult,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 })
  }
}
