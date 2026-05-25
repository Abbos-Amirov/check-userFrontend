'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

export function useLogout() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const logout = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch {
        /* Supabase yo‘q */
      }
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }, [loading, router])

  return { logout, loading }
}
