"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrganization } from "@clerk/nextjs";
import {
  Calendar,
  Inbox,
  TrendingUp,
  AlertCircle,
  QrCode,
  AudioLines,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_POLL_INTERVAL_MS } from "@/lib/constants";

interface Location {
  id: string;
  name: string;
}

interface LocationBreakdownItem {
  locationId: string;
  total: number;
  Positive: number;
  Neutral: number;
  Negative: number;
  daily: Array<{
    date: string;
    total: number;
    Positive: number;
    Neutral: number;
    Negative: number;
  }>;
}

function Sparkline({
  data,
  width = 120,
  height = 30,
  color = "hsl(var(--primary))",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function OverviewPage() {
  const { organization } = useOrganization();
  const orgName = organization?.name ?? "your business";

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [days, setDays] = useState("30"); // Defaults to a month
  const [sentimentData, setSentimentData] = useState<
    Array<{ date: string; Positive: number; Neutral: number; Negative: number }>
  >([]);
  const [locationsBreakdown, setLocationsBreakdown] = useState<
    LocationBreakdownItem[]
  >([]);
  const [categoryData, setCategoryData] = useState<
    Array<{ tag: string; count: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const locParam = selectedLocation === "all" ? "" : `&locationId=${selectedLocation}`;

    const [locRes, sentRes, catRes] = await Promise.all([
      fetch("/api/locations"),
      fetch(`/api/analytics/sentiment?days=${days}${locParam}`),
      fetch(`/api/analytics/categories?days=${days}${locParam}`),
    ]);

    if (locRes.ok) {
      const data = await locRes.json();
      setLocations(data.locations ?? []);
    }
    if (sentRes.ok) {
      const data = await sentRes.json();
      setSentimentData(data.series ?? []);
      setLocationsBreakdown(data.locationsBreakdown ?? []);
    }
    if (catRes.ok) {
      const data = await catRes.json();
      setCategoryData(data.categories ?? []);
    }
    setLoading(false);
  }, [selectedLocation, days]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, DASHBOARD_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculations for KPI Cards
  const totalFeedback = sentimentData.reduce(
    (acc, curr) => acc + curr.Positive + curr.Neutral + curr.Negative,
    0
  );
  const totalPositive = sentimentData.reduce((acc, curr) => acc + curr.Positive, 0);
  const totalNeutral = sentimentData.reduce((acc, curr) => acc + curr.Neutral, 0);
  const totalNegative = sentimentData.reduce((acc, curr) => acc + curr.Negative, 0);

  const positiveRate =
    totalFeedback > 0 ? ((totalPositive / totalFeedback) * 100).toFixed(1) : "0.0";

  const activeLocationsCount = locationsBreakdown.filter((l) => l.total > 0).length;
  const activeLocationsStr = `${activeLocationsCount} of ${locations.length}`;

  const selectedLocationName =
    selectedLocation === "all"
      ? null
      : locations.find((l) => l.id === selectedLocation)?.name;

  // Sparkline data mapping
  const totalFeedbackSeries = sentimentData.map(
    (d) => d.Positive + d.Neutral + d.Negative
  );
  const positiveRateSeries = sentimentData.map((d) => d.Positive);
  const neutralSeries = sentimentData.map((d) => d.Neutral);
  const negativeSeries = sentimentData.map((d) => d.Negative);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedLocationName
              ? `Overview for ${selectedLocationName}`
              : `All locations for ${orgName}`}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Dynamic Date Filter Selector */}
          <Select value={days} onValueChange={(v) => v && setDays(v)}>
            <SelectTrigger className="w-[150px] shadow-sm font-medium gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedLocation}
            onValueChange={(v) => setSelectedLocation(v ?? "all")}
          >
            <SelectTrigger className="w-48 shadow-sm">
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
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Feedback */}
        <Card className="flex flex-col justify-between overflow-hidden shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Feedback
            </p>
            <h2 className="text-3xl font-bold mt-1 tracking-tight">
              {loading ? <Skeleton className="h-8 w-16" /> : totalFeedback}
            </h2>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="h-8 flex items-end">
              {loading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <Sparkline data={totalFeedbackSeries} color="oklch(0.55 0.01 45)" width={160} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Positive Rate */}
        <Card className="flex flex-col justify-between overflow-hidden shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Positive Rate
            </p>
            <h2 className="text-3xl font-bold mt-1 tracking-tight text-primary">
              {loading ? <Skeleton className="h-8 w-24" /> : `${positiveRate}%`}
            </h2>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="h-8 flex items-end">
              {loading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <Sparkline data={positiveRateSeries} color="oklch(0.70 0.12 150)" width={160} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Locations */}
        <Card className="flex flex-col justify-between overflow-hidden shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Locations
            </p>
            <h2 className="text-3xl font-bold mt-1 tracking-tight">
              {loading ? <Skeleton className="h-8 w-28" /> : activeLocationsStr}
            </h2>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="h-8 flex items-end">
              {loading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <Sparkline data={neutralSeries} color="oklch(0.55 0.01 45)" width={160} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Negative Feedback */}
        <Card className="flex flex-col justify-between overflow-hidden shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Negative Feedback
            </p>
            <h2 className="text-3xl font-bold mt-1 tracking-tight">
              {loading ? <Skeleton className="h-8 w-12" /> : totalNegative}
            </h2>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="h-8 flex items-end">
              {loading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <Sparkline data={negativeSeries} color="oklch(0.55 0.01 45)" width={160} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Visual Section (Daily Trend on Left, Locations Breakdown on Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Daily Sentiment Line Chart */}
        <Card className="lg:col-span-7 xl:col-span-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Daily Sentiment Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : sentimentData.every(
                (d) => d.Positive === 0 && d.Neutral === 0 && d.Negative === 0
              ) ? (
              <div className="flex h-64 flex-col items-center justify-center gap-4 text-center border border-dashed border-muted-foreground/10 rounded-2xl bg-card/10 p-6 animate-fade-in">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-card to-muted/20 border border-muted-foreground/10 shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-60" />
                  <AudioLines className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="max-w-xs">
                  <p className="text-sm font-semibold text-foreground">Waiting to hear from your customers...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No voice notes recorded in this period. Share your location's QR code to start listening!
                  </p>
                </div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  Positive: { label: "Positive", color: "oklch(0.72 0.19 155)" },
                  Neutral: { label: "Neutral", color: "oklch(0.84 0.048 227)" },
                  Negative: { label: "Negative", color: "oklch(0.64 0.16 38)" },
                }}
                className="h-64 w-full"
              >
                <LineChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => v.slice(5)}
                    stroke="currentColor"
                    fontSize={11}
                    opacity={0.7}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="currentColor"
                    fontSize={11}
                    opacity={0.7}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="Positive"
                    stroke="var(--color-Positive)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Neutral"
                    stroke="var(--color-Neutral)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Negative"
                    stroke="var(--color-Negative)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Locations Breakdown Table */}
        <Card className="lg:col-span-5 xl:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5 text-muted-foreground" />
              Locations Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : locationsBreakdown.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No locations configured.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Location</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Positive</TableHead>
                      <TableHead className="w-[100px] text-center pr-4">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationsBreakdown.map((item) => {
                      const locationName =
                        locations.find((l) => l.id === item.locationId)?.name ??
                        "Unknown";
                      const posRate =
                        item.total > 0
                          ? ((item.Positive / item.total) * 100).toFixed(0)
                          : "0";
                      const trendData = item.daily.map((d) => d.total);

                      return (
                        <TableRow key={item.locationId}>
                          <TableCell className="font-semibold text-sm pl-4 truncate max-w-[120px]">
                            {locationName}
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">
                            {item.total}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                item.Positive > item.Negative
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : item.Negative > item.Positive
                                  ? "bg-rose-500/10 text-rose-500"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {posRate}%
                            </span>
                          </TableCell>
                          <TableCell className="py-2 pr-4 text-center">
                            <div className="inline-flex items-center justify-center">
                              <Sparkline
                                data={trendData}
                                width={60}
                                height={18}
                                color="hsl(var(--primary))"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories / Tags Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Top Categories & Tags ({days} days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : categoryData.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-4 text-center border border-dashed border-muted-foreground/10 rounded-2xl bg-card/10 p-6 animate-fade-in">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-card to-muted/20 border border-muted-foreground/10 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-60" />
                <AudioLines className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="max-w-xs">
                <p className="text-sm font-semibold text-foreground">Quiet on categories</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Once customers speak, AI-extracted tags and categories will automatically appear here.
                </p>
              </div>
            </div>
          ) : (
            <ChartContainer
              config={{
                count: { label: "Count", color: "hsl(var(--primary))" },
              }}
              className="h-64 w-full"
            >
              <BarChart data={categoryData.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" allowDecimals={false} stroke="currentColor" fontSize={11} opacity={0.7} />
                <YAxis type="category" dataKey="tag" width={100} stroke="currentColor" fontSize={11} opacity={0.7} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
