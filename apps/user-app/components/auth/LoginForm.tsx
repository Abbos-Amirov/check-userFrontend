'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import PasswordInput from '@/components/auth/PasswordInput'
import { useI18n } from '@/components/i18n/I18nProvider'
import {
  extractApiErrorMessage,
  extractAuthFromResponse,
} from '@/lib/auth-api'
import { persistSession } from '@/lib/auth-session-client'

export default function LoginForm() {
  const { t } = useI18n()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const id = employeeId.trim()
    const pass = password.trim()
    if (!id || !pass) {
      setError(t('auth.errors.requiredLogin'))
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: id, password: pass }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(extractApiErrorMessage(data, t('auth.errors.loginFailed')))
        setLoading(false)
        return
      }

      const auth = extractAuthFromResponse(data)
      if (!auth) {
        setError(t('auth.errors.noToken'))
        setLoading(false)
        return
      }

      await persistSession(auth.token, auth.user, t('auth.errors.sessionFailed'))
      router.push('/home')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errors.network'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form noValidate onSubmit={handleLogin} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-label text-text-secondary">
          {t('auth.employeeId')}
        </label>
        <input
          type="text"
          autoComplete="username"
          placeholder={t('auth.placeholderId')}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="h-14 w-full rounded-2xl border border-border bg-surface px-4 font-body text-[15px] text-primary placeholder:text-[#C4C2BC] focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-label text-text-secondary">
          {t('auth.password')}
        </label>
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      {error && <p className="text-center text-body-sm text-danger">{error}</p>}
      <Button type="submit" variant="primary" loading={loading}>
        {t('auth.loginSubmit')}
      </Button>
      <p className="text-center text-body-sm text-text-secondary">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="font-medium text-accent">
          {t('auth.registerLink')}
        </Link>
      </p>
    </form>
  )
}
