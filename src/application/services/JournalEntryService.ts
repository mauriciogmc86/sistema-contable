import { JournalEntry, JournalEntryLine, isEntryBalanced, getEntryTotals } from '@/domain/entities';
import { IJournalEntryRepository } from '@/domain/repositories';
import type { CreateJournalEntryDTO, UpdateJournalEntryDTO } from '../dtos/JournalEntryDTO';

export class JournalEntryService {
  constructor(private readonly entryRepo: IJournalEntryRepository) {}

  async getAll(filters?: {
    companyId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<JournalEntry[]> {
    return this.entryRepo.findAll(filters);
  }

  async getById(id: string): Promise<JournalEntry | null> {
    return this.entryRepo.findById(id);
  }

  async getByCompany(companyId: string): Promise<JournalEntry[]> {
    return this.entryRepo.findByCompany(companyId);
  }

  async create(dto: CreateJournalEntryDTO): Promise<JournalEntry> {
    if (!isEntryBalanced(dto.lines)) {
      throw new Error('El asiento no está balanceado: Débito debe igualar Crédito');
    }
    return this.entryRepo.create(dto);
  }

  async update(dto: UpdateJournalEntryDTO): Promise<JournalEntry | null> {
    if (!isEntryBalanced(dto.lines)) {
      throw new Error('El asiento no está balanceado: Débito debe igualar Crédito');
    }
    return this.entryRepo.update(dto.id, dto);
  }

  async delete(id: string): Promise<boolean> {
    return this.entryRepo.delete(id);
  }

  calculateTotals(entry: JournalEntry) {
    return getEntryTotals(entry.lines);
  }

  getMonthlySummary(entries: JournalEntry[]) {
    const summary: Record<string, { debit: number; credit: number }> = {};
    entries.forEach((entry) => {
      const month = entry.date.substring(0, 7);
      if (!summary[month]) {
        summary[month] = { debit: 0, credit: 0 };
      }
      entry.lines.forEach((line: JournalEntryLine) => {
        summary[month].debit += line.debit;
        summary[month].credit += line.credit;
      });
    });
    return summary;
  }

  getCompanyTotals(companyId: string, entries: JournalEntry[]) {
    const companyEntries = entries.filter((e) => e.companyId === companyId);
    return companyEntries.reduce(
      (acc, entry) => {
        const totals = getEntryTotals(entry.lines);
        acc.totalDebit += totals.totalDebit;
        acc.totalCredit += totals.totalCredit;
        return acc;
      },
      { totalDebit: 0, totalCredit: 0 }
    );
  }
}
