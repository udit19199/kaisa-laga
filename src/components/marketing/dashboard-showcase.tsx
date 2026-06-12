export function DashboardShowcase() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 bg-white">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-4xl">
          See exactly what needs fixing tomorrow.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--brand-muted)]">
          Don&apos;t waste hours listening to recordings. Our AI automatically extracts topics, analyzes sentiment, and alerts you to recurring issues in real-time.
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
              <div className="p-6 text-left">
                <p className="text-sm font-medium text-gray-500">Top Theme</p>
                <p className="mt-2 text-xl font-semibold text-gray-900">Staff Friendliness</p>
                <p className="mt-1 text-sm text-gray-500">Mentioned 14 times</p>
              </div>
              <div className="p-6 text-left">
                <p className="text-sm font-medium text-gray-500">Critical Alert</p>
                <p className="mt-2 text-xl font-semibold text-red-600">Wait Times</p>
                <p className="mt-1 text-sm text-red-500">Spike detected at 2 PM</p>
              </div>
              <div className="p-6 text-left">
                <p className="text-sm font-medium text-gray-500">Overall Sentiment</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[72%]" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">72%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
