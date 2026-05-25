'use client'

import { useChecks } from '@/hooks/useChecks'

/** Oy kaliti: `2025-05` */
export function useMonth(monthKey: string | undefined) {
  return useChecks(monthKey)
}
