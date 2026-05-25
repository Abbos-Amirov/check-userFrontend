'use client'

import Button from '@/components/ui/Button'
import { useI18n } from '@/components/i18n/I18nProvider'
import { useLogout } from '@/components/auth/useLogout'

export default function LogoutButton() {
  const { t } = useI18n()
  const { logout, loading } = useLogout()

  return (
    <Button variant="secondary" onClick={() => void logout()} loading={loading}>
      {t('auth.logout')}
    </Button>
  )
}
