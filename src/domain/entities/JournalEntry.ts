export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  date: string;
  description: string;
  lines: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
}

export const isEntryBalanced = (lines: JournalEntryLine[]): boolean => {
  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
};

export const getEntryTotals = (lines: JournalEntryLine[]) => ({
  totalDebit: lines.reduce((sum, line) => sum + line.debit, 0),
  totalCredit: lines.reduce((sum, line) => sum + line.credit, 0),
});
