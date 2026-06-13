"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Inbox, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/liquid-glass";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_POLL_INTERVAL_MS } from "@/lib/constants";
import type { Sentiment } from "@/lib/constants";
import type { SubmissionInsights } from "@/lib/submission-insights";
import { formatDistanceToNow } from "date-fns";

interface Location {
  id: string;
  name: string;
}

interface SubmissionItem {
  id: string;
  status: string;
  transcript?: string | null;
  translated_transcript?: string | null;
  summary?: string | null;
  sentiment?: Sentiment | null;
  tags?: string[];
  created_at: string;
  locations: { id: string; name: string };
  insights: SubmissionInsights;
}

const sentimentVariant: Record<Sentiment, "default" | "secondary" | "destructive"> = {
  Positive: "default",
  Neutral: "secondary",
  Negative: "destructive",
};

const statusVariant: Record<SubmissionInsights["status"]["tone"], "default" | "secondary" | "destructive" | "outline"> = {
  default: "default",
  secondary: "secondary",
  destructive: "destructive",
  outline: "outline",
};

function InsightSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-background/80 p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <h4 className="mt-1 text-sm font-semibold text-foreground">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SubmissionAudio({ submissionId }: { submissionId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/submissions/${submissionId}/audio`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.url) setUrl(data.url);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  if (loading) {
    return <p className="text-xs text-muted-foreground">Loading audio…</p>;
  }

  if (!url) return null;

  return (
    <audio controls preload="none" src={url} className="h-8 w-full max-w-sm">
      <track kind="captions" />
    </audio>
  );
}

export function DashboardInbox() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("submission");
  const queryLocationId = searchParams.get("locationId");
  const highlightRef = useRef<HTMLDivElement>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [manualLocation, setManualLocation] = useState<string>("all");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageByLocation, setPageByLocation] = useState<Record<string, number>>({
    all: 1,
  });
  const [totalPages, setTotalPages] = useState(1);
  const selectedLocation = queryLocationId ?? manualLocation;
  const page = pageByLocation[selectedLocation] ?? 1;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const locParam = selectedLocation === "all" ? "" : `&locationId=${selectedLocation}`;
    const [locRes, subRes] = await Promise.all([
      fetch("/api/locations"),
      fetch(`/api/submissions?page=${page}${locParam}`),
    ]);

    if (locRes.ok) {
      const locData = await locRes.json();
      setLocations(locData.locations ?? []);
    }

    if (subRes.ok) {
      const subData = await subRes.json();
      setSubmissions(subData.items ?? []);
      setTotalPages(subData.totalPages ?? 1);
    }

    setLoading(false);
  }, [selectedLocation, page]);

  useEffect(() => {
    const runFetch = () => {
      void fetchData();
    };

    const initialFetch = setTimeout(runFetch, 0);
    const interval = setInterval(runFetch, DASHBOARD_POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchData]);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, submissions]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <Select
          value={selectedLocation}
          onValueChange={(v) => {
            const nextLocation = v ?? "all";
            setManualLocation(nextLocation);
            setPageByLocation((prev) => ({ ...prev, [nextLocation]: 1 }));
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border bg-card/50 text-muted-foreground shadow-sm">
            <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/5 blur-xl" />
            <Inbox className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight animate-fade-in">No feedback captured yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Deploy QR codes at your locations to start collecting real-time voice feedback from customers.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/locations">
              <Button className="cursor-pointer">
                <QrCode className="mr-2 h-4 w-4" />
                Go to Locations
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((sub) => (
            <GlassCard
              key={sub.id}
              ref={sub.id === highlightId ? highlightRef : undefined}
              className={
                sub.id === highlightId
                  ? "ring-2 ring-primary ring-offset-2"
                  : undefined
              }
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">
                    {sub.locations?.name ?? "Unknown location"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[sub.insights.status.tone]}>
                    {sub.insights.status.label}
                  </Badge>
                  {sub.insights.analysis.sentiment && (
                    <Badge variant={sentimentVariant[sub.insights.analysis.sentiment]}>
                      {sub.insights.analysis.sentiment}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <SubmissionAudio key={sub.id} submissionId={sub.id} />
                <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                  <InsightSection label="Insight summary" title="What the AI extracted">
                    {sub.insights.status.isComplete ? (
                      <>
                        <p className="text-sm font-medium text-foreground">
                          {sub.insights.analysis.summary ?? "Feedback received"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {sub.insights.analysis.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {sub.insights.status.code === "failed" ||
                        sub.insights.status.code === "terminal_failed"
                          ? sub.insights.processing.errorMessage ??
                            sub.insights.processing.latestError ??
                            "Processing failed."
                          : "Waiting for transcription and structured insight extraction."}
                      </p>
                    )}
                  </InsightSection>

                  <InsightSection label="Transcript" title="Speech converted to text">
                    {sub.insights.status.isComplete && sub.insights.transcript.display ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {sub.insights.transcript.language?.toUpperCase() ?? "Unknown language"}
                          </Badge>
                          <Badge variant="outline">English normalized</Badge>
                        </div>
                        <div className="space-y-3">
                          {sub.insights.transcript.original &&
                            sub.insights.transcript.original !== sub.insights.transcript.display && (
                              <div className="rounded-xl bg-muted/40 p-3">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                  Original
                                </p>
                                <p className="mt-2 text-sm leading-6 text-foreground">
                                  {sub.insights.transcript.original}
                                </p>
                              </div>
                            )}
                          <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                              English
                            </p>
                            <p className="mt-2 text-sm leading-6 text-foreground">
                              {sub.insights.transcript.display}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {sub.insights.status.code === "failed" ||
                        sub.insights.status.code === "terminal_failed"
                          ? "No structured transcript was produced."
                          : "Transcript will appear after processing completes."}
                      </p>
                    )}
                  </InsightSection>
                </div>

                {sub.insights.processing.errorMessage && (
                  <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {sub.insights.processing.errorMessage}
                  </div>
                )}
              </CardContent>
            </GlassCard>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() =>
                  setPageByLocation((prev) => ({
                    ...prev,
                    [selectedLocation]: Math.max(1, (prev[selectedLocation] ?? 1) - 1),
                  }))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setPageByLocation((prev) => ({
                    ...prev,
                    [selectedLocation]: (prev[selectedLocation] ?? 1) + 1,
                  }))
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
