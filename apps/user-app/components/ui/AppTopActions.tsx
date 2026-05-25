'use client'

import { usePathname } from 'next/navigation'
import AppSettingsMenu from '@/components/ui/AppSettingsMenu'
import NotificationBell from '@/components/notifications/NotificationBell'

const HIDE_PATHS = new Set(['/login', '/register'])

export default function AppTopActions() {
  const pathname = usePathname()
  const showActions = !HIDE_PATHS.has(pathname)

  if (!showActions) return null

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <AppSettingsMenu />
    </div>
  )
}
