'use client'

import { useI18n } from '@/components/i18n/I18nProvider'
import type { WorkType } from '@/lib/auth-signup'
import {
  type CommunityUserItem,
  type UsersAllByWorkType,
  type UsersAllCounts,
} from '@/lib/users-list'

function WorkTypeSectionIcon({ workType }: { workType: WorkType }) {
  if (workType === 'inside') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s8-4.5 8-12V5l-8-3-8 3v5c0 7.5 8 12 8 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CommunityUserCard({
  user,
  index,
  workType,
}: {
  user: CommunityUserItem
  index: number
  workType: WorkType
}) {
  return (
    <article
      style={{ animationDelay: `${index * 70}ms` }}
      className={`home-peer-card group relative overflow-hidden rounded-[22px] border bg-surface shadow-planner-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-planner-month-current active:scale-[0.98] ${
        workType === 'inside'
          ? 'border-planner-gold/25 hover:border-planner-gold/45'
          : 'border-accent/15 hover:border-accent/30'
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r ${
          workType === 'inside'
            ? 'from-transparent via-planner-gold/70 to-transparent'
            : 'from-transparent via-accent/50 to-transparent'
        }`}
      />

      <div className="relative aspect-[2/3] w-full overflow-hidden bg-planner-cream/40">
        <img
          src={user.avatarSrc}
          alt=""
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="px-3 py-3">
        <p className="line-clamp-2 font-display text-[14px] font-bold leading-tight tracking-[-0.02em] text-planner-ink">
          {user.fullName}
        </p>
        {user.employeeId && (
          <span
            className={`mt-1.5 inline-flex max-w-full items-center rounded-lg border px-2 py-0.5 font-display text-[11px] font-bold tabular-nums ${
              workType === 'inside'
                ? 'border-planner-gold/35 bg-planner-gold/10 text-planner-gold-dim'
                : 'border-accent/25 bg-accent/10 text-accent'
            }`}
          >
            {user.employeeId}
          </span>
        )}
      </div>
    </article>
  )
}

function UsersGrid({
  users,
  workType,
}: {
  users: CommunityUserItem[]
  workType: WorkType
}) {
  const { t } = useI18n()

  if (users.length === 0) {
    return (
      <div className="home-community-empty flex flex-col items-center justify-center rounded-[20px] border border-dashed border-planner-line/60 bg-planner-cream/25 px-4 py-8 text-center">
        <span className="mb-2 text-2xl opacity-40" aria-hidden>
          👤
        </span>
        <p className="text-[13px] font-medium text-planner-fog">{t('home.communityUsersEmpty')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
      {users.map((user, i) => (
        <CommunityUserCard key={user.id} index={i} user={user} workType={workType} />
      ))}
    </div>
  )
}

function CountBadge({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'total' | 'inside' | 'outside'
}) {
  const toneClass =
    tone === 'total'
      ? 'home-community-stat-total'
      : tone === 'inside'
        ? 'home-community-stat-inside'
        : 'home-community-stat-outside'

  return (
    <div
      className={`home-community-stat flex min-w-0 flex-1 flex-col items-center rounded-[18px] border px-2 py-3 ${toneClass}`}
    >
      <span className="text-center text-[9px] font-bold uppercase leading-tight tracking-[0.12em] opacity-80">
        {label}
      </span>
      <span className="mt-1.5 font-display text-[22px] font-extrabold leading-none tabular-nums tracking-tight">
        {value}
      </span>
    </div>
  )
}

function WorkTypeSection({
  title,
  users,
  workType,
  count,
}: {
  title: string
  users: CommunityUserItem[]
  workType: WorkType
  count: number
}) {
  const isInside = workType === 'inside'

  return (
    <section
      className={`home-community-section overflow-hidden rounded-[22px] border p-3.5 sm:p-4 ${
        isInside
          ? 'border-planner-gold/20 bg-gradient-to-br from-surface via-surface to-planner-cream/40'
          : 'border-planner-line/45 bg-gradient-to-br from-surface via-surface to-neutral-soft/50'
      }`}
    >
      <div className="mb-3.5 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
            isInside
              ? 'bg-gradient-to-br from-planner-navy to-planner-slate text-planner-gold'
              : 'bg-gradient-to-br from-planner-slate to-planner-ink text-white/90'
          }`}
        >
          <WorkTypeSectionIcon workType={workType} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[15px] font-bold leading-tight tracking-[-0.02em] text-planner-ink">
            {title}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-xl px-2.5 py-1 font-display text-[13px] font-bold tabular-nums ${
            isInside
              ? 'bg-planner-gold/15 text-planner-gold-dim'
              : 'bg-accent/10 text-accent'
          }`}
        >
          {count}
        </span>
      </div>

      <UsersGrid users={users} workType={workType} />
    </section>
  )
}

type Props = {
  users: CommunityUserItem[]
  byWorkType: UsersAllByWorkType
  counts: UsersAllCounts
}

/** Bosh sahifa — backend `/api/users/all` dan kelgan foydalanuvchilar */
export default function CommunityUsersGrid({ users, byWorkType, counts }: Props) {
  const { t } = useI18n()

  const hasAny =
    users.length > 0 || byWorkType.inside.length > 0 || byWorkType.outside.length > 0

  return (
    <div className="home-community-panel mt-6">
      <div className="home-community-head relative mb-5 overflow-hidden rounded-[22px] border border-planner-gold/20 px-4 py-4 shadow-planner-soft sm:px-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-planner-navy via-[#152238] to-planner-slate"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-planner-gold/15 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-planner-gold/50 to-transparent"
        />
        <div className="relative flex items-center justify-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-planner-gold/30 bg-planner-gold/10 text-sm"
          >
            👥
          </span>
          <h2 className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-white sm:text-[18px]">
            {t('home.communityUsersSubtitle')}
          </h2>
        </div>
      </div>

      <div className="home-community-shell relative overflow-hidden rounded-[26px] border border-planner-line/45 p-3.5 shadow-planner-panel sm:p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface via-surface to-planner-cream/30 dark:to-planner-cream/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-planner-gold/35 to-transparent"
        />

        <div className="relative mb-4 flex gap-2">
          <CountBadge label={t('home.communityCountsTotal')} value={counts.total} tone="total" />
          <CountBadge label={t('auth.workTypeInside')} value={counts.inside} tone="inside" />
          <CountBadge label={t('auth.workTypeOutside')} value={counts.outside} tone="outside" />
        </div>

        {!hasAny ? (
          <div className="home-community-empty relative py-10 text-center">
            <p className="text-body-sm text-planner-fog">{t('home.communityUsersEmpty')}</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            <WorkTypeSection
              title={t('auth.workTypeInside')}
              users={byWorkType.inside}
              workType="inside"
              count={counts.inside}
            />
            <WorkTypeSection
              title={t('auth.workTypeOutside')}
              users={byWorkType.outside}
              workType="outside"
              count={counts.outside}
            />
          </div>
        )}
      </div>
    </div>
  )
}
