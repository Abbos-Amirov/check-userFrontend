'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import { SIGNUP_AVATAR_ACCEPT } from '@/lib/auth-signup'

type Props = {
  file: File | null
  onChange: (file: File | null) => void
}

export default function RegisterAvatarPicker({ file, onChange }: Props) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return

    if (!picked.type.startsWith('image/')) {
      setError(t('auth.avatarInvalidFile'))
      return
    }

    setError(null)
    onChange(picked)
  }

  function onRemove() {
    setError(null)
    onChange(null)
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="text-label text-text-secondary">{t('auth.avatarLabel')}</p>
        <span className="text-[11px] font-medium text-text-tertiary">{t('auth.avatarOptional')}</span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-border bg-surface-2">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-text-tertiary">
              👤
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={SIGNUP_AVATAR_ACCEPT}
            className="sr-only"
            onChange={onPick}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl border border-border bg-bg px-4 py-2.5 text-center font-body text-[14px] font-medium text-primary transition-colors hover:bg-surface-2 active:scale-[0.99]"
          >
            {t('auth.avatarPick')}
          </button>
          {file && (
            <button
              type="button"
              onClick={onRemove}
              className="text-center font-body text-[13px] font-medium text-text-tertiary transition-colors hover:text-danger"
            >
              {t('auth.avatarRemove')}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-body-sm text-danger">{error}</p>}
    </div>
  )
}
