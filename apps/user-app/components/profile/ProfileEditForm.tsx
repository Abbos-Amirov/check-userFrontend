'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PasswordInput from '@/components/auth/PasswordInput'
import Button from '@/components/ui/Button'
import { useI18n } from '@/components/i18n/I18nProvider'
import { extractApiErrorMessage } from '@/lib/auth-api'
import type { WorkType } from '@/lib/auth-signup'
import { SIGNUP_AVATAR_ACCEPT, SIGNUP_AVATAR_MAX_BYTES } from '@/lib/auth-signup'
import { DEFAULT_PROFILE_AVATAR_SRC } from '@/lib/profile-defaults'
import type { ProfileEditInitial } from '@/lib/profile-edit'

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

const inputClass =
  'h-14 w-full rounded-2xl border border-border bg-surface px-4 font-body text-[15px] text-primary placeholder:text-[#C4C2BC] focus:border-primary focus:outline-none'

export default function ProfileEditForm({ initial }: { initial: ProfileEditInitial }) {
  const { t } = useI18n()
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(initial.fullName)
  const [phone, setPhone] = useState(initial.phone)
  const [workType, setWorkType] = useState<WorkType | null>(initial.workType)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [preview, setPreview] = useState(initial.avatarSrc)
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setPreview(initial.avatarSrc)
  }, [initial.avatarSrc])

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(t('profile.avatarInvalidFile'))
      return
    }

    if (file.size > SIGNUP_AVATAR_MAX_BYTES) {
      setError(t('auth.avatarTooLarge'))
      return
    }

    setError('')
    setRemoveAvatar(false)
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function onRemoveAvatar() {
    setAvatarFile(null)
    setRemoveAvatar(true)
    setPreview(DEFAULT_PROFILE_AVATAR_SRC)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const name = fullName.trim()
    const tel = phone.trim()
    const newPass = password.trim()
    const curPass = currentPassword.trim()

    if (!name || !tel || !workType) {
      setError(t('auth.errors.fillAll'))
      setLoading(false)
      return
    }

    if (newPass) {
      if (!curPass) {
        setError(t('profile.currentPasswordRequired'))
        setLoading(false)
        return
      }
      if (newPass.length < 6) {
        setError(t('profile.passwordMin'))
        setLoading(false)
        return
      }
    }

    try {
      const fd = new FormData()
      fd.append('fullName', name)
      fd.append('phone', tel)
      fd.append('workType', workType)

      if (newPass) {
        fd.append('currentPassword', curPass)
        fd.append('password', newPass)
      }

      if (avatarFile) {
        fd.append('avatar', avatarFile)
      } else if (removeAvatar) {
        fd.append('removeAvatar', 'true')
      }

      const res = await fetch('/api/users/me', { method: 'PATCH', body: fd })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, t('profile.updateFailed')))
      }

      setCurrentPassword('')
      setPassword('')
      setAvatarFile(null)
      setRemoveAvatar(false)
      setSuccess(t('profile.saved'))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <p className="mb-3 text-body-sm font-medium text-text-secondary">{t('profile.avatarLabel')}</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-border bg-surface-2">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl text-text-tertiary">
                👤
              </div>
            )}
          </div>
          <div className="flex w-full flex-1 flex-col gap-2">
            <input
              ref={avatarInputRef}
              type="file"
              accept={SIGNUP_AVATAR_ACCEPT}
              className="sr-only"
              onChange={onPickAvatar}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-center font-body text-[15px] font-medium text-primary transition-colors hover:bg-surface-2"
            >
              {t('profile.avatarPick')}
            </button>
            {(avatarFile || (initial.avatarSrc !== DEFAULT_PROFILE_AVATAR_SRC && !removeAvatar)) && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="text-center font-body text-[13px] font-medium text-text-tertiary transition-colors hover:text-danger"
              >
                {t('profile.avatarRemove')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-card space-y-3">
        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('auth.fullName')}</label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('profile.employeeId')}</label>
          <input className={`${inputClass} bg-surface-2 text-text-secondary`} value={initial.employeeId} readOnly />
          <p className="mt-1 text-[12px] text-text-tertiary">{t('profile.employeeIdHint')}</p>
        </div>

        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('auth.phone')}</label>
          <input
            className={inputClass}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        <div>
          <p className="mb-2 text-label text-text-secondary">{t('auth.workType')}</p>
          <div className="flex gap-2">
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
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-card space-y-3">
        <p className="text-body-sm font-medium text-text-secondary">{t('profile.passwordSection')}</p>
        <p className="text-[12px] text-text-tertiary">{t('profile.passwordHint')}</p>

        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('profile.currentPassword')}</label>
          <PasswordInput
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="mb-1 block text-label text-text-secondary">{t('profile.newPassword')}</label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
        </div>
      </div>

      {error && <p className="text-center text-body-sm text-danger">{error}</p>}
      {success && <p className="text-center text-body-sm text-accent">{success}</p>}

      <Button type="submit" loading={loading} className="w-full">
        {loading ? t('profile.saving') : t('profile.save')}
      </Button>
    </form>
  )
}
