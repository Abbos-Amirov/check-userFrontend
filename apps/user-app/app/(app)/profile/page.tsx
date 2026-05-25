import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createServerClientOptional } from '@/lib/supabase/server'
import { hasApiSession } from '@/lib/auth-session-server'
import {
  getCurrentUser,
  getCurrentUserAvatarSrc,
  requireAppSession,
} from '@/lib/current-user-server'
import LogoutButton from '@/components/auth/LogoutButton'
import PageHeader from '@/components/ui/PageHeader'
import ProfileAvatarUpload from '@/components/profile/ProfileAvatarUpload'
import { getTranslator } from '@/lib/i18n/server'

const ProfileEditForm = dynamic(
  () => import('@/components/profile/ProfileEditForm'),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-3xl border border-border bg-surface shadow-card" />
        <div className="h-56 animate-pulse rounded-3xl border border-border bg-surface shadow-card" />
      </div>
    ),
  }
)

export default async function ProfilePage() {
  const t = getTranslator()

  if (!(await requireAppSession())) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()
  const apiEditEnabled = hasApiSession()
  const supabase = createServerClientOptional()

  let checksTotal: number | null = 0
  let distinctMonths = 0
  let uploadAvatarEnabled = false

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      uploadAvatarEnabled = true

      const { count } = await supabase
        .from('checks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      checksTotal = count

      const { data: monthsData } = await supabase
        .from('checks')
        .select('month')
        .eq('user_id', user.id)
      distinctMonths = new Set(monthsData?.map((m) => m.month) ?? []).size
    }
  }

  const avatarSrc = getCurrentUserAvatarSrc(currentUser)

  return (
    <div className="min-h-screen bg-bg pb-[120px]">
      <PageHeader title={t('profile.title')} />

      <div className="space-y-4 px-5 pt-2">
        {apiEditEnabled ? (
          <ProfileEditForm
            initial={{
              fullName: currentUser?.fullName || '',
              employeeId: currentUser?.employeeId || t('profile.missing'),
              phone: currentUser?.phone || '',
              workType: currentUser?.workType ?? null,
              avatarSrc,
            }}
          />
        ) : (
          <>
            <ProfileAvatarUpload avatarUrl={avatarSrc} uploadEnabled={uploadAvatarEnabled} />

            <div className="rounded-3xl border border-border bg-surface p-5 shadow-card">
              <p className="text-body-sm text-text-secondary">{t('profile.name')}</p>
              <p className="font-display text-xl font-bold text-primary">
                {currentUser?.fullName || t('profile.missing')}
              </p>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-body-md">
                <div className="flex justify-between gap-3">
                  <span className="text-text-secondary">{t('profile.employeeId')}</span>
                  <span className="font-medium">{currentUser?.employeeId || t('profile.missing')}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-text-secondary">{t('profile.phone')}</span>
                  <span className="font-medium">{currentUser?.phone || t('profile.missing')}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <p className="text-body-sm text-text-secondary">{t('profile.checksTotal')}</p>
            <p className="font-display text-2xl font-bold text-primary">{checksTotal ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <p className="text-body-sm text-text-secondary">{t('profile.activeMonths')}</p>
            <p className="font-display text-2xl font-bold text-primary">{distinctMonths}</p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </div>
  )
}
