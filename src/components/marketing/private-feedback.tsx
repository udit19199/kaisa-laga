import { ShieldAlert } from "lucide-react";

export function PrivateFeedback() {
  return (
    <section className="bg-[var(--brand-ink)] px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur-sm">
              <ShieldAlert className="mr-2 h-4 w-4" /> 100% Private to Management
            </div>
            <h2 className="mt-6 max-w-[12ch] text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Hear the problem before it turns into a public review.
            </h2>
            <p className="mt-6 max-w-[34rem] text-lg leading-8 text-white/72">
              Google Reviews tell you what already went wrong. Kaisa Laga gives customers a
              private, easier channel to say it first, while you still have a chance
              to respond and improve.
            </p>
            <ul className="mt-10 space-y-4 text-white/72">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white">✓</span>
                Easier than asking for a typed form.
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white">✓</span>
                Never posted publicly.
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white">✓</span>
                Helps you fix issues before they spread.
              </li>
            </ul>
          </div>

          <div className="border-t border-white/12 pt-10 lg:mt-14 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0">
            <p className="text-sm font-semibold tracking-[0.18em] text-white/42 uppercase">
              Early pilot feedback
            </p>
            <blockquote className="mt-6 max-w-[24rem] text-2xl leading-[1.45] tracking-tight text-white/92">
              &ldquo;Before this, the only people who left feedback were the angriest
              ones. Now we hear small issues sooner and can actually do something
              about them.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
