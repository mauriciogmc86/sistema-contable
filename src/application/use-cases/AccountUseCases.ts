import { AccountService } from '../services/AccountService';

export function buildGetAccountUseCases(service: AccountService) {
  return {
    getAll: (companyId: string) => service.getByCompany(companyId),
    getById: (id: string) => service.getById(id),
    getByType: (companyId: string, type: string) => service.getByType(companyId, type),
    getHierarchical: (companyId: string) =>
      service.getByCompany(companyId).then(service.getHierarchicalByCompany.bind(service)),
    create: (data: Parameters<AccountService['create']>[0]) => service.create(data),
    update: (id: string, data: Parameters<AccountService['update']>[1]) => service.update(id, data),
    delete: (id: string) => service.delete(id),
  };
}
