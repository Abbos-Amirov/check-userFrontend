import { redirect } from 'next/navigation'
import PlannerHashRedirect from './PlannerHashRedirect'
import CommunityUsersGrid from '@/components/home/CommunityUsersGrid'
import HomeWelcomeCard from '@/components/home/HomeWelcomeCard'
import {
  getCurrentUser,
  getCurrentUserAvatarSrc,
  requireAppSession,
} from '@/lib/current-user-server'
import { getCommunityUsers } from '@/lib/users-list-server'
import { getLocale, getTranslator } from '@/lib/i18n/server'

/** Bosh sahifa — salom va jamoat foydalanuvchilari (backend). */
export default async function HomePage() {
  const locale = getLocale()
  const t = getTranslator(locale)

  if (!(await requireAppSession())) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()
  const displayName = currentUser?.fullName || t('common.worker')
  const displayId = currentUser?.employeeId || t('common.dash')
  const avatarSrc = getCurrentUserAvatarSrc(currentUser)

  const community = await getCommunityUsers(currentUser, {
    page: 1,
    limit: 20,
  })

  return (
    <>
      <PlannerHashRedirect />
      <div className="home-bgWash relative min-h-screen pb-[100px]">
        <div className="px-5 pb-2 pt-6">
          <HomeWelcomeCard
            greeting={t('home.greeting')}
            displayName={displayName}
            idPrefix={t('common.idPrefix')}
            displayId={displayId}
            avatarSrc={avatarSrc}
          />
        </div>

        <div className="px-5">
          <CommunityUsersGrid
            users={community.users}
            byWorkType={community.byWorkType}
            counts={community.counts}
          />
        </div>
      </div>
    </>
  )
}
