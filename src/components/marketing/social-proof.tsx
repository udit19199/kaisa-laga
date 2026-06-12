export function SocialProof() {
  return (
    <section className="border-y border-[var(--brand-ink)]/5 bg-[var(--brand-paper)]/50 py-12 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-[var(--brand-muted)]">
        Currently in private pilot with
      </p>
      <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-x-12 gap-y-6 opacity-60">
        <div className="text-xl font-bold text-[var(--brand-ink)] tracking-tight">Independent Salons</div>
        <div className="text-xl font-bold text-[var(--brand-ink)] tracking-tight">Boutique Fitness</div>
        <div className="text-xl font-bold text-[var(--brand-ink)] tracking-tight">Neighborhood Cafes</div>
      </div>
    </section>
  );
}
