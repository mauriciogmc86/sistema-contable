"use client";

import { useState } from "react";
import { Calculator, CalendarClock, Download, Printer } from "lucide-react";
import {
  type LiquidationCalculationFormInput,
  type VacationCalculationFormInput,
} from "@/application/validation";
import { getEmpresa } from "@/infrastructure/repositories/SupabaseEmpresaRepository";
import { exportToPdf } from "@/lib/contractExport";
import {
  type PayrollEmpresaContext,
  type PayrollWorkerInput,
  workerFromVacationForm,
} from "@/lib/payrollTypes";
import {
  calculateLiquidation,
  calculateVacationSettlement,
  type VacationCalculationResult,
} from "@/lib/vacationCalculation";
import { Button } from "@/presentation/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/molecules/Card";
import { LiquidationCalculationForm } from "@/presentation/components/organisms/LiquidationCalculationForm";
import { LiquidationSettlementDocument } from "@/presentation/components/organisms/LiquidationSettlementDocument";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { VacationCalculationForm } from "@/presentation/components/organisms/VacationCalculationForm";
import { VacationSettlementDocument } from "@/presentation/components/organisms/VacationSettlementDocument";
import { useAsync } from "@/presentation/hooks";
import { useCompanyStore } from "@/presentation/store/useCompanyStore";
import { cn } from "@/presentation/utils/cn";

type Tab = "vacaciones" | "liquidacion";

function workerFromLiquidationForm(data: LiquidationCalculationFormInput): PayrollWorkerInput {
  return {
    cedula: data.cedula,
    nombres: data.nombres,
    apellidos: data.apellidos,
    cargo: data.cargo,
    sueldoMensualUsd: data.sueldoMensualUsd,
    fechaIngreso: data.fechaIngreso,
  };
}

export default function LaboralPage() {
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const [tab, setTab] = useState<Tab>("vacaciones");
  const [exporting, setExporting] = useState(false);

  const [vacationForm, setVacationForm] = useState<VacationCalculationFormInput | null>(null);
  const [vacationWorker, setVacationWorker] = useState<PayrollWorkerInput | null>(null);
  const [vacationResult, setVacationResult] = useState<VacationCalculationResult | null>(null);
  const [vacationError, setVacationError] = useState<string | null>(null);

  const [liquidationForm, setLiquidationForm] = useState<LiquidationCalculationFormInput | null>(null);
  const [liquidationWorker, setLiquidationWorker] = useState<PayrollWorkerInput | null>(null);

  const empresaQuery = useAsync(async (): Promise<PayrollEmpresaContext | null> => {
    if (!activeCompanyId) return null;
    const emp = await getEmpresa(activeCompanyId);
    return {
      nombre: emp.nombre,
      rif: emp.rif,
      direccion: emp.direccion ?? "",
      logoUrl: emp.logo_url ?? null,
    };
  }, [activeCompanyId]);

  const empresa = empresaQuery.data ?? null;
  const liquidationResult = liquidationForm ? calculateLiquidation(liquidationForm) : null;

  const handleVacationCalculate = (data: VacationCalculationFormInput) => {
    setVacationError(null);
    try {
      const result = calculateVacationSettlement({
        fechaIngreso: data.fechaIngreso,
        sueldoMensualUsd: data.sueldoMensualUsd,
        tasaBcv: data.tasaBcv,
        diasDisfrutados: data.diasDisfrutados,
        ciudad: data.ciudad,
        fechaDocumento: data.fechaDocumento,
      });
      setVacationForm(data);
      setVacationWorker(workerFromVacationForm(data));
      setVacationResult(result);
    } catch (err) {
      setVacationResult(null);
      setVacationForm(null);
      setVacationWorker(null);
      setVacationError(err instanceof Error ? err.message : "No se pudo calcular las vacaciones.");
    }
  };

  const handleLiquidationCalculate = (data: LiquidationCalculationFormInput) => {
    setLiquidationForm(data);
    setLiquidationWorker(workerFromLiquidationForm(data));
  };

  const printPdf = async (elementId: string, filename: string) => {
    setExporting(true);
    try {
      await exportToPdf(elementId, filename);
    } catch {
      window.print();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Nómina"
          description="Calculadora de vacaciones y liquidaciones conforme a la LOTTT. Ingresa los datos manualmente; no modifica trabajadores en la base de datos."
        />

        {!activeCompanyId && (
          <p className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
            Sin empresa seleccionada: el formato se generará con encabezado genérico. Selecciona una empresa en el
            encabezado para incluir logo, RIF y razón social.
          </p>
        )}

        <div role="tablist" className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
          {([
            { id: "vacaciones" as const, label: "Vacaciones", icon: CalendarClock },
            { id: "liquidacion" as const, label: "Liquidación", icon: Calculator },
          ]).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "vacaciones" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Datos para cálculo de vacaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <VacationCalculationForm onCalculate={handleVacationCalculate} />
                {vacationError && (
                  <p role="alert" className="mt-4 rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger">
                    {vacationError}
                  </p>
                )}
              </CardContent>
            </Card>

            {vacationForm && vacationResult && vacationWorker && (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  leftIcon={<Printer className="h-4 w-4" aria-hidden />}
                  onClick={() => window.print()}
                >
                  Imprimir
                </Button>
                <Button
                  leftIcon={<Download className="h-4 w-4" aria-hidden />}
                  isLoading={exporting}
                  onClick={() =>
                    printPdf("printable-vacation", `vacaciones_${vacationWorker.cedula.replace(/\W/g, "")}.pdf`)
                  }
                >
                  Descargar PDF
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Datos para liquidación laboral</CardTitle>
              </CardHeader>
              <CardContent>
                <LiquidationCalculationForm onCalculate={handleLiquidationCalculate} />
              </CardContent>
            </Card>

            {liquidationForm && liquidationResult && liquidationWorker && (
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" leftIcon={<Printer className="h-4 w-4" aria-hidden />} onClick={() => window.print()}>
                  Imprimir
                </Button>
                <Button
                  leftIcon={<Download className="h-4 w-4" aria-hidden />}
                  isLoading={exporting}
                  onClick={() =>
                    printPdf(
                      "printable-liquidation",
                      `liquidacion_${liquidationWorker.cedula.replace(/\W/g, "")}.pdf`,
                    )
                  }
                >
                  Descargar PDF
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {tab === "vacaciones" && vacationForm && vacationResult && vacationWorker && (
        <div className="mt-6 print:mt-0">
          <VacationSettlementDocument
            worker={vacationWorker}
            empresa={empresa}
            form={vacationForm}
            result={vacationResult}
          />
        </div>
      )}

      {tab === "liquidacion" && liquidationForm && liquidationResult && liquidationWorker && (
        <div className="mt-6 print:mt-0">
          <LiquidationSettlementDocument
            worker={liquidationWorker}
            empresa={empresa}
            form={liquidationForm}
            result={liquidationResult}
          />
        </div>
      )}
    </div>
  );
}
