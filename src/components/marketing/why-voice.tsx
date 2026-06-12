export function WhyVoice() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 bg-white/50">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
          A form gets ignored. A quick voice note gets answered.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--brand-muted)]">
          Auris works because it asks for less effort. Customers do not want to type
          through feedback prompts, but they will often say what happened if it only
          takes a few seconds.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Text Survey Side */}
          <div className="rounded-2xl border border-[var(--brand-ink)]/10 bg-white p-8 text-left shadow-sm">
            <div className="mb-4 inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
              The Old Way
            </div>
            <div className="mt-6 rounded-xl bg-gray-50 p-6">
              <div className="flex gap-1 text-yellow-400 text-xl">
                ★ ★ ★ ☆ ☆
              </div>
              <p className="mt-4 text-gray-600">&quot;Service was okay.&quot;</p>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900">Actionable insight:</h4>
              <p className="mt-2 text-gray-500">Very little. You still do not know what actually went wrong.</p>
            </div>
          </div>

          {/* Voice Review Side */}
          <div className="rounded-2xl border border-[var(--brand-accent)]/20 bg-[var(--brand-paper)] p-8 text-left shadow-sm ring-1 ring-[var(--brand-accent)]/10">
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-[var(--brand-accent)]">
              With Auris
            </div>
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-[var(--brand-ink)]/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-accent)]/10">
                  <div className="h-4 w-4 rounded-full bg-[var(--brand-accent)] animate-pulse" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-3/4 rounded bg-gray-200" />
                  <div className="h-2 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
              <p className="mt-4 text-[var(--brand-ink)] italic">&quot;I love this place, but today the soup was cold and the front desk felt rushed.&quot;</p>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-[var(--brand-ink)]">Actionable insight:</h4>
              <p className="mt-2 text-[var(--brand-muted)]">Clear operational issues your team can actually fix next shift.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
