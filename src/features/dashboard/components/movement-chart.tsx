"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MovementPoint } from "@/features/dashboard/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TooltipEntry = {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
};

type Series = { key: "in" | "out"; label: string; color: string };

function ChartTooltip({
  active,
  payload,
  label,
  series,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  series: Series[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {series.map((s) => {
        const entry = payload.find((p) => p.dataKey === s.key);
        return (
          <p key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            {s.label}: <span className="tabular-nums">{entry?.value ?? 0}</span>
          </p>
        );
      })}
    </div>
  );
}

export function MovementChart({
  data,
  title,
  seriesInLabel,
  seriesOutLabel,
}: {
  data: MovementPoint[];
  title: string;
  seriesInLabel: string;
  seriesOutLabel: string;
}) {
  const series: Series[] = [
    { key: "in", label: seriesInLabel, color: "var(--viz-in)" },
    { key: "out", label: seriesOutLabel, color: "var(--viz-out)" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={32}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                content={<ChartTooltip series={series} />}
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
