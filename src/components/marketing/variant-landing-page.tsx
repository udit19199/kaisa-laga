"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Headphones,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Store,
  Waves,
} from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  getLandingConcept,
  landingConcepts,
  type LandingConcept,
  type SectionBlock,
} from "@/components/marketing/landing-variants";

type VariantPageProps = {
  variant: LandingConcept;
};

function surfaceStyle(variant: LandingConcept): CSSProperties {
  return {
    ["--lp-canvas" as never]: variant.palette.canvas,
    ["--lp-canvas-end" as never]: variant.palette.canvasEnd,
    ["--lp-wash" as never]: variant.palette.wash,
    ["--lp-ink" as never]: variant.palette.ink,
    ["--lp-muted" as never]: variant.palette.muted,
    ["--lp-panel" as never]: variant.palette.panel,
    ["--lp-line" as never]: variant.palette.line,
    ["--lp-accent" as never]: variant.palette.accent,
    ["--lp-accent-soft" as never]: variant.palette.accentSoft,
    ["--lp-spotlight" as never]: variant.palette.spotlight,
    fontFamily: variant.fontStack,
    color: variant.palette.ink,
    background:
      `radial-gradient(circle at 14% 10%, ${variant.palette.spotlight} 0%, transparent 26%),` +
      `radial-gradient(circle at 82% 12%, ${variant.palette.accentSoft} 0%, transparent 20%),` +
      `linear-gradient(180deg, ${variant.palette.canvas} 0%, ${variant.palette.canvasEnd} 100%)`,
  };
}

function primaryButtonClass() {
  return "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lp-ink)] px-5 py-3 text-sm font-medium text-[var(--lp-canvas)] transition-transform duration-300 hover:-translate-y-0.5";
}

function secondaryButtonClass() {
  return "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--lp-line)] bg-[var(--lp-panel)] px-5 py-3 text-sm font-medium text-[var(--lp-ink)] transition-transform duration-300 hover:-translate-y-0.5";
}

function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.15rem] border border-[var(--lp-line)] bg-[var(--lp-panel)] shadow-[0_8px_8px_color-mix(in_oklch,var(--lp-line)_24%,transparent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function HeroBadgeRow({ variant }: { variant: LandingConcept }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {variant.heroChips.slice(0, 2).map((chip, index) => (
        <span
          key={chip}
          className="landing-enter rounded-full border border-[var(--lp-line)] bg-[var(--lp-panel)] px-3 py-1.5 text-xs font-medium text-[var(--lp-ink)]"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function HeroActions({ variant }: { variant: LandingConcept }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/sign-up" className={primaryButtonClass()}>
        {variant.primaryCTA}
        <ArrowRight className="size-4" />
      </Link>
      <Link href="/landings" className={secondaryButtonClass()}>
        {variant.secondaryCTA}
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}

function NightAuditArtifact({ variant }: { variant: LandingConcept }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
      <Shell className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">11:40 PM review</p>
          <BadgeCheck className="size-4 text-[var(--lp-accent)]" />
        </div>
        <div className="mt-4 grid gap-3">
          {variant.heroPulse.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[0.9fr_1.1fr] gap-3 rounded-[0.9rem] border border-[var(--lp-line)] bg-[color:var(--lp-canvas)]/22 px-4 py-3 text-sm"
            >
              <span className="text-[var(--lp-muted)]">{item.label}</span>
              <span className="text-[var(--lp-ink)]">{item.value}</span>
            </div>
          ))}
        </div>
      </Shell>
      <Shell className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--lp-accent)] shadow-[0_0_0_6px_var(--lp-accent-soft)]" />
          <p className="text-sm text-[var(--lp-ink)]">Morning-ready issues, already grouped by location.</p>
        </div>
        <div className="mt-4 space-y-3">
          {["Host stand drift", "Late dessert handoff", "Repeat praise for breakfast staff"].map((line) => (
            <div
              key={line}
              className="rounded-[0.9rem] border border-[var(--lp-line)] px-4 py-3 text-sm text-[var(--lp-muted)]"
            >
              {line}
            </div>
          ))}
        </div>
      </Shell>
    </div>
  );
}

function BazaarArtifact() {
  const cards = [
    "Morning crowd",
    "Coffee praise",
    "Socket shortage",
    "Regulars came back",
    "Service felt easy",
  ];

  return (
    <div className="relative min-h-[20rem]">
      {cards.map((card, index) => (
        <div
          key={card}
          className="absolute rounded-[0.95rem] border border-[var(--lp-line)] px-4 py-3 text-sm font-medium text-[var(--lp-ink)] shadow-[0_8px_8px_color-mix(in_oklch,var(--lp-line)_24%,transparent)]"
          style={{
            background: index % 2 === 0 ? "var(--lp-panel)" : "color-mix(in oklch, var(--lp-accent-soft) 72%, var(--lp-panel))",
            left: `${8 + (index % 3) * 26}%`,
            top: `${10 + index * 14}%`,
            transform: `rotate(${index % 2 === 0 ? -4 : 3}deg)`,
          }}
        >
          {card}
        </div>
      ))}
      <div className="absolute bottom-0 left-[10%] right-[10%] rounded-[1.1rem] border border-[var(--lp-line)] bg-[var(--lp-panel)] p-4">
        <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">Local read</p>
        <p className="mt-2 text-base text-[var(--lp-ink)]">The owner sees habit, warmth, and friction in the same glance.</p>
      </div>
    </div>
  );
}

function ReceiptArtifact({ variant }: { variant: LandingConcept }) {
  return (
    <Shell className="mx-auto max-w-[24rem] p-6">
      <div className="flex items-center justify-between text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">
        <span>Visit record</span>
        <ReceiptText className="size-4 text-[var(--lp-accent)]" />
      </div>
      <div className="mt-4 space-y-3 border-y border-dashed border-[var(--lp-line)] py-4">
        {variant.heroPulse.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 text-sm">
            <span className="text-[var(--lp-muted)]">{item.label}</span>
            <span className="max-w-[12ch] text-right text-[var(--lp-ink)]">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-sm text-[var(--lp-muted)]">
        <p>Source: visit-linked guest note</p>
        <p>Reply: owner-visible and attached</p>
        <p>Location: stamped to the outlet</p>
      </div>
    </Shell>
  );
}

function QuietRescueArtifact() {
  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
      <div className="mx-auto grid size-48 place-items-center rounded-full border border-[var(--lp-line)] bg-[var(--lp-panel)]">
        <div className="grid size-36 place-items-center rounded-full border border-[var(--lp-accent-soft)]">
          <div className="grid size-24 place-items-center rounded-full bg-[var(--lp-accent-soft)] text-[var(--lp-ink)]">
            <ShieldCheck className="size-8 text-[var(--lp-accent)]" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {["Complaint arrives privately", "One owner responds", "The lesson stays with the next shift"].map((item) => (
          <Shell key={item} className="px-4 py-3 text-sm text-[var(--lp-ink)]">
            {item}
          </Shell>
        ))}
      </div>
    </div>
  );
}

function TapeRoomArtifact() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
      <Shell className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-full bg-[var(--lp-ink)] text-[var(--lp-canvas)]">
            <Headphones className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">Tape room</p>
            <p className="text-sm text-[var(--lp-ink)]">Playback before summary</p>
          </div>
        </div>
        <div className="mt-5 flex items-end gap-1.5">
          {Array.from({ length: 14 }).map((_, index) => (
            <span
              key={index}
              className="landing-wave w-2 rounded-full bg-[var(--lp-accent)]"
              style={{ height: `${20 + (index % 5) * 14}px`, animationDelay: `${index * 120}ms` }}
            />
          ))}
        </div>
      </Shell>
      <div className="space-y-3">
        {["The exact phrasing tells us whether the issue was tone, timing, or product.", "Operators hear the customer before the dashboard reframes them.", "Voice stays central instead of becoming a decorative feature."].map((line) => (
          <Shell key={line} className="px-4 py-4 text-sm leading-6 text-[var(--lp-muted)]">
            {line}
          </Shell>
        ))}
      </div>
    </div>
  );
}

function DistrictBoardArtifact() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
      <Shell className="p-5">
        <div className="grid min-h-[18rem] grid-cols-2 gap-3">
          {["South", "West", "Central", "North"].map((district, index) => (
            <div
              key={district}
              className="rounded-[1rem] border border-[var(--lp-line)] p-4"
              style={{
                background: index === 0 ? "color-mix(in oklch, var(--lp-accent-soft) 78%, var(--lp-panel))" : "var(--lp-panel)",
              }}
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">{district}</p>
              <p className="mt-3 text-sm text-[var(--lp-ink)]">
                {index === 0 ? "Check-in timing drift" : index === 1 ? "Repeat visits up" : index === 2 ? "Contained queue issue" : "Cleanliness praise"}
              </p>
            </div>
          ))}
        </div>
      </Shell>
      <Shell className="p-5">
        <div className="flex items-center gap-3">
          <MapPinned className="size-5 text-[var(--lp-accent)]" />
          <p className="text-sm text-[var(--lp-ink)]">Regional comparison first, transcript drill-down second.</p>
        </div>
        <div className="mt-4 space-y-3 text-sm text-[var(--lp-muted)]">
          <p>Built for chains that need neighborhood context, not one-location storytelling.</p>
          <p>Outliers stay visible, systemic drift stays distinct, and good districts have something to teach the weak ones.</p>
        </div>
      </Shell>
    </div>
  );
}

function HouseManualArtifact() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
      <Shell className="p-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">House standard</p>
        <p className="mt-4 text-[clamp(1.35rem,2.6vw,2.2rem)] leading-[1.05] tracking-[-0.03em] text-[var(--lp-ink)]">
          Arrival, attention, and response should feel like one uninterrupted standard.
        </p>
      </Shell>
      <div className="grid gap-3">
        {["Arrival path", "Room care", "Reply quality"].map((item) => (
          <Shell key={item} className="px-4 py-4 text-sm text-[var(--lp-ink)]">
            {item}
          </Shell>
        ))}
      </div>
    </div>
  );
}

function PublicRecordArtifact() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.98fr_1.02fr]">
      <Shell className="p-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">Public record</p>
        <div className="mt-4 space-y-3">
          {["Timestamp visible", "Venue context attached", "Owner response included"].map((line) => (
            <div key={line} className="rounded-[0.95rem] border border-[var(--lp-line)] px-4 py-3 text-sm text-[var(--lp-ink)]">
              {line}
            </div>
          ))}
        </div>
      </Shell>
      <Shell className="p-5">
        <div className="flex items-center gap-3">
          <Store className="size-5 text-[var(--lp-accent)]" />
          <p className="text-sm text-[var(--lp-ink)]">Readers can tell why this review belongs to this place.</p>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--lp-muted)]">
          The design borrows from public notice formats so credibility comes from structure and source visibility.
        </p>
      </Shell>
    </div>
  );
}

function CounterSprintArtifact({ variant }: { variant: LandingConcept }) {
  return (
    <div className="grid gap-4">
      <Shell className="p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {variant.heroPulse.map((item) => (
            <div key={item.label} className="rounded-[0.9rem] bg-[color:var(--lp-accent-soft)] px-4 py-4">
              <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">{item.label}</p>
              <p className="mt-2 text-lg tracking-[-0.03em] text-[var(--lp-ink)]">{item.value}</p>
            </div>
          ))}
        </div>
      </Shell>
      <div className="flex flex-wrap gap-3">
        <Link href="/sign-up" className={primaryButtonClass()}>
          {variant.primaryCTA}
          <ArrowRight className="size-4" />
        </Link>
        <Link href="/reviews" className={secondaryButtonClass()}>
          View verified reviews
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function TableStoryArtifact() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <Shell className="p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {["Arrival", "Middle of meal", "Last impression"].map((stage) => (
            <div key={stage} className="rounded-[0.95rem] border border-[var(--lp-line)] px-4 py-4">
              <p className="text-sm tracking-[-0.02em] text-[var(--lp-ink)]">{stage}</p>
            </div>
          ))}
        </div>
      </Shell>
      <div className="grid size-40 place-items-center rounded-full border border-[var(--lp-line)] bg-[var(--lp-panel)]">
        <Waves className="size-9 text-[var(--lp-accent)]" />
      </div>
    </div>
  );
}

function HeroArtifact({ variant }: { variant: LandingConcept }) {
  switch (variant.heroMode) {
    case "night-audit":
      return <NightAuditArtifact variant={variant} />;
    case "signal-bazaar":
      return <BazaarArtifact />;
    case "visit-receipt":
      return <ReceiptArtifact variant={variant} />;
    case "quiet-rescue":
      return <QuietRescueArtifact />;
    case "tape-room":
      return <TapeRoomArtifact />;
    case "district-board":
      return <DistrictBoardArtifact />;
    case "house-manual":
      return <HouseManualArtifact />;
    case "public-record":
      return <PublicRecordArtifact />;
    case "counter-sprint":
      return <CounterSprintArtifact variant={variant} />;
    case "table-story":
      return <TableStoryArtifact />;
    default:
      return <NightAuditArtifact variant={variant} />;
  }
}

function HeroSection({ variant }: { variant: LandingConcept }) {
  const centered = variant.heroMode === "counter-sprint";
  const compact = variant.heroMode === "visit-receipt" || variant.heroMode === "quiet-rescue";

  return (
    <section className="px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-6xl">
        <div
          className={cn(
            "grid gap-8 rounded-[1.5rem] border border-[var(--lp-line)] bg-[color:var(--lp-panel)] p-5 sm:p-7 lg:p-10",
            centered ? "justify-items-center text-center" : "lg:grid-cols-[0.9fr_1.1fr] lg:items-center",
          )}
        >
          <div className={cn("max-w-3xl", centered && "mx-auto")}>
            <p className="text-sm font-medium text-[var(--lp-muted)]">{variant.kicker}</p>
            <h1
              className={cn(
                "mt-4 text-[clamp(2.8rem,5.6vw,4.9rem)] leading-[0.94] tracking-[-0.04em] text-[var(--lp-ink)] [text-wrap:balance]",
                compact && "max-w-[10ch]",
                centered && "mx-auto max-w-[11ch]",
              )}
            >
              {variant.headline}
            </h1>
            <p
              className={cn(
                "mt-5 max-w-[38ch] text-[1rem] leading-7 text-[var(--lp-muted)] [text-wrap:pretty]",
                centered && "mx-auto",
              )}
            >
              {variant.dek}
            </p>
            <div
              className={cn(
                "mt-5 inline-flex rounded-full border border-[var(--lp-line)] bg-[color:var(--lp-accent-soft)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--lp-ink)]",
                centered && "mx-auto",
              )}
            >
              {variant.scene}
            </div>
            {variant.heroMode !== "counter-sprint" ? (
              <>
                <HeroActions variant={variant} />
                <HeroBadgeRow variant={variant} />
              </>
            ) : (
              <HeroBadgeRow variant={variant} />
            )}
          </div>
          <div className={cn("w-full", centered && "mt-2 max-w-4xl")}>
            <HeroArtifact variant={variant} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionFrame({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-5 py-2">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(1.8rem,2.8vw,2.8rem)] leading-[0.98] tracking-[-0.04em] text-[var(--lp-ink)] [text-wrap:balance]">
              {title}
            </h2>
            <p className="mt-3 max-w-[34ch] text-sm leading-6 text-[var(--lp-muted)] [text-wrap:pretty]">
              {body}
            </p>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

function ProofWallSection({ block }: { block: Extract<SectionBlock, { kind: "proofWall" }> }) {
  return (
    <SectionFrame title={block.title} body={block.body}>
      <div className="grid gap-3 lg:grid-cols-3">
        {block.items.map((item) => (
          <Shell key={item.title} className="p-5">
            <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--lp-accent)] uppercase">{item.tag}</p>
            <h3 className="mt-3 text-lg tracking-[-0.03em] text-[var(--lp-ink)]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--lp-muted)]">{item.body}</p>
          </Shell>
        ))}
      </div>
    </SectionFrame>
  );
}

function ProcessLaneSection({ block }: { block: Extract<SectionBlock, { kind: "processLane" }> }) {
  return (
    <SectionFrame title={block.title} body={block.body}>
      <div className="grid gap-3 lg:grid-cols-3">
        {block.steps.map((step, index) => (
          <Shell key={step.title} className="p-5">
            <div className="grid size-9 place-items-center rounded-full bg-[var(--lp-accent-soft)] text-sm font-semibold text-[var(--lp-accent)]">
              {index + 1}
            </div>
            <h3 className="mt-4 text-lg tracking-[-0.03em] text-[var(--lp-ink)]">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--lp-muted)]">{step.body}</p>
          </Shell>
        ))}
      </div>
    </SectionFrame>
  );
}

function QuoteStackSection({ block }: { block: Extract<SectionBlock, { kind: "quoteStack" }> }) {
  return (
    <SectionFrame title={block.title} body={block.body}>
      <div className="grid gap-3 lg:grid-cols-3">
        {block.quotes.map((item) => (
          <Shell key={item.quote} className="p-5">
            <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">{item.byline}</p>
            <p className="mt-3 text-[1rem] leading-7 text-[var(--lp-ink)]">{item.quote}</p>
          </Shell>
        ))}
      </div>
    </SectionFrame>
  );
}

function SignalBoardSection({ block }: { block: Extract<SectionBlock, { kind: "signalBoard" }> }) {
  return (
    <SectionFrame title={block.title} body={block.body}>
      <Shell className="overflow-hidden">
        <div className="grid grid-cols-[0.85fr_1.3fr_auto] gap-3 border-b border-[var(--lp-line)] px-5 py-4 text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">
          <span>Zone</span>
          <span>Detail</span>
          <span>Status</span>
        </div>
        {block.rows.map((row, index) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-[0.85fr_1.3fr_auto] gap-3 px-5 py-4 text-sm",
              index < block.rows.length - 1 && "border-b border-[var(--lp-line)]",
            )}
          >
            <span className="text-[var(--lp-ink)]">{row.label}</span>
            <span className="text-[var(--lp-muted)]">{row.detail}</span>
            <span className="rounded-full bg-[var(--lp-accent-soft)] px-3 py-1 text-[0.68rem] font-semibold text-[var(--lp-accent)]">
              {row.status}
            </span>
          </div>
        ))}
      </Shell>
    </SectionFrame>
  );
}

function ComparisonDeckSection({ block }: { block: Extract<SectionBlock, { kind: "comparisonDeck" }> }) {
  return (
    <SectionFrame title={block.title} body={block.body}>
      <Shell className="overflow-hidden">
        <div className="grid grid-cols-[0.8fr_1fr_1fr] gap-3 border-b border-[var(--lp-line)] px-5 py-4 text-[0.72rem] font-semibold tracking-[0.14em] text-[var(--lp-muted)] uppercase">
          <span>Signal</span>
          <span>Trusted source</span>
          <span>Loose noise</span>
        </div>
        {block.rows.map((row, index) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-[0.8fr_1fr_1fr] gap-3 px-5 py-4 text-sm",
              index < block.rows.length - 1 && "border-b border-[var(--lp-line)]",
            )}
          >
            <span className="text-[var(--lp-ink)]">{row.label}</span>
            <span className="text-[var(--lp-ink)]">{row.trusted}</span>
            <span className="text-[var(--lp-muted)]">{row.noisy}</span>
          </div>
        ))}
      </Shell>
    </SectionFrame>
  );
}

function PrincipleColumnsSection({ block }: { block: Extract<SectionBlock, { kind: "principleColumns" }> }) {
  return (
    <SectionFrame title={block.title} body={block.body}>
      <div className="grid gap-3 lg:grid-cols-3">
        {block.columns.map((column) => (
          <Shell key={column.title} className="p-5">
            <h3 className="text-lg tracking-[-0.03em] text-[var(--lp-ink)]">{column.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--lp-muted)]">{column.body}</p>
          </Shell>
        ))}
      </div>
    </SectionFrame>
  );
}

function CtaStageSection({
  block,
  variant,
}: {
  block: Extract<SectionBlock, { kind: "ctaStage" }>;
  variant: LandingConcept;
}) {
  return (
    <section className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <Shell className="p-6 sm:p-8 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="max-w-2xl text-[clamp(2.2rem,4vw,3.7rem)] leading-[0.96] tracking-[-0.04em] text-[var(--lp-ink)] [text-wrap:balance]">
                {block.title}
              </h2>
              <p className="mt-4 max-w-[34ch] text-sm leading-6 text-[var(--lp-muted)] [text-wrap:pretty]">
                {block.body}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className={primaryButtonClass()}>
                {variant.primaryCTA}
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/reviews" className={secondaryButtonClass()}>
                View verified reviews
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </Shell>
      </div>
    </section>
  );
}

function RenderBlock({
  block,
  variant,
}: {
  block: SectionBlock;
  variant: LandingConcept;
}) {
  switch (block.kind) {
    case "proofWall":
      return <ProofWallSection block={block} />;
    case "processLane":
      return <ProcessLaneSection block={block} />;
    case "quoteStack":
      return <QuoteStackSection block={block} />;
    case "signalBoard":
      return <SignalBoardSection block={block} />;
    case "comparisonDeck":
      return <ComparisonDeckSection block={block} />;
    case "principleColumns":
      return <PrincipleColumnsSection block={block} />;
    case "ctaStage":
      return <CtaStageSection block={block} variant={variant} />;
    default:
      return null;
  }
}

function VariantNav({ variant }: { variant: LandingConcept }) {
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <nav className="landing-nav flex items-center justify-between gap-4 rounded-full px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-[var(--lp-ink)] text-[var(--lp-canvas)]">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--lp-ink)]">Kaisa Laga</p>
              <p className="text-[0.72rem] text-[var(--lp-muted)]">10 fresh directions</p>
            </div>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full border border-[var(--lp-line)] px-3 py-1.5 text-xs text-[var(--lp-muted)]">
              {variant.name}
            </span>
            <Link href="/landings" className={secondaryButtonClass()}>
              Gallery
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function VariantLandingPage({ variant }: VariantPageProps) {
  return (
    <div className="landing-shell min-h-dvh" style={surfaceStyle(variant)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[-6rem] top-[-4rem] size-[24rem] rounded-full blur-3xl"
          style={{ background: "var(--lp-spotlight)", opacity: 0.8 }}
        />
        <div
          className="absolute right-[-8rem] top-[20rem] size-[20rem] rounded-full blur-3xl"
          style={{ background: "var(--lp-accent-soft)", opacity: 0.9 }}
        />
      </div>
      <VariantNav variant={variant} />
      <main className="relative z-10 space-y-6 pb-10">
        <HeroSection variant={variant} />
        {variant.sections.map((block, index) => (
          <RenderBlock key={`${variant.slug}-${block.kind}-${index}`} block={block} variant={variant} />
        ))}
      </main>
    </div>
  );
}

export function LandingVariantGallery() {
  const heroConcept = landingConcepts[0];

  return (
    <div className="landing-shell min-h-dvh" style={surfaceStyle(heroConcept)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-4rem] size-[24rem] rounded-full blur-3xl bg-[var(--lp-spotlight)] opacity-80" />
        <div className="absolute right-[-8rem] top-[20rem] size-[20rem] rounded-full blur-3xl bg-[var(--lp-accent-soft)] opacity-90" />
      </div>
      <VariantNav variant={heroConcept} />
      <main className="relative z-10 px-4 pb-10 pt-8 sm:px-6">
        <section className="mx-auto max-w-6xl">
          <Shell className="p-6 sm:p-8 md:p-10">
            <p className="text-sm text-[var(--lp-muted)]">Ten fresh routes, rebuilt lighter.</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.8rem,5vw,5.2rem)] leading-[0.95] tracking-[-0.04em] text-[var(--lp-ink)] [text-wrap:balance]">
              Ten landing directions with less explanation and more visual proof.
            </h1>
            <p className="mt-4 max-w-[42ch] text-sm leading-6 text-[var(--lp-muted)] [text-wrap:pretty]">
              Same Kaisa Laga promise. Sharper pacing, tighter copy, and more distinctive hero artifacts.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sign-up" className={primaryButtonClass()}>
                Start free trial
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/reviews" className={secondaryButtonClass()}>
                View verified reviews
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </Shell>
        </section>

        <section className="mx-auto mt-6 grid max-w-6xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {landingConcepts.map((variant, index) => (
            <Link
              key={variant.slug}
              href={`/landings/${variant.slug}`}
              className="landing-enter rounded-[1.2rem] border border-[var(--lp-line)] bg-[var(--lp-panel)] p-5 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div
                className="h-2.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${variant.palette.accent} 0%, ${variant.palette.wash} 100%)`,
                }}
              />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[var(--lp-muted)]">{variant.kicker}</p>
                  <h2 className="mt-2 text-xl tracking-[-0.03em] text-[var(--lp-ink)]">{variant.name}</h2>
                </div>
                {variant.heroMode === "visit-receipt" ? (
                  <ReceiptText className="size-4 text-[var(--lp-muted)]" />
                ) : variant.heroMode === "tape-room" ? (
                  <Headphones className="size-4 text-[var(--lp-muted)]" />
                ) : variant.heroMode === "district-board" ? (
                  <MapPinned className="size-4 text-[var(--lp-muted)]" />
                ) : variant.heroMode === "table-story" ? (
                  <Waves className="size-4 text-[var(--lp-muted)]" />
                ) : variant.heroMode === "public-record" ? (
                  <StickyNote className="size-4 text-[var(--lp-muted)]" />
                ) : (
                  <ArrowUpRight className="size-4 text-[var(--lp-muted)]" />
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--lp-muted)]">{variant.dek}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {variant.heroChips.slice(0, 2).map((chip) => (
                  <span key={chip} className="rounded-full border border-[var(--lp-line)] px-3 py-1 text-xs text-[var(--lp-ink)]">
                    {chip}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

export function getActiveLandingTitle(slug?: string) {
  return slug ? getLandingConcept(slug)?.name ?? null : null;
}
