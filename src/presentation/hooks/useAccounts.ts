"use client";

import { accountUseCases } from "@/infrastructure/di";
import { useAsync } from "./useAsync";

export function useAccounts(companyId?: string) {
  return useAsync(
    () => (companyId ? accountUseCases.getAll(companyId) : Promise.resolve([])),
    [companyId],
  );
}
