import type { PurchaseBookEntry } from "../entities/PurchaseBookEntry";

export interface PurchaseBookFilters {
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export interface IPurchaseBookRepository {
  findAll(filters?: PurchaseBookFilters): Promise<PurchaseBookEntry[]>;
  findById(id: string): Promise<PurchaseBookEntry | null>;
  findByCompany(companyId: string): Promise<PurchaseBookEntry[]>;
  findByDocumentNumber(
    companyId: string,
    documentNumber: string,
    vendorRif: string,
  ): Promise<PurchaseBookEntry | null>;
  create(data: Omit<PurchaseBookEntry, "id" | "createdAt" | "updatedAt">): Promise<PurchaseBookEntry>;
  update(id: string, data: Partial<PurchaseBookEntry>): Promise<PurchaseBookEntry | null>;
  delete(id: string): Promise<boolean>;
}
