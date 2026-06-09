import { JournalEntry } from '@/domain/entities';
import { IJournalEntryRepository } from '@/domain/repositories';
import { MOCK_ENTRIES } from '@/application/mockData';

let _entries: JournalEntry[] = [...MOCK_ENTRIES];

export class MockJournalEntryRepository implements IJournalEntryRepository {
  async findAll(filters?: { companyId?: string; startDate?: string; endDate?: string }): Promise<JournalEntry[]> {
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
    return Promise.resolve(result);
  }

  async findById(id: string): Promise<JournalEntry | null> {
    return Promise.resolve(_entries.find((e) => e.id === id) || null);
  }

  async findByCompany(companyId: string): Promise<JournalEntry[]> {
    return Promise.resolve(_entries.filter((e) => e.companyId === companyId));
  }

  async create(data: { companyId: string; date: string; description: string; lines: JournalEntry['lines'] }): Promise<JournalEntry> {
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _entries = [..._entries, newEntry];
    return Promise.resolve(newEntry);
  }

  async update(id: string, data: Partial<JournalEntry>): Promise<JournalEntry | null> {
    _entries = _entries.map((e) =>
      e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
    );
    return Promise.resolve(_entries.find((e) => e.id === id) || null);
  }

  async delete(id: string): Promise<boolean> {
    const exists = _entries.find((e) => e.id === id);
    if (!exists) return Promise.resolve(false);
    _entries = _entries.filter((e) => e.id !== id);
    return Promise.resolve(true);
  }
}

export const mockJournalEntryRepository = new MockJournalEntryRepository();