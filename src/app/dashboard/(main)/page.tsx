"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardInboxPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const locParam = selectedLocation === "all" ? "" : `&locationId=${selectedLocation}`;
    const [locRes, subRes] = await Promise.all([
      fetch("/api/locations"),
      fetch(`/api/submissions?page=1${locParam}`),
    ]);

    if (locRes.ok) {
      const locData = await locRes.json();
      setLocations(locData.locations ?? []);
    }

    if (subRes.ok) {
      const subData = await subRes.json();
      setSubmissions(subData.items ?? []);
    }

    setLoading(false);
  }, [selectedLocation]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, DASHBOARD_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <Select
          value={selectedLocation}
          onValueChange={(v) => setSelectedLocation(v ?? "all")}
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
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No submissions yet. Deploy QR codes to start collecting feedback.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((sub) => (
            <Card key={sub.id}>
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
