'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Eski `/home#year-grid` havolalarini rejasi sahifasiga yo‘naltiradi. */
export default function PlannerHashRedirect() {
  const router = useRouter()
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === '#year-grid') {
      router.replace('/home/planner#year-grid')
    }
  }, [router])
  return null
}
