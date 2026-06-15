"use client";

import dynamic from "next/dynamic";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Dynamically import Recharts components
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);

export function SentimentLineChart({
  data,
}: {
  data: Array<{ date: string; Positive: number; Neutral: number; Negative: number }>;
}) {
  return (
    <ChartContainer
      config={{
        Positive: { label: "Positive", color: "var(--brand-live)" },
        Neutral: { label: "Neutral", color: "var(--brand-muted)" },
        Negative: { label: "Negative", color: "var(--destructive)" },
      }}
      className="h-64 w-full"
    >
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => v.slice(5)}
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
  );
}

export function CategoryBarChart({
  data,
}: {
  data: Array<{ tag: string; count: number }>;
}) {
  return (
    <ChartContainer
      config={{
        count: { label: "Count", color: "var(--primary)" },
      }}
      className="h-64 w-full"
    >
      <BarChart data={data.slice(0, 8)} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
        <XAxis type="number" allowDecimals={false} stroke="currentColor" fontSize={11} opacity={0.7} />
        <YAxis type="category" dataKey="tag" width={100} stroke="currentColor" fontSize={11} opacity={0.7} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
