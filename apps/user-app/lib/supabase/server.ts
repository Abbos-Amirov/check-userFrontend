import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return Boolean(url && key)
}

function createWithCookieStore(
  cookieStore: ReturnType<typeof cookies>
): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSSRClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          /* Server Component da cookie yozish mumkin emas */
        }
      },
    },
  })
}

/** Supabase .env bo‘lmasa null (API-login uchun home ishlayveradi) */
export function createServerClientOptional(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  return createWithCookieStore(cookies())
}

/** API route va majburiy DB — .env yo‘q bo‘lsa xato */
export function createServerClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY kerak'
    )
  }
  return createWithCookieStore(cookies())
}
