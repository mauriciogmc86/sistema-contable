"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartDatum {
  label: string;
  value: number;
}

export interface ChartImplProps {
  type: "bar" | "area";
  data: ChartDatum[];
  height?: number;
  colorVar?: string;
  valueFormatter?: (value: number) => string;
}

const axisStyle = { fontSize: 12, fill: "var(--color-muted-foreground)" };

export default function ChartImpl({
  type,
  data,
  height = 280,
  colorVar = "var(--color-primary)",
  valueFormatter,
}: ChartImplProps) {
  const tooltipStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    color: "var(--color-foreground)",
    fontSize: 13,
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === "bar" ? (
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorVar} stopOpacity={0.95} />
              <stop offset="100%" stopColor={colorVar} stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={56} />
          <Tooltip
            cursor={{ fill: "var(--color-muted)", opacity: 0.4, radius: 6 }}
            contentStyle={tooltipStyle}
            formatter={(value: number | string | ReadonlyArray<number | string> | undefined) =>
              valueFormatter ? valueFormatter(Number(value)) : String(value ?? "")
            }
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={72}>
            {data.map((_, i) => (
              <Cell key={i} fill="url(#barFill)" />
            ))}
          </Bar>
        </BarChart>
      ) : (
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorVar} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colorVar} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={56} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number | string | ReadonlyArray<number | string> | undefined) =>
              valueFormatter ? valueFormatter(Number(value)) : String(value ?? "")
            }
          />
          <Area type="monotone" dataKey="value" stroke={colorVar} strokeWidth={2} fill="url(#areaFill)" />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}
