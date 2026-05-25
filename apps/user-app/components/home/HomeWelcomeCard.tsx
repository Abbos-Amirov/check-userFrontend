type Props = {
  greeting: string
  displayName: string
  idPrefix: string
  displayId: string
  avatarSrc: string
}

/** Bosh sahifa — salom, ism va ID bitta kartochkada + avatar. */
export default function HomeWelcomeCard({
  greeting,
  displayName,
  idPrefix,
  displayId,
  avatarSrc,
}: Props) {
  return (
    <section
      className="home-welcome relative overflow-hidden rounded-[26px] border border-white/20 shadow-planner-card"
      aria-labelledby="home-welcome-name"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-planner-navy via-[#1a2d45] to-planner-ink"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-planner-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent/15 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-planner-gold/45 to-transparent"
      />

      <div className="relative flex items-center gap-4 p-5 sm:p-6">
        <div className="relative shrink-0">
          <div
            aria-hidden
            className="absolute -inset-1 rounded-full bg-gradient-to-br from-planner-gold/60 to-accent/40 opacity-80 blur-sm"
          />
          <img
            src={avatarSrc}
            alt=""
            className="relative h-[80px] w-[80px] rounded-full border-[3px] border-white/90 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
            width={80}
            height={80}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-planner-gold/90">
            {greeting}
          </p>
          <h1
            id="home-welcome-name"
            className="mt-1.5 font-display text-[24px] font-extrabold leading-[1.1] tracking-[-0.04em] text-white sm:text-[28px]"
          >
            {displayName}
          </h1>
          <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
              {idPrefix}
            </span>
            <span className="truncate font-display text-[14px] font-bold tabular-nums text-planner-gold">
              {displayId}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
