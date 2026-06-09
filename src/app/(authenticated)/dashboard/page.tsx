"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Banknote, Receipt, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { ACCOUNTING_COMPANY_ID } from "@/presentation/config/accounting";
import { Button } from "@/presentation/components/atoms/Button";
import { Badge } from "@/presentation/components/atoms/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/molecules/Card";
import { StatCard } from "@/presentation/components/molecules/StatCard";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { ErrorState } from "@/presentation/components/molecules/ErrorState";
import { Chart, type ChartDatum } from "@/presentation/components/organisms/Chart";
import { useDashboardMetrics, useJournalEntries } from "@/presentation/hooks";
import { formatCurrency, formatDate } from "@/presentation/utils/format";

export default function DashboardPage() {
  const metrics = useDashboardMetrics(ACCOUNTING_COMPANY_ID);
  const entries = useJournalEntries(ACCOUNTING_COMPANY_ID);

  const chartData = useMemo<ChartDatum[]>(() => {
    const list = entries.data ?? [];
    const byMonth = new Map<string, number>();
    for (const e of list) {
      const month = e.date.slice(0, 7);
      const total = e.lines.reduce((s, l) => s + l.debit, 0);
      byMonth.set(month, (byMonth.get(month) ?? 0) + total);
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));
  }, [entries.data]);

  const recent = useMemo(
    () =>
      [...(entries.data ?? [])]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [entries.data],
  );

  const m = metrics.data;

  return (
    <div className="space-y-6">
      <section className="bg-aurora relative overflow-hidden rounded-2xl p-6 text-white sm:p-8">
        <div className="bg-grid absolute inset-0 text-white/60" aria-hidden />
        <div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float-slow"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              Panel de control
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Resumen contable del período
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Visualiza ingresos, gastos y movimientos recientes de tus operaciones en un solo vistazo.
            </p>
          </div>
          <Link href="/dashboard/libro-diario/nuevo" className="shrink-0">
            <Button className="bg-white text-primary shadow-lg hover:bg-white/90">Nuevo asiento</Button>
          </Link>
        </div>
      </section>

      {metrics.error ? (
        <ErrorState description={metrics.error} onRetry={metrics.reload} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Ingresos del mes"
            value={formatCurrency(m?.monthlyIncome ?? 0)}
            icon={TrendingUp}
            tone="success"
            loading={metrics.loading}
          />
          <StatCard
            label="Gastos del mes"
            value={formatCurrency(m?.monthlyExpenses ?? 0)}
            icon={TrendingDown}
            tone="danger"
            loading={metrics.loading}
          />
          <StatCard
            label="Balance"
            value={formatCurrency(m?.balance ?? 0)}
            icon={Scale}
            tone="info"
            loading={metrics.loading}
          />
          <StatCard
            label="Asientos registrados"
            value={String(m?.entryCount ?? 0)}
            icon={Receipt}
            tone="primary"
            loading={metrics.loading}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Movimiento mensual</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.error ? (
              <ErrorState description={entries.error} onRetry={entries.reload} />
            ) : chartData.length === 0 ? (
              <EmptyState icon={Banknote} title="Sin movimientos" description="Aún no hay asientos para graficar." />
            ) : (
              <Chart type="bar" data={chartData} valueFormatter={(v) => formatCurrency(v)} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Asientos recientes</CardTitle>
            <Link
              href="/dashboard/libro-diario"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todo <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <EmptyState title="Sin asientos" description="Crea tu primer asiento contable." />
            ) : (
              <ul className="-mx-2 space-y-1">
                {recent.map((e) => {
                  const total = e.lines.reduce((s, l) => s + l.debit, 0);
                  return (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Receipt className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{e.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(total)}
                        </span>
                        <Badge tone="success">Balanceado</Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
