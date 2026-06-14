export type HeroMode =
  | "night-audit"
  | "signal-bazaar"
  | "visit-receipt"
  | "quiet-rescue"
  | "tape-room"
  | "district-board"
  | "house-manual"
  | "public-record"
  | "counter-sprint"
  | "table-story";

export type SurfacePalette = {
  canvas: string;
  canvasEnd: string;
  wash: string;
  ink: string;
  muted: string;
  panel: string;
  line: string;
  accent: string;
  accentSoft: string;
  spotlight: string;
};

export type SectionBlock =
  | {
      kind: "proofWall";
      title: string;
      body: string;
      items: Array<{ title: string; body: string; tag: string }>;
    }
  | {
      kind: "processLane";
      title: string;
      body: string;
      steps: Array<{ title: string; body: string }>;
    }
  | {
      kind: "quoteStack";
      title: string;
      body: string;
      quotes: Array<{ byline: string; quote: string }>;
    }
  | {
      kind: "signalBoard";
      title: string;
      body: string;
      rows: Array<{ label: string; detail: string; status: string }>;
    }
  | {
      kind: "comparisonDeck";
      title: string;
      body: string;
      rows: Array<{ label: string; trusted: string; noisy: string }>;
    }
  | {
      kind: "principleColumns";
      title: string;
      body: string;
      columns: Array<{ title: string; body: string }>;
    }
  | {
      kind: "ctaStage";
      title: string;
      body: string;
    };

export type LandingConcept = {
  slug: string;
  name: string;
  kicker: string;
  headline: string;
  dek: string;
  scene: string;
  fontStack: string;
  heroMode: HeroMode;
  palette: SurfacePalette;
  heroChips: string[];
  heroPulse: Array<{ label: string; value: string }>;
  primaryCTA: string;
  secondaryCTA: string;
  sections: SectionBlock[];
};

const palette = (value: SurfacePalette): SurfacePalette => value;

const comparisonRows = [
  { label: "Source", trusted: "Visit-linked", noisy: "Open internet" },
  { label: "Place", trusted: "Exact outlet", noisy: "Often vague" },
  { label: "Reply", trusted: "Owner attached", noisy: "Detached thread" },
];

export const landingConcepts = [
  {
    slug: "night-audit",
    name: "Night Audit",
    kicker: "After-hours ops board",
    headline: "Close the day with proof, not guesswork.",
    dek: "Built like a late-shift review wall for operators scanning exceptions fast.",
    scene: "Best for multi-outlet teams, post-service reviews, and close-of-day handoffs.",
    fontStack: "\"Avenir Next\", \"Segoe UI\", sans-serif",
    heroMode: "night-audit",
    palette: palette({
      canvas: "oklch(0.14 0.03 255)",
      canvasEnd: "oklch(0.18 0.03 248)",
      wash: "oklch(0.24 0.04 250)",
      ink: "oklch(0.95 0.01 255)",
      muted: "oklch(0.76 0.03 250)",
      panel: "oklch(0.2 0.03 250 / 0.92)",
      line: "oklch(0.68 0.07 74 / 0.24)",
      accent: "oklch(0.82 0.14 74)",
      accentSoft: "oklch(0.82 0.14 74 / 0.16)",
      spotlight: "oklch(0.72 0.08 210 / 0.18)",
    }),
    heroChips: ["Outlet view", "Issue clusters"],
    heroPulse: [
      { label: "Open loops", value: "3" },
      { label: "Strong outlets", value: "2" },
      { label: "Needs handoff", value: "Bandra" },
    ],
    primaryCTA: "Book night audit demo",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "signalBoard",
        title: "The page reads like a real close.",
        body: "Rows first. Story second.",
        rows: [
          { label: "Bandra", detail: "Dessert lag after 10 PM", status: "Review" },
          { label: "Powai", detail: "Host rotation fixed queue pain", status: "Up" },
          { label: "Koregaon", detail: "Breakfast praise holding", status: "Stable" },
          { label: "Indiranagar", detail: "Cold brew mentions rising", status: "Strong" },
        ],
      },
      {
        kind: "proofWall",
        title: "Trust stays compact.",
        body: "No ceremony. Just source clarity.",
        items: [
          { tag: "Visit", title: "Visit-linked intake", body: "Real guests" },
          { tag: "Owner", title: "Named recovery", body: "Clear owner" },
          { tag: "Shift", title: "Pattern view", body: "Team context" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Turn the closing hour into the next opening advantage.",
        body: "Sell the ritual, not another dashboard.",
      },
    ],
  },
  {
    slug: "signal-bazaar",
    name: "Signal Bazaar",
    kicker: "Local and lively",
    headline: "Small guest signals, one clear read.",
    dek: "A brighter, faster page for operators who live in counter traffic and repeat-customer energy.",
    scene: "Best for premium cafes, compact hospitality brands, and India-first storytelling.",
    fontStack: "\"Trebuchet MS\", \"Segoe UI\", sans-serif",
    heroMode: "signal-bazaar",
    palette: palette({
      canvas: "oklch(0.96 0.05 52)",
      canvasEnd: "oklch(0.9 0.06 36)",
      wash: "oklch(0.86 0.09 22)",
      ink: "oklch(0.2 0.03 28)",
      muted: "oklch(0.42 0.05 30)",
      panel: "oklch(0.98 0.02 60 / 0.86)",
      line: "oklch(0.44 0.12 28 / 0.24)",
      accent: "oklch(0.68 0.18 22)",
      accentSoft: "oklch(0.68 0.18 22 / 0.18)",
      spotlight: "oklch(0.8 0.14 70 / 0.24)",
    }),
    heroChips: ["Hinglish-ready", "Counter speed"],
    heroPulse: [
      { label: "Repeat crowd", value: "Back" },
      { label: "Coffee praise", value: "High" },
      { label: "Friction", value: "Sockets" },
    ],
    primaryCTA: "Start local pilot",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "quoteStack",
        title: "The voice should feel local on first read.",
        body: "Quick, familiar, unpolished in the right way.",
        quotes: [
          { byline: "Morning regular", quote: "Coffee solid tha. Charging points aur hote to aur rukte." },
          { byline: "Two-friend table", quote: "Service easy tha. Isi liye baar baar aate hain." },
          { byline: "Owner view", quote: "Regulars notice warmth before they notice marketing." },
        ],
      },
      {
        kind: "processLane",
        title: "The flow stays fast.",
        body: "Scan. Speak. Catch the pattern.",
        steps: [
          { title: "Scan", body: "At the counter" },
          { title: "Speak", body: "Short voice note" },
          { title: "Spot", body: "Repeat cues" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Build the page around the pace of the place.",
        body: "A lighter sell for operators who want energy, not enterprise polish.",
      },
    ],
  },
  {
    slug: "visit-receipt",
    name: "Visit Receipt",
    kicker: "Recorded proof",
    headline: "Make feedback feel itemized.",
    dek: "A receipt-style argument for why visit-based truth beats random review noise.",
    scene: "Best for trust-led sales, anti-fake positioning, and proof-heavy founders.",
    fontStack: "\"Courier New\", ui-monospace, monospace",
    heroMode: "visit-receipt",
    palette: palette({
      canvas: "oklch(0.95 0.008 85)",
      canvasEnd: "oklch(0.91 0.012 74)",
      wash: "oklch(0.82 0.03 70)",
      ink: "oklch(0.18 0.02 64)",
      muted: "oklch(0.42 0.02 62)",
      panel: "oklch(0.98 0.006 90 / 0.94)",
      line: "oklch(0.22 0.01 64 / 0.16)",
      accent: "oklch(0.64 0.18 28)",
      accentSoft: "oklch(0.64 0.18 28 / 0.12)",
      spotlight: "oklch(0.9 0.05 82 / 0.24)",
    }),
    heroChips: ["Visit-linked", "Outlet-stamped"],
    heroPulse: [
      { label: "Notes today", value: "42" },
      { label: "Risk caught", value: "Early" },
      { label: "Praise", value: "17" },
    ],
    primaryCTA: "View receipt demo",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "comparisonDeck",
        title: "The format changes the argument.",
        body: "Recorded beats vague.",
        rows: comparisonRows,
      },
      {
        kind: "proofWall",
        title: "Specificity carries the sale.",
        body: "Labels do the heavy lifting.",
        items: [
          { tag: "Line", title: "Moment trace", body: "Where it slipped" },
          { tag: "Outlet", title: "Location stamp", body: "Exact place" },
          { tag: "Reply", title: "Recovery attached", body: "Action shown" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Sell proof like evidence from the first fold.",
        body: "A sharper route for trust-first buyers.",
      },
    ],
  },
  {
    slug: "quiet-rescue",
    name: "Quiet Rescue",
    kicker: "Soft recovery system",
    headline: "Stop the complaint before it becomes the story.",
    dek: "A calm recovery page that feels steady instead of alarmed.",
    scene: "Best for hospitality teams that care about tone as much as speed.",
    fontStack: "Georgia, serif",
    heroMode: "quiet-rescue",
    palette: palette({
      canvas: "oklch(0.94 0.02 230)",
      canvasEnd: "oklch(0.9 0.025 220)",
      wash: "oklch(0.82 0.05 205)",
      ink: "oklch(0.22 0.025 235)",
      muted: "oklch(0.44 0.03 230)",
      panel: "oklch(0.98 0.01 235 / 0.88)",
      line: "oklch(0.5 0.05 220 / 0.2)",
      accent: "oklch(0.62 0.12 210)",
      accentSoft: "oklch(0.62 0.12 210 / 0.14)",
      spotlight: "oklch(0.96 0.02 240 / 0.26)",
    }),
    heroChips: ["Private first", "Named owner"],
    heroPulse: [
      { label: "Guest", value: "Retained" },
      { label: "Owner", value: "Assigned" },
      { label: "Public risk", value: "Reduced" },
    ],
    primaryCTA: "See rescue flow",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "processLane",
        title: "Recovery works best when the page feels composed.",
        body: "Low drama. Clear ownership.",
        steps: [
          { title: "Catch it", body: "Before checkout" },
          { title: "Own it", body: "One person" },
          { title: "Keep it", body: "For the next shift" },
        ],
      },
      {
        kind: "principleColumns",
        title: "The emotional promise matters.",
        body: "Calm can still convert.",
        columns: [
          { title: "Private first", body: "Easier outlet" },
          { title: "Specific follow-up", body: "Exact moment" },
          { title: "Team-safe learning", body: "No blame theatre" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Use a softer page to make a stronger recovery promise.",
        body: "For operators who want control without crisis visuals.",
      },
    ],
  },
  {
    slug: "tape-room",
    name: "Tape Room",
    kicker: "Voice-led archive",
    headline: "Keep the human tone intact.",
    dek: "A waveform-first concept where voice is the asset, not a side feature.",
    scene: "Best for founders selling the emotional clarity of voice feedback.",
    fontStack: "\"Gill Sans\", \"Trebuchet MS\", sans-serif",
    heroMode: "tape-room",
    palette: palette({
      canvas: "oklch(0.18 0.02 318)",
      canvasEnd: "oklch(0.24 0.03 310)",
      wash: "oklch(0.3 0.05 290)",
      ink: "oklch(0.95 0.01 320)",
      muted: "oklch(0.76 0.04 315)",
      panel: "oklch(0.24 0.02 318 / 0.9)",
      line: "oklch(0.7 0.08 340 / 0.18)",
      accent: "oklch(0.76 0.13 32)",
      accentSoft: "oklch(0.76 0.13 32 / 0.14)",
      spotlight: "oklch(0.68 0.07 285 / 0.2)",
    }),
    heroChips: ["Waveforms", "Transcript cuts"],
    heroPulse: [
      { label: "Playback", value: "1 tap" },
      { label: "Theme drift", value: "Flagged" },
      { label: "Phrase repeats", value: "Surfaced" },
    ],
    primaryCTA: "Open voice demo",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "quoteStack",
        title: "Recorded speech becomes the hero asset.",
        body: "Human cadence stays near the center.",
        quotes: [
          { byline: "Guest tape 14", quote: "The room was lovely. Check-in just felt ownerless." },
          { byline: "Guest tape 22", quote: "We came back because the barista remembered us." },
          { byline: "Operator note", quote: "Phrasing tells us if the issue is tone, timing, or product." },
        ],
      },
      {
        kind: "signalBoard",
        title: "The archive still needs structure.",
        body: "Romance backed by routing.",
        rows: [
          { label: "Repeat phrase", detail: "Check-in wait across three stays", status: "Clustered" },
          { label: "Positive pattern", detail: "Staff warmth beating room comments", status: "Strong" },
          { label: "Follow-up", detail: "Arrival-path complaint needs owner", status: "Pending" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Sell the operator on hearing the real thing first.",
        body: "For buyers who want voice to feel central.",
      },
    ],
  },
  {
    slug: "district-board",
    name: "District Board",
    kicker: "Chain territory view",
    headline: "Think in districts, not isolated notes.",
    dek: "A regional view for chain operators who compare neighborhoods before they read transcripts.",
    scene: "Best for franchise groups, regional teams, and outlet-by-outlet oversight.",
    fontStack: "\"Segoe UI\", sans-serif",
    heroMode: "district-board",
    palette: palette({
      canvas: "oklch(0.17 0.02 198)",
      canvasEnd: "oklch(0.21 0.025 206)",
      wash: "oklch(0.28 0.05 180)",
      ink: "oklch(0.95 0.01 210)",
      muted: "oklch(0.76 0.03 205)",
      panel: "oklch(0.22 0.02 205 / 0.92)",
      line: "oklch(0.64 0.08 170 / 0.2)",
      accent: "oklch(0.8 0.14 164)",
      accentSoft: "oklch(0.8 0.14 164 / 0.12)",
      spotlight: "oklch(0.64 0.06 190 / 0.18)",
    }),
    heroChips: ["Zone trends", "Outlet ranking"],
    heroPulse: [
      { label: "South", value: "Drift" },
      { label: "West", value: "Recovery up" },
      { label: "North", value: "Stable" },
    ],
    primaryCTA: "See chain demo",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "signalBoard",
        title: "Comparison comes before narrative.",
        body: "Territory first.",
        rows: [
          { label: "South", detail: "Check-in timing slipping across two sites", status: "Escalate" },
          { label: "West", detail: "Repeat visits climbing with stronger staff mentions", status: "Healthy" },
          { label: "Central", detail: "Queue issue isolated to one outlet", status: "Contained" },
          { label: "North", detail: "Cleanliness praise now a district edge", status: "Stable" },
        ],
      },
      {
        kind: "principleColumns",
        title: "Regional trust should look regional.",
        body: "Systemic drift stays distinct from local noise.",
        columns: [
          { title: "Compare districts", body: "Side by side" },
          { title: "Find outliers", body: "Before spread" },
          { title: "Drop to voice", body: "When needed" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Make chain oversight feel native to the page.",
        body: "Built for operators who already think in clusters.",
      },
    ],
  },
  {
    slug: "house-manual",
    name: "House Manual",
    kicker: "Boutique standard book",
    headline: "Let the standard read like the property.",
    dek: "A quieter hospitality route built around house rules, service discipline, and warm restraint.",
    scene: "Best for boutique hotels and refined hospitality brands that dislike dashboard language.",
    fontStack: "\"Palatino Linotype\", Palatino, serif",
    heroMode: "house-manual",
    palette: palette({
      canvas: "oklch(0.92 0.012 52)",
      canvasEnd: "oklch(0.88 0.018 44)",
      wash: "oklch(0.8 0.04 36)",
      ink: "oklch(0.22 0.02 40)",
      muted: "oklch(0.44 0.025 38)",
      panel: "oklch(0.96 0.008 56 / 0.9)",
      line: "oklch(0.46 0.05 36 / 0.18)",
      accent: "oklch(0.7 0.11 78)",
      accentSoft: "oklch(0.7 0.11 78 / 0.12)",
      spotlight: "oklch(0.9 0.03 70 / 0.22)",
    }),
    heroChips: ["House standard", "Quiet luxury"],
    heroPulse: [
      { label: "Arrival", value: "Needs polish" },
      { label: "Care", value: "Consistent" },
      { label: "Replies", value: "High-touch" },
    ],
    primaryCTA: "View house demo",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "principleColumns",
        title: "This page is built around standards, not excitement.",
        body: "Calm control is the pitch.",
        columns: [
          { title: "Arrival", body: "Fix the welcome" },
          { title: "Attention", body: "Protect the gestures" },
          { title: "Response", body: "Keep replies warm" },
        ],
      },
      {
        kind: "proofWall",
        title: "Restraint still needs proof.",
        body: "Tight labels. Clear source.",
        items: [
          { tag: "Stay", title: "Visit-linked stays", body: "Real guests" },
          { tag: "House", title: "Property patterns", body: "Local standard" },
          { tag: "Reply", title: "Visible follow-through", body: "Team sees it" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Bring the same discipline to the feedback layer.",
        body: "For hospitality brands that want composure more than software theatre.",
      },
    ],
  },
  {
    slug: "public-record",
    name: "Public Record",
    kicker: "Civic trust layer",
    headline: "Show the public where the record came from.",
    dek: "A discovery-led concept that frames reviews like sourced entries instead of floating opinions.",
    scene: "Best for long-term public review products and verified discovery stories.",
    fontStack: "\"Franklin Gothic Medium\", \"Arial Narrow\", sans-serif",
    heroMode: "public-record",
    palette: palette({
      canvas: "oklch(0.96 0.012 112)",
      canvasEnd: "oklch(0.91 0.02 104)",
      wash: "oklch(0.82 0.06 124)",
      ink: "oklch(0.18 0.02 120)",
      muted: "oklch(0.4 0.03 118)",
      panel: "oklch(0.98 0.006 115 / 0.92)",
      line: "oklch(0.44 0.08 122 / 0.18)",
      accent: "oklch(0.58 0.15 146)",
      accentSoft: "oklch(0.58 0.15 146 / 0.12)",
      spotlight: "oklch(0.86 0.05 150 / 0.22)",
    }),
    heroChips: ["Verified public layer", "Readable history"],
    heroPulse: [
      { label: "New this week", value: "26" },
      { label: "Owner replies", value: "Visible" },
      { label: "Fake noise", value: "Down" },
    ],
    primaryCTA: "Explore public layer",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "comparisonDeck",
        title: "Public trust becomes legible.",
        body: "Source quality, made visible.",
        rows: comparisonRows,
      },
      {
        kind: "proofWall",
        title: "Credibility comes from structure.",
        body: "Readers should know why the note belongs there.",
        items: [
          { tag: "Record", title: "Timestamp visible", body: "Entry format" },
          { tag: "Venue", title: "Place attached", body: "Context stays" },
          { tag: "Reply", title: "Operator included", body: "Action visible" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Make discovery feel sourced, not noisy.",
        body: "A route for the public platform thesis.",
      },
    ],
  },
  {
    slug: "counter-sprint",
    name: "Counter Sprint",
    kicker: "Compact conversion route",
    headline: "Put the product promise on one fast screen.",
    dek: "A short, forceful sales page for demo asks, pilot pitches, and founder-led outreach.",
    scene: "Best for high-intent traffic that should understand the product in seconds.",
    fontStack: "\"Helvetica Neue\", Arial, sans-serif",
    heroMode: "counter-sprint",
    palette: palette({
      canvas: "oklch(0.97 0.006 220)",
      canvasEnd: "oklch(0.92 0.018 220)",
      wash: "oklch(0.84 0.06 250)",
      ink: "oklch(0.18 0.02 240)",
      muted: "oklch(0.42 0.03 238)",
      panel: "oklch(0.99 0.004 225 / 0.92)",
      line: "oklch(0.44 0.08 240 / 0.16)",
      accent: "oklch(0.62 0.18 255)",
      accentSoft: "oklch(0.62 0.18 255 / 0.14)",
      spotlight: "oklch(0.76 0.12 242 / 0.18)",
    }),
    heroChips: ["One-screen pitch", "Fast CTA"],
    heroPulse: [
      { label: "Scan", value: "Instant" },
      { label: "Speak", value: "Short" },
      { label: "Act", value: "Owner-ready" },
    ],
    primaryCTA: "Book fast demo",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "processLane",
        title: "This page sells momentum.",
        body: "Shortest route, same trust model.",
        steps: [
          { title: "Put up the QR", body: "Where guests already are" },
          { title: "Get the note", body: "Faster than forms" },
          { title: "Move on it", body: "While it still matters" },
        ],
      },
      {
        kind: "proofWall",
        title: "The proof is compact on purpose.",
        body: "Tighter stack. Same signal.",
        items: [
          { tag: "Visit", title: "Verified source", body: "No random web noise" },
          { tag: "Speed", title: "Short capture path", body: "Low friction" },
          { tag: "Action", title: "Owner-ready output", body: "Next step clear" },
        ],
      },
      {
        kind: "ctaStage",
        title: "Put the whole pitch on one brisk page.",
        body: "Built for founder outreach and pilot asks.",
      },
    ],
  },
  {
    slug: "table-story",
    name: "Table Story",
    kicker: "Service-sequence lens",
    headline: "Read the meal like a sequence.",
    dek: "A restaurant-first page that thinks in moments: arrival, pacing, and last impression.",
    scene: "Best for operators who want hospitality language without luxury stiffness.",
    fontStack: "\"Book Antiqua\", Georgia, serif",
    heroMode: "table-story",
    palette: palette({
      canvas: "oklch(0.9 0.03 32)",
      canvasEnd: "oklch(0.84 0.04 26)",
      wash: "oklch(0.76 0.08 24)",
      ink: "oklch(0.2 0.03 24)",
      muted: "oklch(0.42 0.04 24)",
      panel: "oklch(0.95 0.012 38 / 0.9)",
      line: "oklch(0.48 0.08 20 / 0.18)",
      accent: "oklch(0.7 0.14 48)",
      accentSoft: "oklch(0.7 0.14 48 / 0.14)",
      spotlight: "oklch(0.84 0.08 60 / 0.2)",
    }),
    heroChips: ["Meal sequence", "Service memory"],
    heroPulse: [
      { label: "Seating", value: "Praised" },
      { label: "Dessert", value: "Lagged" },
      { label: "Return", value: "Likely" },
    ],
    primaryCTA: "See restaurant demo",
    secondaryCTA: "See all ten concepts",
    sections: [
      {
        kind: "processLane",
        title: "The page follows the visit like a dining sequence.",
        body: "Arrival. Middle. Last impression.",
        steps: [
          { title: "Arrival", body: "Mood gets set" },
          { title: "Middle", body: "Timing decides comfort" },
          { title: "Close", body: "Memory gets fixed" },
        ],
      },
      {
        kind: "quoteStack",
        title: "Guests remember a table as a story.",
        body: "Short fragments keep the arc visible.",
        quotes: [
          { byline: "Friday dinner", quote: "Mains landed well. Dessert took just long enough to become the story." },
          { byline: "Anniversary table", quote: "The staff felt attentive without hovering." },
          { byline: "Owner lens", quote: "The sequence tells us where the night bent." },
        ],
      },
      {
        kind: "ctaStage",
        title: "Let the page speak the language of service memory.",
        body: "For restaurant brands that want story and signal together.",
      },
    ],
  },
] as const satisfies readonly LandingConcept[];

export const landingConceptBySlug = new Map<string, LandingConcept>(
  landingConcepts.map((concept) => [concept.slug, concept]),
);

export function getLandingConcept(slug: string) {
  return landingConceptBySlug.get(slug) ?? null;
}
