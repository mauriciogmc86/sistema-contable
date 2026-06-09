export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export type AccountTypeLabel = 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Gasto';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, AccountTypeLabel> = {
  [AccountType.ASSET]: 'Activo',
  [AccountType.LIABILITY]: 'Pasivo',
  [AccountType.EQUITY]: 'Patrimonio',
  [AccountType.INCOME]: 'Ingreso',
  [AccountType.EXPENSE]: 'Gasto',
};

export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  [AccountType.ASSET]: 'text-emerald-500',
  [AccountType.LIABILITY]: 'text-rose-500',
  [AccountType.EQUITY]: 'text-amber-500',
  [AccountType.INCOME]: 'text-blue-500',
  [AccountType.EXPENSE]: 'text-orange-500',
};

export interface Account {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}
