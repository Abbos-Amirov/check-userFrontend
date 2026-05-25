'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import PasswordInput from '@/components/auth/PasswordInput'
import RegisterAvatarPicker from '@/components/auth/RegisterAvatarPicker'
import { useI18n } from '@/components/i18n/I18nProvider'
import type { WorkType } from '@/lib/auth-signup'
import { SIGNUP_AVATAR_MAX_BYTES } from '@/lib/auth-signup'
import {
  extractApiErrorMessage,
  extractAuthFromResponse,
} from '@/lib/auth-api'
import { persistSession } from '@/lib/auth-session-client'

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked ? 'border-white bg-white' : 'border-current bg-transparent opacity-70'
      }`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6l2.5 2.5 4.5-5"
            stroke="#1C1C2E"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}

function WorkTypeOption({
  active,
  label,
  onSelect,
}: {
  active: boolean
  label: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border px-3 font-body text-[14px] font-semibold transition-all active:scale-[0.98] ${
        active
          ? 'border-primary bg-primary text-white shadow-[0_4px_14px_rgba(28,28,46,0.2)]'
          : 'border-border bg-surface text-primary hover:border-primary/40 hover:bg-surface-2'
      }`}
    >
      <CheckIcon checked={active} />
      <span className="text-left leading-tight">{label}</span>
    </button>
  )
}

export default function RegisterForm() {
  const { t } = useI18n()
  const [fullName, setFullName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [workType, setWorkType] = useState<WorkType | null>(null)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const name = fullName.trim()
    const id = employeeId.trim()
    const tel = phone.trim()
    const pass = password.trim()

    if (!name || !id || !tel || !pass || !workType) {
      setError(t('auth.errors.fillAll'))
      setLoading(false)
      return
    }

    if (avatar && avatar.size > SIGNUP_AVATAR_MAX_BYTES) {
      setError(t('auth.avatarTooLarge'))
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('fullName', name)
      formData.append('employeeId', id)
      formData.append('phone', tel)
      formData.append('password', pass)
      formData.append('workType', workType)
      if (avatar) {
        formData.append('avatar', avatar)
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(extractApiErrorMessage(data, t('auth.errors.registerFailed')))
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
    <form noValidate onSubmit={handleRegister} className="space-y-3">
      <RegisterAvatarPicker file={avatar} onChange={setAvatar} />

      <div>
        <label className="mb-1.5 block text-label text-text-secondary">
          {t('auth.fullName')}
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-14 w-full rounded-2xl border border-border bg-surface px-4 font-body text-[15px] text-primary focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-label text-text-secondary">
          {t('auth.employeeId')}
        </label>
        <input
          type="text"
          placeholder={t('auth.placeholderId')}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="h-14 w-full rounded-2xl border border-border bg-surface px-4 font-body text-[15px] text-primary focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-label text-text-secondary">
          {t('auth.phone')}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-14 w-full rounded-2xl border border-border bg-surface px-4 font-body text-[15px] text-primary focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-label text-text-secondary">
          {t('auth.password')}
        </label>
        <PasswordInput
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
      </div>
      <div>
        <span className="mb-1.5 block text-label text-text-secondary">{t('auth.workType')}</span>
        <div className="flex gap-2.5">
          <WorkTypeOption
            active={workType === 'inside'}
            label={t('auth.workTypeInside')}
            onSelect={() => setWorkType('inside')}
          />
          <WorkTypeOption
            active={workType === 'outside'}
            label={t('auth.workTypeOutside')}
            onSelect={() => setWorkType('outside')}
          />
        </div>
      </div>
      {error && <p className="text-center text-body-sm text-danger">{error}</p>}
      <Button type="submit" variant="primary" loading={loading}>
        {t('auth.registerSubmit')}
      </Button>
      <p className="text-center text-body-sm text-text-secondary">
        {t('auth.hasAccount')}{' '}
        <Link href="/login" className="font-medium text-accent">
          {t('auth.loginLink')}
        </Link>
      </p>
    </form>
  )
}
