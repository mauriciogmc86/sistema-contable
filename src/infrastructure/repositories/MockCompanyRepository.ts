import { Company } from '@/domain/entities';
import { ICompanyRepository } from '@/domain/repositories';
import { MOCK_COMPANIES } from '@/application/mockData';

let _companies: Company[] = [...MOCK_COMPANIES];

export class MockCompanyRepository implements ICompanyRepository {
  async findAll(): Promise<Company[]> {
    return Promise.resolve([..._companies]);
  }

  async findById(id: string): Promise<Company | null> {
    return Promise.resolve(_companies.find((c) => c.id === id) || null);
  }

  async create(data: { name: string; taxIdentifier: string; email: string; phone: string }): Promise<Company> {
    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _companies = [..._companies, newCompany];
    return Promise.resolve(newCompany);
  }

  async update(id: string, data: Partial<Company>): Promise<Company | null> {
    _companies = _companies.map((c) =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
    );
    return Promise.resolve(_companies.find((c) => c.id === id) || null);
  }

  async delete(id: string): Promise<boolean> {
    const exists = _companies.find((c) => c.id === id);
    if (!exists) return Promise.resolve(false);
    _companies = _companies.filter((c) => c.id !== id);
    return Promise.resolve(true);
  }
}

export const mockCompanyRepository = new MockCompanyRepository();
