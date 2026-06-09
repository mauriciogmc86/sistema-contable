import { Account } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';
import { MOCK_ACCOUNTS } from '@/application/mockData';

let _accounts: Account[] = [...MOCK_ACCOUNTS];

export class MockAccountRepository implements IAccountRepository {
  async findAll(companyId: string): Promise<Account[]> {
    return Promise.resolve(_accounts.filter((a) => a.companyId === companyId));
  }

  async findById(id: string): Promise<Account | null> {
    return Promise.resolve(_accounts.find((a) => a.id === id) || null);
  }

  async findByCompanyAndType(companyId: string, type: string): Promise<Account[]> {
    return Promise.resolve(
      _accounts.filter((a) => a.companyId === companyId && a.type === type)
    );
  }

  async create(data: { companyId: string; code: string; name: string; type: Account['type']; parentId: string | null }): Promise<Account> {
    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _accounts = [..._accounts, newAccount];
    return Promise.resolve(newAccount);
  }

  async update(id: string, data: Partial<Account>): Promise<Account | null> {
    _accounts = _accounts.map((a) =>
      a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
    );
    return Promise.resolve(_accounts.find((a) => a.id === id) || null);
  }

  async delete(id: string): Promise<boolean> {
    const exists = _accounts.find((a) => a.id === id);
    if (!exists) return Promise.resolve(false);
    _accounts = _accounts.filter((a) => a.id !== id);
    return Promise.resolve(true);
  }
}

export const mockAccountRepository = new MockAccountRepository();
