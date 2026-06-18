import { saveAs } from "file-saver";
import type { TrabajadorFiscalFilter } from "@/application/validation";
import type { TrabajadorExportRecord } from "@/infrastructure/repositories/SupabaseEmpresaRepository";
import { formatExcelDate } from "@/lib/excelFormat";

export interface TrabajadorExportMeta {
  companyName: string;
  companyRif?: string;
  fiscalFilter: TrabajadorFiscalFilter;
}

const FILTER_LABELS: Record<TrabajadorFiscalFilter, string> = {
  all: "Todos",
  fiscal: "Fiscales",
  no_fiscal: "No fiscales",
};

export function trabajadorFiscalFilterLabel(filter: TrabajadorFiscalFilter): string {
  return FILTER_LABELS[filter];
}

function fullName(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ").trim();
}

function fiscalLabel(esFiscal: boolean): string {
  return esFiscal ? "Fiscal" : "No fiscal";
}

function workerRow(worker: TrabajadorExportRecord): (string | number)[] {
  return [
    worker.cedula,
    fullName([worker.primer_nombre, worker.segundo_nombre]),
    fullName([worker.primer_apellido, worker.segundo_apellido]),
    formatExcelDate(worker.fecha_nacimiento),
    worker.estado_civil,
    worker.cargo_nombre,
    worker.direccion_habitacion,
    worker.salario_base,
    formatExcelDate(worker.fecha_ingreso),
    fiscalLabel(worker.es_fiscal),
  ];
}

export async function exportTrabajadoresToExcel(
  workers: TrabajadorExportRecord[],
  meta: TrabajadorExportMeta,
  filename: string,
): Promise<void> {
  const XLSX = await import("xlsx");

  const sheetData: (string | number)[][] = [
    ["REPORTE DE PERSONAL"],
    [meta.companyName.toUpperCase()],
    meta.companyRif ? [`RIF: ${meta.companyRif}`] : [],
    [`Filtro: ${FILTER_LABELS[meta.fiscalFilter]}`],
    [`Total de registros: ${workers.length}`],
    [],
    [
      "Cédula",
      "Nombres",
      "Apellidos",
      "Fecha de Nacimiento",
      "Estado Civil",
      "Cargo",
      "Dirección de Habitación",
      "Salario Base",
      "Fecha de Ingreso",
      "Tipo",
    ],
    ...workers.map(workerRow),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 9 } },
  ];

  ws["!cols"] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 24 },
    { wch: 32 },
    { wch: 14 },
    { wch: 16 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Personal");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}

export function buildTrabajadorExportFilename(
  companyName: string,
  filter: TrabajadorFiscalFilter,
): string {
  const safeName = companyName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `personal-${safeName || "empresa"}-${filter}-${date}.xlsx`;
}
