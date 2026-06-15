"use client";

import { type FormEvent, useState } from "react";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS_STORAGE_KEY = "kaisa-laga:venue-suggestions";

type DiscoverSearchContinuationProps = {
  areaLabel: string;
  query: string;
  className?: string;
};

function buildOwnerSharePayload() {
  const url = typeof window !== "undefined" ? window.location.origin : "https://kaisalaga.com";
  return {
    title: "Kaisa Laga",
    text: "We collect honest visit-based reviews for restaurants and cafes. Starting in Jaipur. If you run a spot, take a look.",
    url,
  };
}

function buildFriendSharePayload() {
  const url = typeof window !== "undefined" ? window.location.origin : "https://kaisalaga.com";
  return {
    title: "Kaisa Laga",
    text: "Honest restaurant reviews from real visits in Jaipur. Know a spot we should list?",
    url,
  };
}

export function DiscoverSearchContinuation({
  areaLabel,
  query,
  className,
}: DiscoverSearchContinuationProps) {
  const [submitted, setSubmitted] = useState(false);
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [note, setNote] = useState("");

  const trimmedQuery = query.trim();

  function handleSuggest() {
    if (!trimmedQuery) {
      return;
    }

    const entry = {
      name: trimmedQuery,
      note: note.trim() || null,
      area: areaLabel,
      suggestedAt: new Date().toISOString(),
    };

    try {
      const existing = window.localStorage.getItem(SUGGESTIONS_STORAGE_KEY);
      const list = existing ? (JSON.parse(existing) as unknown[]) : [];
      list.push(entry);
      window.localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Still show thanks if storage is unavailable.
    }

    setSubmitted(true);
    setNoteExpanded(false);
    setNote("");
  }

  function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSuggest();
  }

  function resetSuggestion() {
    setSubmitted(false);
    setNoteExpanded(false);
    setNote("");
  }

  return (
    <div
      className={cn(
        "border-t border-marketing-line/70 px-4 py-3 text-left lg:px-5 lg:py-3.5",
        className,
      )}
    >
      {submitted ? (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="m-0 text-sm text-marketing-ink">Noted — we&apos;ll look for it.</p>
          <button
            type="button"
            onClick={resetSuggestion}
            className="text-sm text-marketing-muted transition-colors hover:text-marketing-accent"
          >
            Search again
          </button>
        </div>
      ) : trimmedQuery ? (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm text-marketing-muted">
            Nothing in {areaLabel} for &ldquo;{trimmedQuery}&rdquo;
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={handleSuggest}
              className="text-sm font-medium text-marketing-accent transition-colors hover:text-marketing-ink"
            >
              We&apos;ll look for this
            </button>
            {!noteExpanded ? (
              <button
                type="button"
                onClick={() => setNoteExpanded(true)}
                className="text-sm text-marketing-muted transition-colors hover:text-marketing-ink"
              >
                Add a note
              </button>
            ) : null}
          </div>
          {noteExpanded ? (
            <form className="mt-0.5 flex gap-2" onSubmit={handleNoteSubmit}>
              <label className="sr-only" htmlFor="suggest-note">
                Why it is worth listing
              </label>
              <input
                id="suggest-note"
                type="text"
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Best filter coffee, worth the drive…"
                autoComplete="off"
                className={cn(
                  "min-w-0 flex-1 rounded-lg border border-marketing-line bg-marketing-card/50 px-3 py-2",
                  "text-sm text-marketing-ink outline-none placeholder:text-marketing-muted",
                  "focus:border-marketing-accent/45",
                )}
              />
              <button
                type="submit"
                className="shrink-0 text-sm font-medium text-marketing-accent transition-colors hover:text-marketing-ink"
              >
                Send
              </button>
            </form>
          ) : null}
        </div>
      ) : (
        <p className="m-0 text-sm text-marketing-muted">Nothing in {areaLabel} yet.</p>
      )}
    </div>
  );
}

type DiscoverShareUtilitiesProps = {
  className?: string;
};

export function DiscoverShareUtilities({ className }: DiscoverShareUtilitiesProps) {
  const [shareError, setShareError] = useState<string | null>(null);

  async function shareWithRestaurant() {
    setShareError(null);
    const payload = buildOwnerSharePayload();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(`${payload.text} ${payload.url}`);
      setShareError("Link copied.");
    } catch {
      setShareError("Could not share. Copy the link from your browser bar.");
    }
  }

  async function shareWithFriends() {
    setShareError(null);
    const payload = buildFriendSharePayload();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(`${payload.text} ${payload.url}`);
      setShareError("Link copied.");
    } catch {
      setShareError("Could not share. Copy the link from your browser bar.");
    }
  }

  return (
    <div className={cn("w-full text-center", className)}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={() => void shareWithRestaurant()}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm text-marketing-muted",
            "transition-colors hover:text-marketing-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketing-accent/40",
          )}
        >
          <Share2 className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Share with owner
        </button>
        <span className="text-marketing-line" aria-hidden>
          ·
        </span>
        <button
          type="button"
          onClick={() => void shareWithFriends()}
          className={cn(
            "text-sm text-marketing-muted",
            "transition-colors hover:text-marketing-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marketing-accent/40",
          )}
        >
          Tell a friend
        </button>
      </div>
      {shareError ? (
        <p className="m-0 mt-2 text-xs text-marketing-muted" role="status">
          {shareError}
        </p>
      ) : null}
    </div>
  );
}
