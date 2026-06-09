import { JournalEntryService } from '../services/JournalEntryService';
import type { JournalEntry } from '@/domain/entities';
import type { CreateJournalEntryDTO, UpdateJournalEntryDTO } from '../dtos/JournalEntryDTO';

export function buildJournalEntryUseCases(service: JournalEntryService) {
  return {
    getAll: (filters?: Parameters<JournalEntryService['getAll']>[0]) => service.getAll(filters),
    getById: (id: string) => service.getById(id),
    getByCompany: (companyId: string) => service.getByCompany(companyId),
    create: (dto: CreateJournalEntryDTO) => service.create(dto),
    update: (dto: UpdateJournalEntryDTO) => service.update(dto),
    delete: (id: string) => service.delete(id),
    calculateTotals: (entry: JournalEntry) => service.calculateTotals(entry),
    getCompanyTotals: (companyId: string, entries: JournalEntry[]) =>
      service.getCompanyTotals(companyId, entries),
  };
}
