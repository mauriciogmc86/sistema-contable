"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import type { PurchaseBookEntry } from "@/domain/entities/PurchaseBookEntry";
import { purchaseBookUseCases } from "@/infrastructure/di";
import { exportLibroComprasToExcel, getPreviousMonthRange } from "@/lib/fiscalExport";
import { ACCOUNTING_COMPANY_ID } from "@/presentation/config/accounting";
import { Button } from "@/presentation/components/atoms/Button";
import { Card, CardContent } from "@/presentation/components/molecules/Card";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { ErrorState } from "@/presentation/components/molecules/ErrorState";
import { SearchInput } from "@/presentation/components/molecules/SearchInput";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { usePurchaseBook } from "@/presentation/hooks";
import { useCompanyStore } from "@/presentation/store";
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

const VENTAS: FiscalRow[] = [
  { date: "2026-05-25", invoice: "V-00451", rif: "J-40551203-7", base: 2300, iva: 368, exempt: 120 },
];

export default function LibrosFiscalesPage() {
  const { data, loading, error, reload } = usePurchaseBook(ACCOUNTING_COMPANY_ID);
  const { companies, activeCompanyId } = useCompanyStore();
  const [tab, setTab] = useState<"compras" | "ventas">("compras");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  const compras = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      (e) =>
        !q ||
        e.documentNumber.toLowerCase().includes(q) ||
        e.vendorName.toLowerCase().includes(q) ||
        e.vendorRif.toLowerCase().includes(q),
    );
  }, [data, search]);

  const handleExportPreviousMonth = async () => {
    setExporting(true);
    try {
      const { start, end, label } = getPreviousMonthRange();
      const entries = await purchaseBookUseCases.getByPeriod(ACCOUNTING_COMPANY_ID, start, end);
      await exportLibroComprasToExcel(
        entries,
        {
          companyName: activeCompany?.name ?? "Empresa",
          companyRif: activeCompany?.rif ?? undefined,
          periodStart: start,
          periodEnd: end,
        },
        `libro-compras-${label}.xlsx`,
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Libros Fiscales"
        description="Libro de compras y libro de ventas (IVA)."
        actions={
          tab === "compras" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                leftIcon={<Download className="h-4 w-4" aria-hidden />}
                isLoading={exporting}
                onClick={handleExportPreviousMonth}
              >
                Excel mes anterior
              </Button>
              <Link href="/dashboard/libros-fiscales/compras/nueva">
                <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />}>Incluir factura</Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      <div
        role="tablist"
        aria-label="Libro fiscal"
        className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1"
      >
        {(
          [
            { id: "compras" as const, label: "Libro de Compras" },
            { id: "ventas" as const, label: "Libro de Ventas" },
          ] as const
        ).map((t) => (
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

      {tab === "compras" ? (
        <>
          <div className="max-w-sm">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por factura, proveedor o RIF..."
              aria-label="Buscar compras"
            />
          </div>

          {error ? (
            <ErrorState description={error} onRetry={reload} />
          ) : (
            <Card>
              <CardContent className="overflow-x-auto pt-6">
                {loading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Cargando compras...</p>
                ) : compras.length === 0 ? (
                  <EmptyState
                    title="Sin facturas de compra"
                    description="Registra la primera factura para comenzar el libro de compras."
                    action={
                      <Link href="/dashboard/libros-fiscales/compras/nueva">
                        <Button size="sm" leftIcon={<Plus className="h-4 w-4" aria-hidden />}>
                          Incluir factura
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <ComprasTable entries={compras} />
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            {VENTAS.length === 0 ? (
              <EmptyState title="Sin registros" description="No hay facturas registradas en este libro." />
            ) : (
              <VentasTable rows={VENTAS} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ComprasTable({ entries }: { entries: PurchaseBookEntry[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
        <tr>
          <th className="py-2 pr-4">Fecha</th>
          <th className="py-2 pr-4">Factura</th>
          <th className="py-2 pr-4">Control</th>
          <th className="py-2 pr-4">Proveedor</th>
          <th className="py-2 pr-4">RIF</th>
          <th className="py-2 pr-4 text-right">Total</th>
          <th className="py-2 pr-4 text-right">Base 16%</th>
          <th className="py-2 pr-4 text-right">IVA</th>
          <th className="py-2 text-right">Exento</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border tabular-nums">
        {entries.map((r) => (
          <tr key={r.id}>
            <td className="py-2.5 pr-4">{formatDate(r.date)}</td>
            <td className="py-2.5 pr-4 font-medium text-foreground">{r.documentNumber}</td>
            <td className="py-2.5 pr-4 text-muted-foreground">{r.controlNumber}</td>
            <td className="py-2.5 pr-4">{r.vendorName}</td>
            <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{r.vendorRif}</td>
            <td className="py-2.5 pr-4 text-right">{formatCurrency(r.totalIncludingIva)}</td>
            <td className="py-2.5 pr-4 text-right">{formatCurrency(r.base16)}</td>
            <td className="py-2.5 pr-4 text-right">{formatCurrency(r.iva16)}</td>
            <td className="py-2.5 text-right">{formatCurrency(r.exemptAmount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VentasTable({ rows }: { rows: FiscalRow[] }) {
  return (
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
        {rows.map((r) => (
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
  );
}
