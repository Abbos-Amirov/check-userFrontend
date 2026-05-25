import { getApiAuthToken } from '@/lib/auth-session-server'
import { createServerClientOptional } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ChecksRouteAuth =
  | { mode: 'supabase'; supabase: SupabaseClient; userId: string }
  | { mode: 'api'; supabase: null }
  | { mode: 'none'; supabase: null }

/** Cheklar API: Supabase yoki backend JWT cookie */
export async function resolveChecksRouteAuth(): Promise<ChecksRouteAuth> {
  const supabase = createServerClientOptional()

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      return { mode: 'supabase', supabase, userId: user.id }
    }
  }

  if (getApiAuthToken()) {
    return { mode: 'api', supabase: null }
  }

  return { mode: 'none', supabase: null }
}

export const CHECKS_API_ONLY_MESSAGE =
  'Cheklar hozircha Supabase bilan saqlanadi. Backend cheklar API ulanganida ishlaydi.'
