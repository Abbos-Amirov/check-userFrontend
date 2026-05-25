'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Check, MonthSummary } from '@/types'

export function useChecks(month: string | undefined) {
  const [checks, setChecks] = useState<Check[]>([])
  const [summary, setSummary] = useState<MonthSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!month) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/checks/my?month=${encodeURIComponent(month)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Xatolik')
      setChecks(data.checks ?? [])
      setSummary(data.monthSummary ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xatolik')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { checks, summary, loading, error, refresh }
}
