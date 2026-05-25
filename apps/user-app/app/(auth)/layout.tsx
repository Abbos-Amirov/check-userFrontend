import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hasApiSession } from '@/lib/auth-session-server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (hasApiSession()) {
    redirect('/home')
  }

  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) redirect('/home')
  } catch {
    /* env yo'q — login sahifasiga ruxsat */
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-bg px-5 py-12">{children}</div>
  )
}
