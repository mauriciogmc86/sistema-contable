import { CompanyService } from '../services/CompanyService';

export function buildCompanyUseCases(service: CompanyService) {
  return {
    getAll: () => service.getAll(),
    getById: (id: string) => service.getById(id),
    create: (data: Parameters<CompanyService['create']>[0]) => service.create(data),
    update: (id: string, data: Parameters<CompanyService['update']>[1]) => service.update(id, data),
    delete: (id: string) => service.delete(id),
  };
}
