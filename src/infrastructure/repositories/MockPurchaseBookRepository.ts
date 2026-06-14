import type { PurchaseBookEntry } from "@/domain/entities/PurchaseBookEntry";
import type { IPurchaseBookRepository, PurchaseBookFilters } from "@/domain/repositories/IPurchaseBookRepository";
import { buildPurchaseTaxFields } from "@/domain/entities/PurchaseBookEntry";

function normalizeDocumentNumber(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeRif(value: string): string {
  return value.trim().toUpperCase().replace(/\s/g, "");
}

function seedEntry(
  partial: Pick<
    PurchaseBookEntry,
    | "id"
    | "companyId"
    | "date"
    | "documentType"
    | "documentNumber"
    | "controlNumber"
    | "vendorName"
    | "vendorRif"
    | "totalIncludingIva"
  > &
    Partial<
      Pick<
        PurchaseBookEntry,
        | "affectedDocument"
        | "exemptAmount"
        | "base8"
        | "importBase16"
        | "ivaWithheld"
        | "withholdingVoucherNumber"
        | "igtf"
      >
    >,
): PurchaseBookEntry {
  const taxes = buildPurchaseTaxFields({
    totalIncludingIva: partial.totalIncludingIva,
    exemptAmount: partial.exemptAmount ?? 0,
    base8: partial.base8 ?? 0,
    importBase16: partial.importBase16 ?? 0,
    ivaWithheld: partial.ivaWithheld ?? 0,
    igtf: partial.igtf ?? 0,
  });
  const now = new Date().toISOString();
  return {
    ...partial,
    affectedDocument: partial.affectedDocument,
    withholdingVoucherNumber: partial.withholdingVoucherNumber,
    ...taxes,
    createdAt: now,
    updatedAt: now,
  };
}

export const MOCK_PURCHASES: PurchaseBookEntry[] = [
  seedEntry({
    id: "purchase-1",
    companyId: "comp-1",
    date: "2024-10-18",
    documentType: "FACTURA",
    documentNumber: "00005874",
    controlNumber: "00-005905",
    vendorName: "UNITRUCK C.A",
    vendorRif: "J-50000943-7",
    totalIncludingIva: 1160,
    exemptAmount: 0,
    base8: 0,
    importBase16: 0,
    ivaWithheld: 0,
    igtf: 0,
  }),
  seedEntry({
    id: "purchase-2",
    companyId: "comp-1",
    date: "2024-10-22",
    documentNumber: "00001234",
    documentType: "FACTURA",
    controlNumber: "00-001234",
    vendorName: "SUMINISTROS DEL ESTE C.A",
    vendorRif: "J-31509822-1",
    totalIncludingIva: 580,
    exemptAmount: 0,
    base8: 0,
    importBase16: 0,
    ivaWithheld: 46.4,
    withholdingVoucherNumber: "20241000001559",
    igtf: 0,
  }),
];

let _entries: PurchaseBookEntry[] = [...MOCK_PURCHASES];

export class MockPurchaseBookRepository implements IPurchaseBookRepository {
  async findAll(filters?: PurchaseBookFilters): Promise<PurchaseBookEntry[]> {
    let result = [..._entries];
    if (filters?.companyId) {
      result = result.filter((e) => e.companyId === filters.companyId);
    }
    if (filters?.startDate) {
      result = result.filter((e) => e.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter((e) => e.date <= filters.endDate!);
    }
    return Promise.resolve(result.sort((a, b) => a.date.localeCompare(b.date)));
  }

  async findById(id: string): Promise<PurchaseBookEntry | null> {
    return Promise.resolve(_entries.find((e) => e.id === id) ?? null);
  }

  async findByCompany(companyId: string): Promise<PurchaseBookEntry[]> {
    return this.findAll({ companyId });
  }

  async findByDocumentNumber(
    companyId: string,
    documentNumber: string,
    vendorRif: string,
  ): Promise<PurchaseBookEntry | null> {
    const doc = normalizeDocumentNumber(documentNumber);
    const rif = normalizeRif(vendorRif);
    return Promise.resolve(
      _entries.find(
        (e) =>
          e.companyId === companyId &&
          normalizeDocumentNumber(e.documentNumber) === doc &&
          normalizeRif(e.vendorRif) === rif,
      ) ?? null,
    );
  }

  async create(
    data: Omit<PurchaseBookEntry, "id" | "createdAt" | "updatedAt">,
  ): Promise<PurchaseBookEntry> {
    const entry: PurchaseBookEntry = {
      ...data,
      id: `purchase-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _entries = [..._entries, entry];
    return Promise.resolve(entry);
  }

  async update(id: string, data: Partial<PurchaseBookEntry>): Promise<PurchaseBookEntry | null> {
    _entries = _entries.map((e) =>
      e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e,
    );
    return Promise.resolve(_entries.find((e) => e.id === id) ?? null);
  }

  async delete(id: string): Promise<boolean> {
    const exists = _entries.some((e) => e.id === id);
    if (!exists) return Promise.resolve(false);
    _entries = _entries.filter((e) => e.id !== id);
    return Promise.resolve(true);
  }
}

export const mockPurchaseBookRepository = new MockPurchaseBookRepository();
