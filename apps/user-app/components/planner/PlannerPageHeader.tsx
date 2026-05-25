type Props = {
  title: string
  subtitle: string
}

export default function PlannerPageHeader({ title, subtitle }: Props) {
  return (
    <header className="relative px-5 pb-2 pt-7">
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 top-5 h-16 w-16 rounded-full bg-planner-gold/20 blur-2xl"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-planner-gold/30 bg-surface/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-planner-gold-dim backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-planner-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
            {subtitle}
          </p>
          <h1 className="font-display text-[26px] font-extrabold leading-[1.08] tracking-[-0.04em] text-planner-ink sm:text-[30px]">
            {title}
          </h1>
        </div>
        <div
          aria-hidden
          className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-planner-line/80 bg-surface/80 shadow-planner-soft backdrop-blur-sm"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-planner-navy">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="#d4af37" />
          </svg>
        </div>
      </div>
    </header>
  )
}
