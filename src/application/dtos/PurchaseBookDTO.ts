import type { PurchaseDocumentType } from "@/domain/entities/PurchaseBookEntry";

export interface CreatePurchaseBookEntryDTO {
  companyId: string;
  date: string;
  documentType: PurchaseDocumentType;
  documentNumber: string;
  controlNumber: string;
  affectedDocument?: string;
  vendorName: string;
  vendorRif: string;
  totalIncludingIva: number;
  exemptAmount?: number;
  base8?: number;
  importBase16?: number;
  ivaWithheld?: number;
  withholdingVoucherNumber?: string;
  igtf?: number;
}

export interface UpdatePurchaseBookEntryDTO extends CreatePurchaseBookEntryDTO {
  id: string;
}
