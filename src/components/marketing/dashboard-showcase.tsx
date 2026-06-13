export function DashboardShowcase() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 bg-white">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
          Wake up to actionable feedback.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--brand-muted)]">
          You don&apos;t have time to listen to 50 voice notes a day. Kaisa Laga automatically transcribes, analyzes sentiment, and surfaces the trends that matter. No complex dashboards required.
        </p>

        <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-[var(--brand-ink)]/10 bg-gray-50/50 p-4 sm:p-8 shadow-2xl shadow-[var(--brand-accent)]/10 backdrop-blur-sm">
          {/* Mock Dashboard UI */}
          <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 text-left flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Pulse</h3>
                <p className="text-sm text-gray-500">24 new voice reviews</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                ↑ 12% Positive
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="p-6 text-left flex flex-col justify-center">
                <div className="inline-flex w-fit items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 mb-3">Action Required</div>
                <p className="text-lg font-medium text-gray-900">Wait times</p>
                <p className="mt-1 text-sm text-gray-500">Mentioned 7 times today</p>
              </div>
              <div className="p-6 text-left flex flex-col justify-center">
                <div className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 mb-3">Highlight</div>
                <p className="text-lg font-medium text-gray-900">Staff friendliness</p>
                <p className="mt-1 text-sm text-gray-500">Praised 12 times today</p>
              </div>
              <div className="p-6 text-left flex flex-col justify-center">
                <div className="inline-flex w-fit items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 mb-3">Monitor</div>
                <p className="text-lg font-medium text-gray-900">Parking issues</p>
                <p className="mt-1 text-sm text-gray-500">Mentioned 3 times today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
