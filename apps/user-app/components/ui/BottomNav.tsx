'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/components/i18n/I18nProvider'

function NavIconHome({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#E8533F' : '#9999A8'}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z" />
    </svg>
  )
}

function NavIconCalendar({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#E8533F' : '#9999A8'}
      strokeWidth="2"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  )
}

function NavIconReceipts({ active }: { active: boolean }) {
  const c = active ? '#E8533F' : '#9999A8'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 13h8M8 17h6" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NavIconUser({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#E8533F' : '#9999A8'}
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" />
    </svg>
  )
}

/** Boshqa nav ikonlari bilan bir xil vizual og‘irlik */
function NavIconPlusOnAccent() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function BottomNav() {
  const { t } = useI18n()
  const pathname = usePathname()
  const now = new Date()
  const uploadHref = `/month/${now.getFullYear()}/${now.getMonth() + 1}`

  const homeActive = pathname === '/home'
  const checksActive = pathname === '/home/checks'
  const plannerActive = pathname === '/home/planner'
  const monthActive = pathname.startsWith('/month/')
  const profileActive = pathname.startsWith('/profile')

  const safePb = 'pb-[max(10px,env(safe-area-inset-bottom))]'

  return (
    <nav
      className={`fixed bottom-0 left-1/2 z-30 flex h-[72px] w-full max-w-mobile -translate-x-1/2 items-center justify-between gap-0 border-t border-border bg-surface px-1 pt-1 shadow-nav sm:px-3 ${safePb}`}
    >
      <Link href="/home" className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2">
        <NavIconHome active={homeActive} />
        <span
          className={`max-w-full truncate px-0.5 text-center text-[10px] font-body sm:text-[11px] ${homeActive ? 'font-medium text-accent' : 'text-text-tertiary'}`}
        >
          {t('nav.home')}
        </span>
        {homeActive && <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />}
      </Link>

      <Link href="/home/checks" className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2">
        <NavIconReceipts active={checksActive} />
        <span
          className={`max-w-full truncate px-0.5 text-center text-[10px] font-body sm:text-[11px] ${checksActive ? 'font-medium text-accent' : 'text-text-tertiary'}`}
        >
          {t('nav.checks')}
        </span>
        {checksActive && <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />}
      </Link>

      <Link href="/home/planner#year-grid" className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2">
        <NavIconCalendar active={plannerActive} />
        <span
          className={`max-w-full truncate px-0.5 text-center text-[10px] font-body sm:text-[11px] ${plannerActive ? 'font-medium text-accent' : 'text-text-tertiary'}`}
        >
          {t('nav.year')}
        </span>
        {plannerActive && <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />}
      </Link>

      <Link href={uploadHref} className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-card transition-transform active:scale-95 ${
            monthActive ? 'bg-accent ring-2 ring-accent-soft' : 'bg-accent'
          }`}
          aria-hidden
        >
          <NavIconPlusOnAccent />
        </span>
        <span
          className={`max-w-full truncate px-0.5 text-center text-[10px] font-body sm:text-[11px] ${monthActive ? 'font-medium text-accent' : 'text-text-tertiary'}`}
        >
          {t('nav.upload')}
        </span>
        {monthActive && <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />}
      </Link>

      <Link href="/profile" className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2">
        <NavIconUser active={profileActive} />
        <span
          className={`max-w-full truncate px-0.5 text-center text-[10px] font-body sm:text-[11px] ${profileActive ? 'font-medium text-accent' : 'text-text-tertiary'}`}
        >
          {t('nav.profile')}
        </span>
        {profileActive && <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />}
      </Link>
    </nav>
  )
}
