import { redirect } from 'next/navigation'
import YearMonthSection from '@/components/month/YearMonthSection'
import PlannerCurrentMonthOverview from '@/components/planner/PlannerCurrentMonthOverview'
import PlannerPageHeader from '@/components/planner/PlannerPageHeader'
import { createServerClientOptional } from '@/lib/supabase/server'
import { requireAppSession } from '@/lib/current-user-server'
import type { MonthlyReport } from '@/types'
import { getDictionary, getLocale, getTranslator } from '@/lib/i18n/server'
import { HOME_YEAR_RANGE_END } from '@/lib/year-range'
import { getYearMonthStatuses } from '@/lib/year-month-status-server'

export default async function HomePlannerPage() {
  const locale = getLocale()
  const t = getTranslator(locale)
  const dictionary = getDictionary(locale)
  const supabase = createServerClientOptional()

  if (!(await requireAppSession())) {
    redirect('/login')
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthNum = now.getMonth() + 1

  let reports: MonthlyReport[] = []
  let checkCounts: { month: string; id: string }[] = []

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const monthMin = `${currentYear}-01`
      const monthMax = `${HOME_YEAR_RANGE_END}-12`

      const { data: r } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('user_id', user.id)
        .gte('month', monthMin)
        .lte('month', monthMax)
      reports = r ?? []

      const { data: cc } = await supabase
        .from('checks')
        .select('month, id')
        .eq('user_id', user.id)
        .gte('month', monthMin)
        .lte('month', monthMax)
      checkCounts = cc ?? []
    }
  }

  const monthTitle = `${dictionary.months.full[currentMonthNum - 1] ?? ''} ${currentYear}`
  const initialStatuses = await getYearMonthStatuses(currentYear, reports, checkCounts)

  return (
    <div className="planner-bgWash relative min-h-screen pb-[100px]">
      <PlannerPageHeader
        title={t('home.plannerSectionTitle')}
        subtitle={t('home.yearSectionLabel')}
      />

      <div className="px-5">
        <PlannerCurrentMonthOverview
          monthTitle={monthTitle}
          monthNumber={currentMonthNum}
        />

        <h2 id="year-heading" className="sr-only">
          {t('home.yearSectionLabel')}
        </h2>
        <YearMonthSection
          tone="prestige"
          calendarYear={currentYear}
          initialYear={currentYear}
          reports={reports}
          checkCounts={checkCounts}
          initialStatuses={initialStatuses}
        />
      </div>
    </div>
  )
}
