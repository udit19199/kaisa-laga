"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { DASHBOARD_POLL_INTERVAL_MS } from "@/lib/constants";

interface Location {
  id: string;
  name: string;
}

export default function AnalyticsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sentimentData, setSentimentData] = useState<
    Array<{ date: string; Positive: number; Neutral: number; Negative: number }>
  >([]);
  const [categoryData, setCategoryData] = useState<
    Array<{ tag: string; count: number }>
  >([]);

  const fetchData = useCallback(async () => {
    const locParam = selectedLocation === "all" ? "" : `&locationId=${selectedLocation}`;

    const [locRes, sentRes, catRes] = await Promise.all([
      fetch("/api/locations"),
      fetch(`/api/analytics/sentiment?days=7${locParam}`),
      fetch(`/api/analytics/categories?days=7${locParam}`),
    ]);

    if (locRes.ok) {
      const data = await locRes.json();
      setLocations(data.locations ?? []);
    }
    if (sentRes.ok) {
      const data = await sentRes.json();
      setSentimentData(data.series ?? []);
    }
    if (catRes.ok) {
      const data = await catRes.json();
      setCategoryData(data.categories ?? []);
    }
  }, [selectedLocation]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, DASHBOARD_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sentiment (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Positive: { label: "Positive", color: "hsl(var(--chart-1))" },
                Neutral: { label: "Neutral", color: "hsl(var(--chart-2))" },
                Negative: { label: "Negative", color: "hsl(var(--chart-3))" },
              }}
              className="h-64 w-full"
            >
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="Positive" stroke="var(--color-Positive)" />
                <Line type="monotone" dataKey="Neutral" stroke="var(--color-Neutral)" />
                <Line type="monotone" dataKey="Negative" stroke="var(--color-Negative)" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Count", color: "hsl(var(--chart-1))" },
              }}
              className="h-64 w-full"
            >
              <BarChart data={categoryData.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="tag" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
