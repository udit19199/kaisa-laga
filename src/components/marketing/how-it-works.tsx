export function HowItWorks() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 bg-[var(--brand-paper)]">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
          Simple enough for any busy shop floor.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--brand-muted)]">
          Auris should feel obvious to customers and effortless for the business.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-ink)]/5 text-2xl font-bold text-[var(--brand-ink)]">
              1
            </div>
            <h3 className="mt-6 text-xl font-semibold text-[var(--brand-ink)]">Place the QR Code</h3>
            <p className="mt-4 text-[var(--brand-muted)]">
              Put it at the counter, front desk, mirror station, or anywhere feedback naturally happens.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-ink)]/5 text-2xl font-bold text-[var(--brand-ink)]">
              2
            </div>
            <h3 className="mt-6 text-xl font-semibold text-[var(--brand-ink)]">Customers Speak</h3>
            <p className="mt-4 text-[var(--brand-muted)]">
              They scan and leave a quick voice note. No app download, no account, no typing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-accent)]/10 text-2xl font-bold text-[var(--brand-accent)]">
              3
            </div>
            <h3 className="mt-6 text-xl font-semibold text-[var(--brand-ink)]">You Know What to Fix</h3>
            <p className="mt-4 text-[var(--brand-muted)]">
              Auris organizes the feedback into clear issues, recurring themes, and next steps for the team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
