"use client";

import { useMemo, useState } from "react";
import { AccountType, type Account } from "@/domain/entities";
import { ACCOUNTING_COMPANY_ID } from "@/presentation/config/accounting";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/molecules/Card";
import { StatCard } from "@/presentation/components/molecules/StatCard";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { ErrorState } from "@/presentation/components/molecules/ErrorState";
import { TableSkeleton } from "@/presentation/components/molecules/Skeleton";
import { Chart, type ChartDatum } from "@/presentation/components/organisms/Chart";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { useAccounts, useJournalEntries } from "@/presentation/hooks";
import { formatCurrency } from "@/presentation/utils/format";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/presentation/utils/cn";

interface Row {
  account: Account;
  debit: number;
  credit: number;
  balance: number;
}

const TABS = [
  { id: "trial", label: "Balance de comprobación" },
  { id: "income", label: "Estado de resultados" },
] as const;

export default function ReportesPage() {
  const entries = useJournalEntries(ACCOUNTING_COMPANY_ID);
  const accounts = useAccounts(ACCOUNTING_COMPANY_ID);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("trial");

  const loading = entries.loading || accounts.loading;
  const error = entries.error || accounts.error;

  const rows = useMemo<Row[]>(() => {
    const accMap = new Map((accounts.data ?? []).map((a) => [a.id, a]));
    const totals = new Map<string, { debit: number; credit: number }>();
    for (const e of entries.data ?? []) {
      for (const l of e.lines) {
        const t = totals.get(l.accountId) ?? { debit: 0, credit: 0 };
        t.debit += l.debit;
        t.credit += l.credit;
        totals.set(l.accountId, t);
      }
    }
    return [...totals.entries()]
      .map(([id, t]) => {
        const account = accMap.get(id);
        if (!account) return null;
        return { account, debit: t.debit, credit: t.credit, balance: t.debit - t.credit };
      })
      .filter((r): r is Row => r !== null)
      .sort((a, b) => a.account.code.localeCompare(b.account.code));
  }, [entries.data, accounts.data]);

  const income = useMemo(
    () => rows.filter((r) => r.account.type === AccountType.INCOME).reduce((s, r) => s + r.credit - r.debit, 0),
    [rows],
  );
  const expense = useMemo(
    () => rows.filter((r) => r.account.type === AccountType.EXPENSE).reduce((s, r) => s + r.debit - r.credit, 0),
    [rows],
  );

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  const chartData: ChartDatum[] = [
    { label: "Ingresos", value: income },
    { label: "Gastos", value: expense },
    { label: "Utilidad", value: income - expense },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes y Balances" description="Estados financieros calculados a partir del libro diario." />

      {error ? (
        <ErrorState description={error} onRetry={() => { entries.reload(); accounts.reload(); }} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Ingresos" value={formatCurrency(income)} icon={TrendingUp} tone="success" loading={loading} />
            <StatCard label="Gastos" value={formatCurrency(expense)} icon={TrendingDown} tone="danger" loading={loading} />
            <StatCard label="Utilidad neta" value={formatCurrency(income - expense)} icon={Wallet} tone="info" loading={loading} />
          </div>

          <div role="tablist" aria-label="Tipo de reporte" className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <TableSkeleton rows={6} cols={4} />
              </CardContent>
            </Card>
          ) : rows.length === 0 ? (
            <EmptyState title="Sin datos" description="No hay movimientos para generar reportes." />
          ) : tab === "trial" ? (
            <Card>
              <CardContent className="overflow-x-auto pt-6">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Código</th>
                      <th className="py-2 pr-4">Cuenta</th>
                      <th className="py-2 pr-4 text-right">Debe</th>
                      <th className="py-2 pr-4 text-right">Haber</th>
                      <th className="py-2 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border tabular-nums">
                    {rows.map((r) => (
                      <tr key={r.account.id}>
                        <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{r.account.code}</td>
                        <td className="py-2 pr-4">{r.account.name}</td>
                        <td className="py-2 pr-4 text-right">{formatCurrency(r.debit)}</td>
                        <td className="py-2 pr-4 text-right">{formatCurrency(r.credit)}</td>
                        <td className="py-2 text-right font-medium">{formatCurrency(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-border font-semibold tabular-nums">
                    <tr>
                      <td className="py-2 pr-4" colSpan={2}>
                        Totales
                      </td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(totalDebit)}</td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(totalCredit)}</td>
                      <td className="py-2 text-right">{formatCurrency(totalDebit - totalCredit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ingresos vs Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart type="bar" data={chartData} valueFormatter={(v) => formatCurrency(v)} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
