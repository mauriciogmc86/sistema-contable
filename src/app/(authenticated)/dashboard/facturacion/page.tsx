"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/presentation/components/atoms/Badge";
import { Button } from "@/presentation/components/atoms/Button";
import { Select } from "@/presentation/components/atoms/Select";
import { Card, CardContent } from "@/presentation/components/molecules/Card";
import { ConfirmDialog } from "@/presentation/components/molecules/ConfirmDialog";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { SearchInput } from "@/presentation/components/molecules/SearchInput";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { formatCurrency, formatDate } from "@/presentation/utils/format";

type Status = "pagada" | "pendiente" | "anulada";

interface Invoice {
  id: string;
  number: string;
  client: string;
  date: string;
  total: number;
  status: Status;
}

const STATUS_TONE: Record<Status, "success" | "warning" | "danger"> = {
  pagada: "success",
  pendiente: "warning",
  anulada: "danger",
};

const INITIAL: Invoice[] = [
  { id: "1", number: "FAC-00125", client: "Inversiones Beta C.A.", date: "2026-05-25", total: 2668, status: "pagada" },
  { id: "2", number: "FAC-00124", client: "Tech Solutions C.A.", date: "2026-05-22", total: 626.4, status: "pendiente" },
  { id: "3", number: "FAC-00123", client: "Grupo Consultor", date: "2026-05-18", total: 1180, status: "anulada" },
];

export default function FacturacionPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | Status>("");
  const [toDelete, setToDelete] = useState<Invoice | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter(
      (i) =>
        (!q || i.number.toLowerCase().includes(q) || i.client.toLowerCase().includes(q)) &&
        (!status || i.status === status),
    );
  }, [invoices, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturación"
        description="Emisión y control de facturas."
        actions={<Button leftIcon={<Plus className="h-4 w-4" aria-hidden />}>Nueva factura</Button>}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-xs sm:flex-1">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar factura o cliente..." />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | Status)}
          aria-label="Filtrar por estado"
          className="sm:max-w-[12rem]"
        >
          <option value="">Todos los estados</option>
          <option value="pagada">Pagada</option>
          <option value="pendiente">Pendiente</option>
          <option value="anulada">Anulada</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Sin facturas" description="No hay facturas que coincidan con los filtros." />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">Factura</th>
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((i) => (
                  <tr key={i.id}>
                    <td className="py-3 pr-4 font-medium text-foreground">{i.number}</td>
                    <td className="py-3 pr-4">{i.client}</td>
                    <td className="py-3 pr-4 tabular-nums">{formatDate(i.date)}</td>
                    <td className="py-3 pr-4 text-right font-medium tabular-nums">{formatCurrency(i.total)}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={STATUS_TONE[i.status]} className="capitalize">
                        {i.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setToDelete(i)}>
                        Anular
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Anular factura"
        description={`¿Deseas anular la factura ${toDelete?.number}? Esta acción no se puede deshacer.`}
        confirmLabel="Anular"
        destructive
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            setInvoices((prev) => prev.map((i) => (i.id === toDelete.id ? { ...i, status: "anulada" } : i)));
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}
