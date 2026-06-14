import {
  buildPurchaseTaxFields,
  type PurchaseBookEntry,
  summarizePurchaseBook,
} from "@/domain/entities/PurchaseBookEntry";
import type { IPurchaseBookRepository } from "@/domain/repositories/IPurchaseBookRepository";
import type { CreatePurchaseBookEntryDTO, UpdatePurchaseBookEntryDTO } from "../dtos/PurchaseBookDTO";

function normalizeDocumentNumber(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeRif(value: string): string {
  return value.trim().toUpperCase().replace(/\s/g, "");
}

export class PurchaseBookService {
  constructor(private readonly repo: IPurchaseBookRepository) {}

  async getAll(filters?: Parameters<IPurchaseBookRepository["findAll"]>[0]) {
    return this.repo.findAll(filters);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getByCompany(companyId: string) {
    return this.repo.findByCompany(companyId);
  }

  async getByPeriod(companyId: string, startDate: string, endDate: string) {
    return this.repo.findAll({ companyId, startDate, endDate });
  }

  async checkDuplicate(
    companyId: string,
    documentNumber: string,
    vendorRif: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existing = await this.repo.findByDocumentNumber(
      companyId,
      normalizeDocumentNumber(documentNumber),
      normalizeRif(vendorRif),
    );
    if (!existing) return false;
    if (excludeId && existing.id === excludeId) return false;
    return true;
  }

  async create(dto: CreatePurchaseBookEntryDTO): Promise<PurchaseBookEntry> {
    const isDuplicate = await this.checkDuplicate(dto.companyId, dto.documentNumber, dto.vendorRif);
    if (isDuplicate) {
      throw new Error(
        `Ya existe la factura ${dto.documentNumber.trim()} para el RIF ${dto.vendorRif.trim()}`,
      );
    }

    const taxes = buildPurchaseTaxFields(dto);

    return this.repo.create({
      companyId: dto.companyId,
      date: dto.date,
      documentType: dto.documentType,
      documentNumber: normalizeDocumentNumber(dto.documentNumber),
      controlNumber: dto.controlNumber.trim(),
      affectedDocument: dto.affectedDocument?.trim() || undefined,
      vendorName: dto.vendorName.trim(),
      vendorRif: normalizeRif(dto.vendorRif),
      totalIncludingIva: dto.totalIncludingIva,
      ...taxes,
      withholdingVoucherNumber: dto.withholdingVoucherNumber?.trim() || undefined,
    });
  }

  async update(dto: UpdatePurchaseBookEntryDTO): Promise<PurchaseBookEntry | null> {
    const isDuplicate = await this.checkDuplicate(
      dto.companyId,
      dto.documentNumber,
      dto.vendorRif,
      dto.id,
    );
    if (isDuplicate) {
      throw new Error(
        `Ya existe la factura ${dto.documentNumber.trim()} para el RIF ${dto.vendorRif.trim()}`,
      );
    }

    const taxes = buildPurchaseTaxFields(dto);

    return this.repo.update(dto.id, {
      date: dto.date,
      documentType: dto.documentType,
      documentNumber: normalizeDocumentNumber(dto.documentNumber),
      controlNumber: dto.controlNumber.trim(),
      affectedDocument: dto.affectedDocument?.trim() || undefined,
      vendorName: dto.vendorName.trim(),
      vendorRif: normalizeRif(dto.vendorRif),
      totalIncludingIva: dto.totalIncludingIva,
      ...taxes,
      withholdingVoucherNumber: dto.withholdingVoucherNumber?.trim() || undefined,
    });
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }

  summarize(entries: PurchaseBookEntry[]) {
    return summarizePurchaseBook(entries);
  }
}
