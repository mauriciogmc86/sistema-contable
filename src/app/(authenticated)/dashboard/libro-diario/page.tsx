"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import type { JournalEntry } from "@/domain/entities";
import { ACCOUNTING_COMPANY_ID } from "@/presentation/config/accounting";
import { Badge } from "@/presentation/components/atoms/Badge";
import { Button } from "@/presentation/components/atoms/Button";
import { SearchInput } from "@/presentation/components/molecules/SearchInput";
import { ErrorState } from "@/presentation/components/molecules/ErrorState";
import { DataTable } from "@/presentation/components/organisms/DataTable";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { useJournalEntries } from "@/presentation/hooks";
import { formatCurrency, formatDate } from "@/presentation/utils/format";

export default function LibroDiarioPage() {
  const { data, loading, error, reload } = useJournalEntries(ACCOUNTING_COMPANY_ID);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((e) => !q || e.description.toLowerCase().includes(q));
  }, [data, search]);

  const columns = useMemo<ColumnDef<JournalEntry, unknown>[]>(
    () => [
      {
        header: "Fecha",
        accessorKey: "date",
        cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.date)}</span>,
      },
      { header: "Descripción", accessorKey: "description" },
      {
        header: "Monto",
        id: "amount",
        accessorFn: (e) => e.lines.reduce((s, l) => s + l.debit, 0),
        cell: ({ getValue }) => (
          <span className="font-medium tabular-nums">{formatCurrency(Number(getValue()))}</span>
        ),
      },
      {
        header: "Estado",
        id: "status",
        enableSorting: false,
        cell: () => <Badge tone="success">Balanceado</Badge>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Libro Diario"
        description="Registro cronológico de los asientos contables."
        actions={
          <Link href="/dashboard/libro-diario/nuevo">
            <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />}>Nuevo asiento</Button>
          </Link>
        }
      />

      <div className="max-w-sm">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por concepto..."
          aria-label="Buscar asientos"
        />
      </div>

      {error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          emptyTitle="Sin asientos"
          emptyDescription="No hay asientos que coincidan con tu búsqueda."
          emptyAction={
            <Link href="/dashboard/libro-diario/nuevo">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" aria-hidden />}>
                Crear asiento
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
