"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Calendar,
  TrendingUp,
  AlertCircle,
  QrCode,
  AudioLines,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
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
  color = "var(--primary)",
  ariaLabel = "Trend sparkline",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  ariaLabel?: string;
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
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>
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

const overviewCardClass =
  "overflow-hidden rounded-none border-2 border-[var(--border-card)] bg-[var(--bg-card)] shadow-[3px_3px_0px_var(--border-card)] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--text-main)]";

const overviewSectionClass =
  "rounded-none border-2 border-[var(--border-card)] bg-[var(--bg-card)] shadow-[3px_3px_0px_var(--border-card)]";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-light)] font-mono">
      {children}
    </p>
  );
}

function MetricCard({
  label,
  value,
  trendLabel,
  sparkline,
  sparklineColor,
  loading,
  valueClassName = "",
}: {
  label: string;
  value: string | number;
  trendLabel: string;
  sparkline: number[];
  sparklineColor: string;
  loading: boolean;
  valueClassName?: string;
}) {
  return (
    <Card className={overviewCardClass}>
      <CardHeader className="pb-2">
        <SectionLabel>{label}</SectionLabel>
        <h2 className={`mt-2 text-3xl font-semibold tracking-tight text-[var(--text-main)] ${valueClassName}`}>
          {loading ? <Skeleton className="h-8 w-24" /> : value}
        </h2>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="flex flex-col gap-2">
          <div className="flex h-9 items-end">
            {loading ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <Sparkline data={sparkline} color={sparklineColor} width={170} />
            )}
          </div>
          {!loading && <p className="text-[11px] font-medium text-[var(--text-light)]">{trendLabel}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { organization } = useOrganization();
  const orgName = organization?.name ?? "your business";
  const router = useRouter();

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
    setLoading(true);
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
    const timeout = window.setTimeout(() => {
      void fetchData();
    }, 0);
    const interval = setInterval(fetchData, DASHBOARD_POLL_INTERVAL_MS);
    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchData]);

  // Calculations for KPI Cards
  const totalFeedback = sentimentData.reduce(
    (acc, curr) => acc + curr.Positive + curr.Neutral + curr.Negative,
    0
  );
  const totalPositive = sentimentData.reduce((acc, curr) => acc + curr.Positive, 0);
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
  const negativeSeries = sentimentData.map((d) => d.Negative);

  const dailyActiveLocationsSeries = sentimentData.map((d) => {
    const targetDate = d.date;
    return locationsBreakdown.filter((loc) => {
      const dayData = loc.daily.find((day) => day.date === targetDate);
      return dayData ? dayData.total > 0 : false;
    }).length;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className={`${overviewSectionClass} p-5 md:p-6`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <BrandMark className="size-9" imageClassName="h-5 w-5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold tracking-[0.18em] uppercase text-[var(--text-main)]">
                  Kaisa Laga
                </span>
                <span className="text-xs text-[var(--text-light)]">
                  Production dashboard
                </span>
              </div>
            </div>
            <SectionLabel>Live overview</SectionLabel>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-main)] md:text-[2.6rem]">
            {selectedLocationName
              ? `Overview for ${selectedLocationName}`
              : `All locations for ${orgName}`}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-light)]">
              Preview-style surfaces, structured cards, and live sentiment data in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={days} onValueChange={(v) => v && setDays(v)}>
              <SelectTrigger className="w-[150px] gap-2 rounded-none border-2 border-[var(--border-card)] bg-[var(--bg-card)] shadow-[2px_2px_0px_var(--border-card)] font-medium text-[var(--text-main)]">
                <Calendar className="h-3.5 w-3.5 text-[var(--text-light)]" />
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
              <SelectTrigger className="w-48 rounded-none border-2 border-[var(--border-card)] bg-[var(--bg-card)] shadow-[2px_2px_0px_var(--border-card)] font-medium text-[var(--text-main)]">
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
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total feedback"
          value={totalFeedback}
          trendLabel={`${days}d feedback volume trend`}
          sparkline={totalFeedbackSeries}
          sparklineColor="var(--brand-muted)"
          loading={loading}
        />
        <MetricCard
          label="Positive rate"
          value={`${positiveRate}%`}
          trendLabel={`${days}d positive rate trend`}
          sparkline={positiveRateSeries}
          sparklineColor="var(--brand-live)"
          loading={loading}
          valueClassName="text-primary"
        />
        <MetricCard
          label="Active locations"
          value={activeLocationsStr}
          trendLabel={`${days}d active locations trend`}
          sparkline={dailyActiveLocationsSeries}
          sparklineColor="var(--brand-accent)"
          loading={loading}
        />
        <MetricCard
          label="Negative feedback"
          value={totalNegative}
          trendLabel={`${days}d negative volume trend`}
          sparkline={negativeSeries}
          sparklineColor="var(--destructive)"
          loading={loading}
        />
      </div>

      {/* Main Visual Section (Daily Trend on Left, Locations Breakdown on Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Daily Sentiment Line Chart */}
        <Card className={`${overviewSectionClass} lg:col-span-7 xl:col-span-8`}>
          <CardHeader>
            <SectionLabel>Trend</SectionLabel>
            <CardTitle className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--text-main)]">
              <TrendingUp className="h-5 w-5 text-[var(--text-light)]" />
              Daily sentiment trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : sentimentData.every(
                (d) => d.Positive === 0 && d.Neutral === 0 && d.Negative === 0
              ) ? (
              <div className="flex h-64 flex-col items-center justify-center gap-4 border-2 border-dashed border-[var(--border-card)] bg-[var(--bg-surface)] p-6 text-center animate-fade-in">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-none border-2 border-[var(--border-card)] bg-[var(--bg-card)] shadow-[3px_3px_0px_var(--border-card)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-60" />
                  <AudioLines className="h-6 w-6 animate-pulse text-primary" />
                </div>
                <div className="max-w-xs">
                  <p className="text-sm font-semibold text-[var(--text-main)]">
                    Waiting to hear from your customers...
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-light)]">
                    No voice notes recorded in this period. Share your location&apos;s QR code to start listening!
                  </p>
                </div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  Positive: { label: "Positive", color: "var(--brand-live)" },
                  Neutral: { label: "Neutral", color: "var(--brand-sky)" },
                  Negative: { label: "Negative", color: "var(--destructive)" },
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
        <Card className={`${overviewSectionClass} lg:col-span-5 xl:col-span-4`}>
          <CardHeader>
            <SectionLabel>Locations</SectionLabel>
            <CardTitle className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--text-main)]">
              <QrCode className="h-5 w-5 text-[var(--text-light)]" />
              Locations breakdown
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
              <div className="p-8 text-center text-sm text-[var(--text-light)]">
                No locations configured.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-light)]">
                        Location
                      </TableHead>
                      <TableHead className="text-right font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-light)]">
                        Total
                      </TableHead>
                      <TableHead className="text-right font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-light)]">
                        Positive
                      </TableHead>
                      <TableHead className="w-[100px] pr-4 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-light)]">
                        Trend
                      </TableHead>
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
                        <TableRow
                          key={item.locationId}
                          className="group cursor-pointer transition-colors hover:bg-[var(--bg-surface)]"
                          onClick={() =>
                            router.push(`/dashboard/inbox?locationId=${item.locationId}`)
                          }
                        >
                          <TableCell className="max-w-[120px] truncate pl-4 text-sm font-semibold text-[var(--text-main)] transition-colors group-hover:text-primary">
                            {locationName}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-[var(--text-main)]">
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
                                color="var(--primary)"
                                ariaLabel={`Daily volume trend for ${locationName}`}
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
      <Card className={overviewSectionClass}>
        <CardHeader>
          <SectionLabel>Insights</SectionLabel>
          <CardTitle className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--text-main)]">
            <AlertCircle className="h-5 w-5 text-[var(--text-light)]" />
            Top categories and tags ({days} days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : categoryData.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-4 border-2 border-dashed border-[var(--border-card)] bg-[var(--bg-surface)] p-6 text-center animate-fade-in">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-none border-2 border-[var(--border-card)] bg-[var(--bg-card)] shadow-[3px_3px_0px_var(--border-card)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-60" />
                <AudioLines className="h-5 w-5 animate-pulse text-primary" />
              </div>
              <div className="max-w-xs">
                <p className="text-sm font-semibold text-[var(--text-main)]">
                  Quiet on categories
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-light)]">
                  Once customers speak, AI-extracted tags and categories will automatically appear here.
                </p>
              </div>
            </div>
          ) : (
            <ChartContainer
              config={{
                count: { label: "Count", color: "var(--primary)" },
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
