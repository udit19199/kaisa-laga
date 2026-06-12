import { ShieldAlert } from "lucide-react";

export function PrivateFeedback() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32 bg-[var(--brand-ink)] text-white">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur-sm">
              <ShieldAlert className="mr-2 h-4 w-4" /> 100% Private to Management
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Catch the whisper before it becomes a 1-star Google Review.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-300">
              Auris is an internal early-warning system, not a public megaphone. Give angry customers a private channel to vent directly to you, so they don&apos;t take their frustration to Yelp.
            </p>
            <ul className="mt-8 space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                Never posted publicly.
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                Customers feel heard instantly.
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                For your eyes (and ears) only.
              </li>
            </ul>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-[var(--brand-accent)]/30 to-blue-500/30 blur-2xl opacity-50" />
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
              <p className="italic text-gray-200">&quot;We used to find out about bad service 3 days later on Yelp. Now, I get an SMS alert if someone is upset while they are still in the building. It&apos;s saved us dozens of regulars.&quot;</p>
              <div className="mt-6 font-medium text-white">— Sarah T., Salon Owner</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
