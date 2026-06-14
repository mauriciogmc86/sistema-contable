export const PURCHASE_DOCUMENT_TYPES = ["FACTURA", "NOTA_DEBITO", "NOTA_CREDITO"] as const;
export type PurchaseDocumentType = (typeof PURCHASE_DOCUMENT_TYPES)[number];

export interface PurchaseBookEntry {
  id: string;
  companyId: string;
  date: string;
  documentType: PurchaseDocumentType;
  documentNumber: string;
  controlNumber: string;
  affectedDocument?: string;
  vendorName: string;
  vendorRif: string;
  totalIncludingIva: number;
  exemptAmount: number;
  base16: number;
  ivaRate16: number;
  iva16: number;
  base8: number;
  ivaRate8: number;
  iva8: number;
  importBase16: number;
  importIvaRate16: number;
  importIva16: number;
  ivaWithheld: number;
  withholdingVoucherNumber?: string;
  igtf: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseTaxInput {
  totalIncludingIva: number;
  exemptAmount?: number;
  base8?: number;
  importBase16?: number;
  ivaWithheld?: number;
  igtf?: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Calcula base e IVA al 16% a partir del total (incluye IVA) menos monto exento. */
export function calcNational16Taxes(totalIncludingIva: number, exemptAmount = 0) {
  const taxable = Math.max(0, totalIncludingIva - exemptAmount);
  const base16 = round2(taxable / 1.16);
  const iva16 = round2(base16 * 0.16);
  return { base16, iva16, ivaRate16: 16 };
}

export function buildPurchaseTaxFields(input: PurchaseTaxInput) {
  const exemptAmount = input.exemptAmount ?? 0;
  const { base16, iva16, ivaRate16 } = calcNational16Taxes(input.totalIncludingIva, exemptAmount);
  const base8 = input.base8 ?? 0;
  const importBase16 = input.importBase16 ?? 0;

  return {
    exemptAmount,
    base16,
    ivaRate16,
    iva16,
    base8,
    ivaRate8: base8 > 0 ? 8 : 0,
    iva8: round2(base8 * 0.08),
    importBase16,
    importIvaRate16: importBase16 > 0 ? 16 : 0,
    importIva16: round2(importBase16 * 0.16),
    ivaWithheld: input.ivaWithheld ?? 0,
    igtf: input.igtf ?? 0,
  };
}

export interface PurchaseBookSummary {
  totalPurchases: number;
  exempt: number;
  base16: number;
  iva16: number;
  base8: number;
  iva8: number;
  importBase16: number;
  importIva16: number;
  ivaWithheld: number;
  igtf: number;
}

export function summarizePurchaseBook(entries: PurchaseBookEntry[]): PurchaseBookSummary {
  return entries.reduce(
    (acc, e) => ({
      totalPurchases: acc.totalPurchases + e.totalIncludingIva,
      exempt: acc.exempt + e.exemptAmount,
      base16: acc.base16 + e.base16,
      iva16: acc.iva16 + e.iva16,
      base8: acc.base8 + e.base8,
      iva8: acc.iva8 + e.iva8,
      importBase16: acc.importBase16 + e.importBase16,
      importIva16: acc.importIva16 + e.importIva16,
      ivaWithheld: acc.ivaWithheld + e.ivaWithheld,
      igtf: acc.igtf + e.igtf,
    }),
    {
      totalPurchases: 0,
      exempt: 0,
      base16: 0,
      iva16: 0,
      base8: 0,
      iva8: 0,
      importBase16: 0,
      importIva16: 0,
      ivaWithheld: 0,
      igtf: 0,
    },
  );
}
