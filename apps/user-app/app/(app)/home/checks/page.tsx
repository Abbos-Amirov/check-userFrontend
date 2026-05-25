import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import ChecksPageHeader from '@/components/checks/ChecksPageHeader'
import { requireAppSession } from '@/lib/current-user-server'
import { getTranslator } from '@/lib/i18n/server'

const ChecksMonthGallery = dynamic(
  () => import('@/components/checks/ChecksMonthGallery'),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-[28px] border border-planner-line/55 bg-surface/95" />
        <div className="rounded-[28px] border border-planner-line/45 bg-surface/75 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] animate-pulse rounded-[24px] bg-planner-cream/70" />
            <div className="aspect-[3/4] animate-pulse rounded-[24px] bg-planner-cream/70" />
          </div>
        </div>
      </div>
    ),
  }
)

/** Cheklarim — oy bo‘yicha filtr, backend `GET /api/checks/my-images`. */
export default async function ChecksPage() {
  const t = getTranslator()

  if (!(await requireAppSession())) {
    redirect('/login')
  }

  const calendarYear = new Date().getFullYear()

  return (
    <div className="checks-bgWash relative min-h-screen pb-[100px]">
      <ChecksPageHeader title={t('nav.checks')} subtitle={t('home.checksMonthFilter')} />
      <div className="px-5">
        <ChecksMonthGallery calendarYear={calendarYear} />
      </div>
    </div>
  )
}
