import { JournalEntryService } from '../services/JournalEntryService';

export type DashboardMetrics = {
  monthlyIncome: number;
  monthlyExpenses: number;
  balance: number;
  entryCount: number;
  companyCount: number;
};

export function buildDashboardMetrics(service: JournalEntryService, companyId?: string) {
  return async (): Promise<DashboardMetrics> => {
    const entries = companyId
      ? await service.getByCompany(companyId)
      : await service.getAll();

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthEntries = entries.filter((e) => e.date.startsWith(currentMonth));

    const companies = new Set(entries.map((e) => e.companyId)).size;

    let income = 0;
    let expenses = 0;

    monthEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.credit > 0) income += line.credit;
        if (line.debit > 0) expenses += line.debit;
      });
    });

    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      balance: income - expenses,
      entryCount: entries.length,
      companyCount: companies,
    };
  };
}
