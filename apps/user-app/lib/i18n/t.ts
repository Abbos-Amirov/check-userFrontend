import type { Dictionary } from '@/lib/i18n/dictionary'

export function createTranslator(dict: Dictionary) {
  return function t(
    key: string,
    vars?: Record<string, string | number>
  ): string {
    const parts = key.split('.')
    let cur: unknown = dict as unknown
    for (const p of parts) {
      cur = (cur as Record<string, unknown>)?.[p]
    }
    let s = typeof cur === 'string' ? cur : key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{{${k}}}`, String(v))
      }
    }
    return s
  }
}

export type Translator = ReturnType<typeof createTranslator>
