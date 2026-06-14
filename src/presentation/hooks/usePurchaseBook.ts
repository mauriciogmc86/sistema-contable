"use client";

import { purchaseBookUseCases } from "@/infrastructure/di";
import { useAsync } from "./useAsync";

export function usePurchaseBook(companyId?: string) {
  return useAsync(
    () => (companyId ? purchaseBookUseCases.getByCompany(companyId) : purchaseBookUseCases.getAll()),
    [companyId],
  );
}
