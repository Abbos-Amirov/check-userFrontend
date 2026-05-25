import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { createServerClientOptional } from '@/lib/supabase/server'
import { hasApiSession } from '@/lib/auth-session-server'
import { formatMoney } from '@/lib/i18n/format'
import { getDictionary, getLocale, getTranslator } from '@/lib/i18n/server'
import DeleteCheckButton from '@/components/check/DeleteCheckButton'

interface Props {
  params: { id: string }
}

export default async function CheckDetailPage({ params }: Props) {
  const { id } = params
  const locale = getLocale()
  const t = getTranslator(locale)
  const dict = getDictionary(locale)

  const supabase = createServerClientOptional()
  if (!supabase && !hasApiSession()) {
    redirect('/login')
  }

  if (!supabase) {
    redirect('/home')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: check } = await supabase.from('checks').select('*').eq('id', id).single()

  if (!check) notFound()

  const isOwner = check.user_id === user.id

  const { data: submitter } =
    !isOwner && check.user_id
      ? await supabase
          .from('users')
          .select('full_name, employee_id')
          .eq('id', check.user_id)
          .single()
      : { data: null }

  const badgeStatus =
    check.status === 'approved'
      ? 'approved'
      : check.status === 'rejected'
        ? 'rejected'
        : 'pending'

  const dash = dict.common.dash

  return (
    <div className="min-h-screen bg-bg pb-[120px]">
      <PageHeader title={t('check.title')} showBack />

      <div className="space-y-4 px-5 pt-2">
        {!isOwner && (
          <div className="rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3 text-body-sm text-primary">
            <p>{t('check.viewOnlyNote')}</p>
            {submitter && (
              <p className="mt-2 font-medium">
                {t('check.submittedBy')}: {submitter.full_name}{' '}
                <span className="font-normal text-text-secondary">
                  ({submitter.employee_id})
                </span>
              </p>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={check.image_url}
            alt={t('check.altImage')}
            className="max-h-[420px] w-full bg-surface-2 object-contain"
          />
        </div>

        <div className="rounded-3xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-body-sm text-text-secondary">{t('check.amount')}</p>
              <p className="font-display text-2xl font-bold text-primary">
                {formatMoney(Number(check.amount), locale, dict.currencySuffix)}
              </p>
            </div>
            <Badge status={badgeStatus} />
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-3 text-body-md">
            <div className="flex justify-between gap-2">
              <span className="text-text-secondary">{t('check.date')}</span>
              <span className="font-medium text-primary">{check.check_date ?? dash}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-text-secondary">{t('check.store')}</span>
              <span className="truncate font-medium text-primary">
                {check.store_name ?? dash}
              </span>
            </div>
            {isOwner && check.admin_note && (
              <div className="rounded-xl bg-surface-2 p-3 text-body-sm text-text-secondary">
                <span className="font-medium text-primary">{t('check.adminNote')} </span>
                {check.admin_note}
              </div>
            )}
          </div>
        </div>

        {isOwner && check.status === 'pending' && <DeleteCheckButton checkId={check.id} />}

        {isOwner ? (
          <Link
            href={`/month/${check.month.split('-')[0]}/${Number(check.month.split('-')[1])}`}
            className="block text-center text-body-sm text-accent"
          >
            {t('check.backToMonth')}
          </Link>
        ) : (
          <Link href="/home" className="block text-center text-body-sm text-accent">
            {t('check.backToFeed')}
          </Link>
        )}
      </div>
    </div>
  )
}
