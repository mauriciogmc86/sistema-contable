import { Company } from '@/domain/entities';
import { ICompanyRepository } from '@/domain/repositories';

export class CompanyService {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  async getAll(): Promise<Company[]> {
    return this.companyRepo.findAll();
  }

  async getById(id: string): Promise<Company | null> {
    return this.companyRepo.findById(id);
  }

  async create(data: {
    name: string;
    taxIdentifier: string;
    email: string;
    phone: string;
  }): Promise<Company> {
    if (!data.name || data.name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    if (!data.taxIdentifier) {
      throw new Error('El documento fiscal es requerido');
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Email inválido');
    }
    return this.companyRepo.create(data);
  }

  async update(
    id: string,
    data: Partial<Pick<Company, 'name' | 'taxIdentifier' | 'email' | 'phone'>>
  ): Promise<Company | null> {
    if (data.name && data.name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Email inválido');
    }
    return this.companyRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.companyRepo.delete(id);
  }

  async getCompanySummary(companyId: string): Promise<{
    company: Company | null;
    entryCount: number;
  }> {
    const company = await this.companyRepo.findById(companyId);
    // We'll get entry count from journal entry service injected in use-case
    return { company, entryCount: 0 };
  }
}
