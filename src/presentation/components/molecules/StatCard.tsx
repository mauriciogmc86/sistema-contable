import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";
import { cn } from "@/presentation/utils/cn";

type Tone = "primary" | "success" | "danger" | "warning" | "info" | "accent";

const toneStyles: Record<Tone, string> = {
  primary: "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm shadow-primary/30",
  success: "bg-gradient-to-br from-success to-success/70 text-white shadow-sm shadow-success/30",
  danger: "bg-gradient-to-br from-danger to-danger/70 text-white shadow-sm shadow-danger/30",
  warning: "bg-gradient-to-br from-warning to-warning/70 text-white shadow-sm shadow-warning/30",
  info: "bg-gradient-to-br from-info to-info/70 text-white shadow-sm shadow-info/30",
  accent: "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-sm shadow-accent/30",
};

const glowStyles: Record<Tone, string> = {
  primary: "bg-primary/15",
  success: "bg-success/15",
  danger: "bg-danger/15",
  warning: "bg-warning/15",
  info: "bg-info/15",
  accent: "bg-accent/15",
};

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  trend?: { value: string; positive: boolean };
  loading?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, tone = "primary", trend, loading, className }: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("p-5", className)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-7 w-32" />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "card-sheen group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60",
          glowStyles[tone],
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", toneStyles[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="relative mt-4 text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
      {trend && (
        <p
          className={cn(
            "relative mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            trend.positive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger",
          )}
        >
          {trend.positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
          )}
          {trend.value}
        </p>
      )}
    </Card>
  );
}
