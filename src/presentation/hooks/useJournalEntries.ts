"use client";

import { journalEntryUseCases } from "@/infrastructure/di";
import { useAsync } from "./useAsync";

export function useJournalEntries(companyId?: string) {
  return useAsync(
    () => (companyId ? journalEntryUseCases.getByCompany(companyId) : journalEntryUseCases.getAll()),
    [companyId],
  );
}
