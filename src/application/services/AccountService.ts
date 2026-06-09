import { Account } from '@/domain/entities';
import { IAccountRepository } from '@/domain/repositories';

export class AccountService {
  constructor(private readonly accountRepo: IAccountRepository) {}

  async getByCompany(companyId: string): Promise<Account[]> {
    return this.accountRepo.findAll(companyId);
  }

  async getById(id: string): Promise<Account | null> {
    return this.accountRepo.findById(id);
  }

  async getByType(companyId: string, type: string): Promise<Account[]> {
    return this.accountRepo.findByCompanyAndType(companyId, type);
  }

  async create(data: {
    companyId: string;
    code: string;
    name: string;
    type: Account['type'];
    parentId: string | null;
  }): Promise<Account> {
    if (!data.code) throw new Error('El código de cuenta es requerido');
    if (!data.name || data.name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    return this.accountRepo.create(data);
  }

  async update(
    id: string,
    data: Partial<Pick<Account, 'code' | 'name' | 'type' | 'parentId'>>
  ): Promise<Account | null> {
    if (data.code !== undefined && !data.code) {
      throw new Error('El código de cuenta es requerido');
    }
    if (data.name !== undefined && data.name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    return this.accountRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.accountRepo.delete(id);
  }

  getHierarchicalByCompany(accounts: Account[]): Map<string, Account[]> {
    const grouped = new Map<string, Account[]>();
    accounts.forEach((account) => {
      const group = grouped.get(account.type) || [];
      grouped.set(account.type, [...group, account]);
    });
    return grouped;
  }
}
