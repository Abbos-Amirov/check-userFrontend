import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { uploadUserAvatar } from '@/lib/storage'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Too large' }, { status: 400 })
    }

    const imageUrl = await uploadUserAvatar(file, user.id)

    const { error: dbError } = await supabase
      .from('users')
      .update({ avatar_url: imageUrl })
      .eq('id', user.id)

    if (dbError) throw dbError

    return NextResponse.json({ avatarUrl: imageUrl })
  } catch (error) {
    console.error('Avatar upload:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
