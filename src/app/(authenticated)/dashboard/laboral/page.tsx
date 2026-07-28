"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CalendarClock,
  FileBadge,
} from "lucide-react";
import {
  type CartaTrabajoFormInput,
  type LiquidationCalculationFormInput,
  type VacationCalculationFormInput,
} from "@/application/validation";
import {
  getAmonestacionContextByCedula,
  type AmonestacionRecord,
  type AmonestacionWorkerContext,
} from "@/infrastructure/repositories/SupabaseAmonestacionRepository";
import { getEmpresa } from "@/infrastructure/repositories/SupabaseEmpresaRepository";
import { getWorkerDocumentByCedula, type WorkerDocumentData } from "@/infrastructure/repositories/SupabaseLegalRepository";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/molecules/Card";
import { DocumentExportActions } from "@/presentation/components/molecules/DocumentExportActions";
import { WorkerCedulaSearch } from "@/presentation/components/molecules/WorkerCedulaSearch";
import { AmonestacionDocument } from "@/presentation/components/organisms/AmonestacionDocument";
import { AmonestacionForm } from "@/presentation/components/organisms/AmonestacionForm";
import { AmonestacionList } from "@/presentation/components/organisms/AmonestacionList";
import { CartaTrabajoDocument } from "@/presentation/components/organisms/CartaTrabajoDocument";
import { CartaTrabajoForm } from "@/presentation/components/organisms/CartaTrabajoForm";
import { LiquidationCalculationForm } from "@/presentation/components/organisms/LiquidationCalculationForm";
import { LiquidationSettlementDocument } from "@/presentation/components/organisms/LiquidationSettlementDocument";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { VacationCalculationForm } from "@/presentation/components/organisms/VacationCalculationForm";
import { VacationSettlementDocument } from "@/presentation/components/organisms/VacationSettlementDocument";
import { useAsync } from "@/presentation/hooks";
import { useCompanyStore } from "@/presentation/store/useCompanyStore";
import { cn } from "@/presentation/utils/cn";

type Tab = "vacaciones" | "liquidacion" | "carta-trabajo" | "amonestacion";

const TABS: { id: Tab; label: string; icon: typeof Calculator }[] = [
  { id: "vacaciones", label: "Vacaciones", icon: CalendarClock },
  { id: "liquidacion", label: "Liquidación", icon: Calculator },
  { id: "carta-trabajo", label: "Carta de trabajo", icon: FileBadge },
  { id: "amonestacion", label: "Amonestaciones", icon: AlertTriangle },
];

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

function cedulaFilename(cedula: string, prefix: string): string {
  return `${prefix}_${cedula.replace(/\W/g, "")}.pdf`;
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

  const [cartaWorker, setCartaWorker] = useState<WorkerDocumentData | null>(null);
  const [cartaForm, setCartaForm] = useState<CartaTrabajoFormInput | null>(null);

  const [amonestacionWorker, setAmonestacionWorker] = useState<AmonestacionWorkerContext | null>(null);
  const [amonestacionRecord, setAmonestacionRecord] = useState<AmonestacionRecord | null>(null);
  const [amonestacionRefreshKey, setAmonestacionRefreshKey] = useState(0);

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

  const resetCartaTrabajo = () => {
    setCartaWorker(null);
    setCartaForm(null);
  };

  const resetAmonestacion = () => {
    setAmonestacionWorker(null);
    setAmonestacionRecord(null);
  };

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    if (tab === "carta-trabajo") resetCartaTrabajo();
    if (tab === "amonestacion") resetAmonestacion();
    setTab(next);
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Nómina"
          description="Vacaciones, liquidaciones, cartas de trabajo y amonestaciones. Las calculadoras usan datos manuales; los documentos legales se generan buscando al trabajador por cédula."
        />

        {!activeCompanyId && (tab === "vacaciones" || tab === "liquidacion") && (
          <p className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
            Sin empresa seleccionada: el formato se generará con encabezado genérico. Selecciona una empresa en el
            encabezado para incluir logo, RIF y razón social.
          </p>
        )}

        <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => switchTab(t.id)}
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

        {tab === "vacaciones" && (
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
              <DocumentExportActions
                elementId="printable-vacation"
                filename={cedulaFilename(vacationWorker.cedula, "vacaciones")}
                exporting={exporting}
                onExport={printPdf}
              />
            )}
          </>
        )}

        {tab === "liquidacion" && (
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
              <DocumentExportActions
                elementId="printable-liquidation"
                filename={cedulaFilename(liquidationWorker.cedula, "liquidacion")}
                exporting={exporting}
                onExport={printPdf}
              />
            )}
          </>
        )}

        {tab === "carta-trabajo" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Constancia de trabajo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <WorkerCedulaSearch
                  key="carta-trabajo-search"
                  searchWorker={getWorkerDocumentByCedula}
                  onFound={(data) => {
                    setCartaWorker(data);
                    setCartaForm(null);
                  }}
                  onClear={resetCartaTrabajo}
                />
                {cartaWorker && (
                  <CartaTrabajoForm
                    worker={cartaWorker}
                    onGenerate={(data) => setCartaForm(data)}
                  />
                )}
              </CardContent>
            </Card>
            {cartaWorker && cartaForm && (
              <DocumentExportActions
                elementId="printable-carta-trabajo"
                filename={cedulaFilename(cartaWorker.empleado.cedula, "carta_trabajo")}
                exporting={exporting}
                onExport={printPdf}
              />
            )}
          </>
        )}

        {tab === "amonestacion" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Amonestación laboral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <WorkerCedulaSearch
                  key="amonestacion-search"
                  inputId="amonestacion-cedula-search"
                  searchWorker={getAmonestacionContextByCedula}
                  onFound={(data) => {
                    setAmonestacionWorker(data);
                    setAmonestacionRecord(null);
                  }}
                  onClear={resetAmonestacion}
                />
                {amonestacionWorker && (
                  <>
                    <AmonestacionList
                      key={`${amonestacionWorker.trabajadorId}-${amonestacionRefreshKey}`}
                      worker={amonestacionWorker}
                      onChanged={async () => {
                        const refreshed = await getAmonestacionContextByCedula(
                          amonestacionWorker.empleado.cedula,
                        );
                        if (refreshed) setAmonestacionWorker(refreshed);
                        setAmonestacionRecord(null);
                        setAmonestacionRefreshKey((k) => k + 1);
                      }}
                    />
                    <AmonestacionForm
                      key={`${amonestacionWorker.trabajadorId}-${amonestacionRefreshKey}`}
                      worker={amonestacionWorker}
                      onGenerated={setAmonestacionRecord}
                    />
                  </>
                )}
              </CardContent>
            </Card>
            {amonestacionWorker && amonestacionRecord && (
              <DocumentExportActions
                elementId="printable-amonestacion"
                filename={cedulaFilename(
                  amonestacionWorker.empleado.cedula,
                  `amonestacion_${amonestacionRecord.codigo.replace("-", "_")}`,
                )}
                exporting={exporting}
                onExport={printPdf}
              />
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

      {tab === "carta-trabajo" && cartaWorker && cartaForm && (
        <div className="mt-6 print:mt-0">
          <CartaTrabajoDocument data={cartaWorker} form={cartaForm} />
        </div>
      )}

      {tab === "amonestacion" && amonestacionWorker && amonestacionRecord && (
        <div className="mt-6 print:mt-0">
          <AmonestacionDocument data={amonestacionWorker} record={amonestacionRecord} />
        </div>
      )}
    </div>
  );
}
