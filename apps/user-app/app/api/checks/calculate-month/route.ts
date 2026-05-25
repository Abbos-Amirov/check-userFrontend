import { NextRequest, NextResponse } from 'next/server'
import { calculateMonthTotal } from '@/lib/claude'
import {
  CHECKS_API_ONLY_MESSAGE,
  resolveChecksRouteAuth,
} from '@/lib/checks-route-auth'

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

    const body = await request.json()
    const month = body.month as string | undefined
    if (!month) {
      return NextResponse.json({ error: 'Oy ko\'rsatilmagan' }, { status: 400 })
    }

    const { data: checks, error } = await supabase
      .from('checks')
      .select('id, image_url, amount, check_date, store_name')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('status', 'approved')

    if (error) throw error
    if (!checks?.length) {
      return NextResponse.json(
        { error: 'Bu oyda tasdiqlangan chek yo\'q' },
        { status: 404 }
      )
    }

    const imageUrls = checks.map((c) => c.image_url)
    const { results, totalAmount } = await calculateMonthTotal(imageUrls)

    const { error: upsertError } = await supabase.from('monthly_reports').upsert(
      {
        user_id: userId,
        month,
        total_amount: totalAmount,
        check_count: checks.length,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      },
      { onConflict: 'user_id,month' }
    )

    if (upsertError) throw upsertError

    return NextResponse.json({
      totalAmount,
      checkCount: checks.length,
      checks: checks.map((c, i) => ({
        id: c.id,
        amount: results[i]?.amount ?? c.amount,
        date: c.check_date,
        store_name: c.store_name,
      })),
    })
  } catch (error) {
    console.error('Calculate month error:', error)
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 })
  }
}
