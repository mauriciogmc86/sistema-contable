"use client";

import { useState } from "react";
import { Download, Users } from "lucide-react";
import type { TrabajadorFiscalFilter } from "@/application/validation";
import { TRABAJADOR_FISCAL_FILTERS } from "@/application/validation";
import { listTrabajadoresForExport } from "@/infrastructure/repositories/SupabaseEmpresaRepository";
import { buildTrabajadorExportFilename, exportTrabajadoresToExcel, trabajadorFiscalFilterLabel } from "@/lib/trabajadorExport";
import { Button } from "@/presentation/components/atoms/Button";
import { Select } from "@/presentation/components/atoms/Select";
import { Card, CardContent } from "@/presentation/components/molecules/Card";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { FormField } from "@/presentation/components/molecules/FormField";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { useCompanyStore } from "@/presentation/store/useCompanyStore";

export default function ReportesPersonalPage() {
  const { companies, activeCompanyId } = useCompanyStore();
  const activeCompany = companies.find((c) => c.id === activeCompanyId);
  const [filter, setFilter] = useState<TrabajadorFiscalFilter>("all");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!activeCompanyId || !activeCompany) return;

    setExporting(true);
    setExportError(null);
    try {
      const workers = await listTrabajadoresForExport(activeCompanyId, filter);
      await exportTrabajadoresToExcel(
        workers,
        {
          companyName: activeCompany.name,
          companyRif: activeCompany.rif ?? undefined,
          fiscalFilter: filter,
        },
        buildTrabajadorExportFilename(activeCompany.name, filter),
      );
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "No se pudo generar el reporte.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Personal"
        description="Descarga la lista de trabajadores de la empresa activa en Excel."
      />

      {!activeCompanyId ? (
        <EmptyState
          icon={Users}
          title="Selecciona una empresa"
          description="Elige una empresa en el selector del encabezado para generar el reporte de personal."
        />
      ) : (
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{activeCompany?.name}</p>
              {activeCompany?.rif && (
                <p className="text-sm text-muted-foreground font-mono">{activeCompany.rif}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
              <FormField label="Tipo de trabajador">
                {({ id }) => (
                  <Select
                    id={id}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as TrabajadorFiscalFilter)}
                  >
                    {TRABAJADOR_FISCAL_FILTERS.map((value) => (
                      <option key={value} value={value}>
                        {trabajadorFiscalFilterLabel(value)}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>

              <div className="flex sm:justify-end">
                <Button
                  leftIcon={<Download className="h-4 w-4" aria-hidden />}
                  onClick={handleExport}
                  isLoading={exporting}
                >
                  Descargar Excel
                </Button>
              </div>
            </div>

            {exportError && (
              <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger">
                {exportError}
              </p>
            )}

            <p className="text-sm text-muted-foreground">
              El archivo incluye cédula, nombres, apellidos, fecha de nacimiento, estado civil, cargo, dirección,
              salario base, fecha de ingreso y tipo fiscal.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
