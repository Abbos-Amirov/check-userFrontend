import { redirect } from 'next/navigation'
import { createServerClientOptional } from '@/lib/supabase/server'
import { hasApiSession } from '@/lib/auth-session-server'

export default async function RootPage() {
  if (hasApiSession()) {
    redirect('/home')
  }

  const supabase = createServerClientOptional()
  if (!supabase) {
    redirect('/login')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  redirect(user ? '/home' : '/login')
}
