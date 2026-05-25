import { redirect } from 'next/navigation'
import BottomNav from '@/components/ui/BottomNav'
import { CurrentUserProvider } from '@/components/providers/CurrentUserProvider'
import { getCurrentUser, requireAppSession } from '@/lib/current-user-server'

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await requireAppSession())) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()

  return (
    <CurrentUserProvider user={currentUser}>
      {children}
      <BottomNav />
    </CurrentUserProvider>
  )
}
