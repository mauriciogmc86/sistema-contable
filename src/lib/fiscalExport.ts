import { saveAs } from "file-saver";
import type { PurchaseBookEntry, PurchaseBookSummary } from "@/domain/entities/PurchaseBookEntry";
import { summarizePurchaseBook } from "@/domain/entities/PurchaseBookEntry";

export interface LibroComprasExportMeta {
  companyName: string;
  companyRif?: string;
  periodStart: string;
  periodEnd: string;
}

function formatExcelDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function formatPeriodLabel(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" });
}

function docTypeLabel(type: PurchaseBookEntry["documentType"]): string {
  if (type === "NOTA_DEBITO") return "NOTA DEBITO";
  if (type === "NOTA_CREDITO") return "NOTA CREDITO";
  return "FACTURA";
}

function entryRow(entry: PurchaseBookEntry): (string | number)[] {
  return [
    formatExcelDate(entry.date),
    docTypeLabel(entry.documentType),
    entry.documentNumber,
    entry.controlNumber,
    entry.affectedDocument ?? "",
    entry.vendorName,
    entry.vendorRif,
    entry.totalIncludingIva,
    entry.exemptAmount,
    entry.base16,
    entry.ivaRate16 || "",
    entry.iva16,
    entry.base8,
    entry.ivaRate8 || "",
    entry.iva8,
    entry.importBase16,
    entry.importIvaRate16 || "",
    entry.importIva16,
    entry.ivaWithheld,
    entry.withholdingVoucherNumber ?? "",
    entry.igtf,
  ];
}

function summaryRows(summary: PurchaseBookSummary): (string | number)[][] {
  return [
    ["Compras No Gravadas y/o Sin Derecho a C.F.", summary.exempt, "", "", summary.exempt],
    [
      "Compras Internas Alicuota General (16%)",
      summary.base16 + summary.iva16,
      summary.base16,
      summary.iva16,
      "",
    ],
    ["Compras Internas Alicuota Reducida (8%)", summary.base8 + summary.iva8, summary.base8, summary.iva8, ""],
    [
      "Compras Importación Alicuota General (16%)",
      summary.importBase16 + summary.importIva16,
      summary.importBase16,
      summary.importIva16,
      "",
    ],
    [
      "Total General",
      summary.totalPurchases,
      summary.base16 + summary.base8 + summary.importBase16,
      summary.iva16 + summary.iva8 + summary.importIva16,
      summary.ivaWithheld,
    ],
  ];
}

export async function exportLibroComprasToExcel(
  entries: PurchaseBookEntry[],
  meta: LibroComprasExportMeta,
  filename: string,
): Promise<void> {
  const XLSX = await import("xlsx");
  const summary = summarizePurchaseBook(entries);

  const sheetData: (string | number)[][] = [
    ["LIBRO DE COMPRA"],
    [meta.companyName.toUpperCase()],
    meta.companyRif ? [`RIF: ${meta.companyRif}`] : [],
    [`Periodo: ${formatPeriodLabel(meta.periodStart)} al ${formatPeriodLabel(meta.periodEnd)}`],
    [],
    [
      "Fecha",
      "Tipo Doc.",
      "Nro Doc.",
      "Nro Control",
      "Doc. Afectado",
      "Nombre o Razon Social",
      "R.I.F.",
      "Total Compras Incluyendo IVA",
      "Compras No Gravadas y/o Sin Derecho a C.F.",
      "Compras Nacionales 16%",
      "",
      "",
      "Compras Nacionales Reducida 8%",
      "",
      "",
      "Compras Importación 16%",
      "",
      "",
      "Iva Retenido a Terceros",
      "Nº De Comprobante",
      "IGTF",
    ],
    [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Base",
      "Alic (%)",
      "I.V.A.",
      "Base",
      "Alic (%)",
      "I.V.A.",
      "Base",
      "Alic (%)",
      "I.V.A.",
      "",
      "",
      "",
    ],
    ...entries.map(entryRow),
    [],
    ["RESUMEN"],
    [
      "",
      "Total Compras",
      "Compras No Gravadas y/o Sin Derecho a C.F.",
      "Base",
      "I.V.A.",
      "IVA Retenido en el Periodo",
    ],
    ...summaryRows(summary),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 20 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 20 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 20 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 20 } },
    { s: { r: 5, c: 9 }, e: { r: 5, c: 11 } },
    { s: { r: 5, c: 12 }, e: { r: 5, c: 14 } },
    { s: { r: 5, c: 15 }, e: { r: 5, c: 17 } },
    { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },
    { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },
    { s: { r: 5, c: 2 }, e: { r: 6, c: 2 } },
    { s: { r: 5, c: 3 }, e: { r: 6, c: 3 } },
    { s: { r: 5, c: 4 }, e: { r: 6, c: 4 } },
    { s: { r: 5, c: 5 }, e: { r: 6, c: 5 } },
    { s: { r: 5, c: 6 }, e: { r: 6, c: 6 } },
    { s: { r: 5, c: 7 }, e: { r: 6, c: 7 } },
    { s: { r: 5, c: 8 }, e: { r: 6, c: 8 } },
    { s: { r: 5, c: 18 }, e: { r: 6, c: 18 } },
    { s: { r: 5, c: 19 }, e: { r: 6, c: 19 } },
    { s: { r: 5, c: 20 }, e: { r: 6, c: 20 } },
  ];

  ws["!cols"] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 28 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 12 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 8 },
    { wch: 10 },
    { wch: 14 },
    { wch: 18 },
    { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Libro de Compra");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}

/** Returns ISO date range for the previous calendar month. */
export function getPreviousMonthRange(referenceDate = new Date()): { start: string; end: string; label: string } {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const end = new Date(prevYear, prevMonth + 1, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const label = `${prevYear}-${pad(prevMonth + 1)}`;
  return {
    start: `${prevYear}-${pad(prevMonth + 1)}-01`,
    end: `${prevYear}-${pad(prevMonth + 1)}-${pad(end.getDate())}`,
    label,
  };
}
