function QrGlyph() {
  return (
    <div className="grid h-[6.6rem] w-[6.6rem] grid-cols-5 gap-1 rounded-[1.3rem] bg-white/92 p-3 ring-1 ring-black/5">
      {Array.from({ length: 25 }).map((_, index) => (
        <span
          key={index}
          className={
            index % 3 === 0 || index === 1 || index === 7 || index === 18
              ? "rounded-[3px] bg-[var(--brand-ink)]"
              : "rounded-[3px] bg-[var(--brand-ink)]/10"
          }
        />
      ))}
    </div>
  );
}

function VoiceGlyph() {
  return (
    <div className="relative flex h-[7rem] w-[7rem] items-center justify-center rounded-full bg-white/84 ring-1 ring-black/5">
      <div className="absolute inset-[1rem] rounded-full border border-[var(--brand-accent)]/12" />
      <div className="absolute inset-[1.7rem] rounded-full bg-[var(--brand-ink)]" />
      <div className="relative z-10 flex items-end gap-1">
        {[18, 30, 24, 38, 20, 26].map((height, index) => (
          <span
            key={index}
            className="voice-bar rounded-full bg-[var(--brand-accent)]"
            style={{ height: `${height}px`, width: "6px", animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function InsightGlyph() {
  return (
    <div className="w-[10rem] rounded-[1.5rem] bg-[var(--brand-ink)] px-4 py-4 text-white">
      <div className="space-y-3">
        <div className="rounded-[0.9rem] bg-white/8 px-3 py-3">
          <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-white/50 uppercase">
            Repeating issue
          </p>
          <p className="mt-1 text-sm font-medium">Wait times</p>
        </div>
        <div className="rounded-[0.9rem] bg-white/8 px-3 py-3">
          <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-white/50 uppercase">
            What to fix
          </p>
          <p className="mt-1 text-sm font-medium">Front desk handoff</p>
        </div>
      </div>
    </div>
  );
}

export function ProductDemo() {
  return (
    <section id="product" className="relative px-6 pb-24 sm:px-8 sm:pb-32" aria-label="How Auris works">
      <div className="mx-auto max-w-5xl">
        <div className="demo-stage relative overflow-hidden rounded-[2.5rem] px-6 py-14 sm:px-10 sm:py-[4.5rem] lg:px-14 lg:py-20">
          <div className="demo-stage-glow" aria-hidden />
          <div className="relative z-10 min-h-[24rem] sm:min-h-[28rem]">
            <div className="demo-path" aria-hidden />

            <div className="demo-anchor demo-anchor-qr" aria-hidden>
              <div className="demo-anchor-shell">
                <QrGlyph />
              </div>
            </div>

            <div className="demo-anchor demo-anchor-voice" aria-hidden>
              <div className="demo-anchor-shell">
                <VoiceGlyph />
              </div>
            </div>

            <div className="demo-anchor demo-anchor-insight" aria-hidden>
              <div className="demo-anchor-shell">
                <InsightGlyph />
              </div>
            </div>

            <div className="demo-morph" aria-hidden>
              <div className="demo-state demo-state-qr">
                <QrGlyph />
              </div>
              <div className="demo-state demo-state-voice">
                <VoiceGlyph />
              </div>
              <div className="demo-state demo-state-insight">
                <InsightGlyph />
              </div>
            </div>

            <div className="demo-pulse" aria-hidden />
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-[28rem] text-center text-lg leading-8 font-medium tracking-tight text-[var(--brand-ink)] sm:text-[1.4rem]">
          Hear what people mean, then know what to fix faster.
        </p>
      </div>
    </section>
  );
}
