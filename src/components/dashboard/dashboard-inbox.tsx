"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
import { formatDistanceToNow } from "date-fns";

interface Location {
  id: string;
  name: string;
}

interface SubmissionItem {
  id: string;
  status: string;
  transcript: string | null;
  translated_transcript: string | null;
  summary: string | null;
  sentiment: Sentiment | null;
  tags: string[];
  created_at: string;
  locations: { id: string; name: string };
}

const sentimentVariant: Record<Sentiment, "default" | "secondary" | "destructive"> = {
  Positive: "default",
  Neutral: "secondary",
  Negative: "destructive",
};

function SubmissionAudio({ submissionId }: { submissionId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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

  return <audio controls preload="none" src={url} className="h-8 w-full max-w-sm" />;
}

export function DashboardInbox() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("submission");
  const highlightRef = useRef<HTMLDivElement>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
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
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, DASHBOARD_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
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
            setSelectedLocation(v ?? "all");
            setPage(1);
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
        <GlassCard>
          <CardContent className="py-12 text-center text-muted-foreground">
            No submissions yet. Deploy QR codes to start collecting feedback.
          </CardContent>
        </GlassCard>
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
                  {sub.sentiment && (
                    <Badge variant={sentimentVariant[sub.sentiment]}>
                      {sub.sentiment}
                    </Badge>
                  )}
                  <Badge variant="outline">{sub.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <SubmissionAudio submissionId={sub.id} />
                {sub.summary && (
                  <p className="text-sm font-medium">{sub.summary}</p>
                )}
                {(sub.translated_transcript || sub.transcript) && (
                  <p className="text-sm text-muted-foreground">
                    {sub.translated_transcript ?? sub.transcript}
                  </p>
                )}
                {sub.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sub.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
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
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
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
