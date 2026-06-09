"use client";

import { useState } from "react";
import { Card, CardContent } from "@/presentation/components/molecules/Card";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { formatCurrency, formatDate } from "@/presentation/utils/format";
import { cn } from "@/presentation/utils/cn";

interface FiscalRow {
  date: string;
  invoice: string;
  rif: string;
  base: number;
  iva: number;
  exempt: number;
}

const COMPRAS: FiscalRow[] = [
  { date: "2026-05-24", invoice: "FAC-00123", rif: "J-20601234-8", base: 1000, iva: 160, exempt: 0 },
  { date: "2026-05-22", invoice: "FAC-00118", rif: "J-31509822-1", base: 540, iva: 86.4, exempt: 0 },
];

const VENTAS: FiscalRow[] = [
  { date: "2026-05-25", invoice: "V-00451", rif: "J-40551203-7", base: 2300, iva: 368, exempt: 120 },
];

const TABS = [
  { id: "compras", label: "Libro de Compras", data: COMPRAS },
  { id: "ventas", label: "Libro de Ventas", data: VENTAS },
] as const;

export default function LibrosFiscalesPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("compras");
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-6">
      <PageHeader title="Libros Fiscales" description="Libro de compras y libro de ventas (IVA)." />

      <div role="tablist" aria-label="Libro fiscal" className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
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

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          {active.data.length === 0 ? (
            <EmptyState title="Sin registros" description="No hay facturas registradas en este libro." />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Factura</th>
                  <th className="py-2 pr-4">RIF</th>
                  <th className="py-2 pr-4 text-right">Base</th>
                  <th className="py-2 pr-4 text-right">IVA</th>
                  <th className="py-2 text-right">Exento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums">
                {active.data.map((r) => (
                  <tr key={r.invoice}>
                    <td className="py-2.5 pr-4">{formatDate(r.date)}</td>
                    <td className="py-2.5 pr-4 font-medium text-foreground">{r.invoice}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{r.rif}</td>
                    <td className="py-2.5 pr-4 text-right">{formatCurrency(r.base)}</td>
                    <td className="py-2.5 pr-4 text-right">{formatCurrency(r.iva)}</td>
                    <td className="py-2.5 text-right">{formatCurrency(r.exempt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
