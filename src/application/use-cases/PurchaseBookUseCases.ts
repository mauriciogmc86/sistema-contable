import type { PurchaseBookService } from "../services/PurchaseBookService";
import type { CreatePurchaseBookEntryDTO, UpdatePurchaseBookEntryDTO } from "../dtos/PurchaseBookDTO";

export function buildPurchaseBookUseCases(service: PurchaseBookService) {
  return {
    getAll: (filters?: Parameters<PurchaseBookService["getAll"]>[0]) => service.getAll(filters),
    getById: (id: string) => service.getById(id),
    getByCompany: (companyId: string) => service.getByCompany(companyId),
    getByPeriod: (companyId: string, startDate: string, endDate: string) =>
      service.getByPeriod(companyId, startDate, endDate),
    checkDuplicate: (
      companyId: string,
      documentNumber: string,
      vendorRif: string,
      excludeId?: string,
    ) => service.checkDuplicate(companyId, documentNumber, vendorRif, excludeId),
    create: (dto: CreatePurchaseBookEntryDTO) => service.create(dto),
    update: (dto: UpdatePurchaseBookEntryDTO) => service.update(dto),
    delete: (id: string) => service.delete(id),
    summarize: (entries: Parameters<PurchaseBookService["summarize"]>[0]) => service.summarize(entries),
  };
}
