'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { useI18n } from '@/components/i18n/I18nProvider'

export default function DeleteCheckButton({ checkId }: { checkId: string }) {
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (!confirm(t('check.confirmDelete'))) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/checks/${checkId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('common.genericError'))
      router.back()
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button variant="danger" onClick={handleDelete} loading={loading}>
        {t('check.delete')}
      </Button>
      {error && <p className="mt-2 text-body-sm text-danger">{error}</p>}
    </div>
  )
}
