type Props = {
  title: string
  subtitle: string
}

export default function ChecksPageHeader({ title, subtitle }: Props) {
  return (
    <header className="relative px-5 pb-4 pt-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-8 top-4 h-32 w-32 rounded-full bg-planner-gold/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 top-8 h-20 w-20 rounded-full bg-accent/12 blur-2xl"
      />
      <div className="relative">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-planner-gold/30 bg-surface/80 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-planner-gold-dim shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(232,83,63,0.45)]" />
          {subtitle}
        </p>
        <h1 className="font-display text-[28px] font-extrabold leading-[1.05] tracking-[-0.04em] text-planner-ink sm:text-[32px]">
          {title}
        </h1>
      </div>
    </header>
  )
}
