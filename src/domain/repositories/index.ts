import { Account, Company, JournalEntry } from '../entities';
export type { IPurchaseBookRepository, PurchaseBookFilters } from './IPurchaseBookRepository';

export interface ICompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  create(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company>;
  update(id: string, data: Partial<Company>): Promise<Company | null>;
  delete(id: string): Promise<boolean>;
}

export interface IAccountRepository {
  findAll(companyId: string): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  findByCompanyAndType(companyId: string, type: string): Promise<Account[]>;
  create(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
  update(id: string, data: Partial<Account>): Promise<Account | null>;
  delete(id: string): Promise<boolean>;
}

export interface IJournalEntryRepository {
  findAll(filters?: {
    companyId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<JournalEntry[]>;
  findById(id: string): Promise<JournalEntry | null>;
  findByCompany(companyId: string): Promise<JournalEntry[]>;
  create(data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry>;
  update(id: string, data: Partial<JournalEntry>): Promise<JournalEntry | null>;
  delete(id: string): Promise<boolean>;
}
