/**
 * Composition root. Wires domain services to concrete repositories and exposes
 * ready-to-use use-cases. The UI depends only on these use-cases (never on
 * Supabase or repositories directly).
 *
 * Scope: companies use Supabase (real data); the accounting module
 * (accounts / journal entries) uses in-memory mock repositories.
 */
import { AccountService } from "@/application/services/AccountService";
import { CompanyService } from "@/application/services/CompanyService";
import { JournalEntryService } from "@/application/services/JournalEntryService";
import { buildGetAccountUseCases } from "@/application/use-cases/AccountUseCases";
import { buildCompanyUseCases } from "@/application/use-cases/CompanyUseCases";
import { buildDashboardMetrics, type DashboardMetrics } from "@/application/use-cases/DashboardUseCases";
import { buildJournalEntryUseCases } from "@/application/use-cases/JournalEntryUseCases";
import {
  mockAccountRepository,
  mockJournalEntryRepository,
} from "@/infrastructure/repositories";
import { supabaseCompanyRepository } from "@/infrastructure/repositories/SupabaseCompanyRepository";

const companyService = new CompanyService(supabaseCompanyRepository);
const accountService = new AccountService(mockAccountRepository);
const journalEntryService = new JournalEntryService(mockJournalEntryRepository);

export const companyUseCases = buildCompanyUseCases(companyService);
export const accountUseCases = buildGetAccountUseCases(accountService);
export const journalEntryUseCases = buildJournalEntryUseCases(journalEntryService);

export function getDashboardMetrics(companyId?: string): Promise<DashboardMetrics> {
  return buildDashboardMetrics(journalEntryService, companyId)();
}

export type { DashboardMetrics };
