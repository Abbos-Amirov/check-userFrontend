import { createServerClient } from '@/lib/supabase/server'

export async function uploadCheckImage(
  file: File,
  userId: string,
  month: string
): Promise<string> {
  const supabase = createServerClient()
  const checkId = crypto.randomUUID()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `checks/${userId}/${month}/${checkId}.${ext}`

  const buffer = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from('check-images')
    .upload(path, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from('check-images').getPublicUrl(path)

  return publicUrl
}

export function publicUrlToStoragePath(publicUrl: string): string | null {
  const marker = '/check-images/'
  const i = publicUrl.indexOf(marker)
  if (i === -1) return null
  return publicUrl.slice(i + marker.length)
}

export async function deleteCheckImageByPublicUrl(publicUrl: string) {
  const path = publicUrlToStoragePath(publicUrl)
  if (!path) return
  const supabase = createServerClient()
  const { error } = await supabase.storage.from('check-images').remove([path])
  if (error) throw error
}

const AVATARS_BUCKET = 'avatars'
const AVATAR_OBJECT_PATH = 'avatar'

export async function uploadUserAvatar(file: File, userId: string): Promise<string> {
  const supabase = createServerClient()
  const path = `${userId}/${AVATAR_OBJECT_PATH}`
  const buffer = await file.arrayBuffer()
  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  })
  if (error) throw error
  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path)
  return publicUrl
}
