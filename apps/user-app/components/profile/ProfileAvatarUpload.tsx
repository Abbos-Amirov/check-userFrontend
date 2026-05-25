'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/i18n/I18nProvider'

type Props = {
  avatarUrl: string | null
  uploadEnabled: boolean
}

export default function ProfileAvatarUpload({ avatarUrl, uploadEnabled }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPreview(avatarUrl)
  }, [avatarUrl])

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(t('profile.avatarInvalidFile'))
      return
    }

    setError(null)
    setBusy(true)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: fd,
      })
      const data = (await res.json()) as { avatarUrl?: string; error?: string }
      if (!res.ok) {
        throw new Error(data.error || 'fail')
      }
      URL.revokeObjectURL(localUrl)
      setPreview(data.avatarUrl ?? null)
      router.refresh()
    } catch {
      URL.revokeObjectURL(localUrl)
      setPreview(avatarUrl)
      setError(t('common.genericError'))
    } finally {
      setBusy(false)
    }
  }

  return (
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
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-sm font-medium text-white">
              {t('profile.avatarUploading')}
            </div>
          )}
        </div>

        <div className="flex w-full flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,.heic"
            className="sr-only"
            disabled={!uploadEnabled || busy}
            onChange={onChange}
          />
          <button
            type="button"
            disabled={!uploadEnabled || busy}
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-center font-body text-[15px] font-medium text-primary transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t('profile.avatarPick')}
          </button>
          {!uploadEnabled && (
            <p className="text-center text-body-sm text-text-tertiary sm:text-left">
              {t('profile.avatarSupabaseOnly')}
            </p>
          )}
          {error && <p className="text-center text-body-sm text-danger sm:text-left">{error}</p>}
        </div>
      </div>
    </div>
  )
}
