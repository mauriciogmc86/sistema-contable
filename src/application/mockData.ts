import { Account, Company, JournalEntry, AccountType } from '@/domain/entities';

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Tech Solutions S.A.C.',
    taxIdentifier: '20601234891',
    email: 'contacto@techsolutions.pe',
    phone: '+51 1 555-0100',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-03-01T08:30:00Z',
  },
  {
    id: 'comp-2',
    name: 'Grupo Consultor EIRL',
    taxIdentifier: '20451236912',
    email: 'info@grupoconsultor.pe',
    phone: '+51 1 555-0200',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2025-04-15T11:00:00Z',
  },
  {
    id: 'comp-3',
    name: 'Importaciones del Sur SAC',
    taxIdentifier: '20551234567',
    email: 'ventas@importsdelur.pe',
    phone: '+51 1 555-0300',
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2025-05-01T10:00:00Z',
  },
];

export const MOCK_ACCOUNTS: Account[] = [
  // TECH SOLUTIONS
  ...['comp-1'].flatMap((c) => [
    { id: `${c}-101`, companyId: c, code: '101', name: 'Caja General', type: AccountType.ASSET, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-102`, companyId: c, code: '102', name: 'Banco Cuenta Corriente', type: AccountType.ASSET, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-103`, companyId: c, code: '103', name: 'Cuentas por Cobrar', type: AccountType.ASSET, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-104`, companyId: c, code: '104', name: 'Inventario de Productos', type: AccountType.ASSET, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-105`, companyId: c, code: '105', name: 'Equipos y Muebles', type: AccountType.ASSET, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-201`, companyId: c, code: '201', name: 'Cuentas por Pagar', type: AccountType.LIABILITY, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-202`, companyId: c, code: '202', name: 'Impuestos por Pagar', type: AccountType.LIABILITY, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-203`, companyId: c, code: '203', name: 'Préstamos Bancarios', type: AccountType.LIABILITY, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-301`, companyId: c, code: '301', name: 'Capital Social', type: AccountType.EQUITY, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-302`, companyId: c, code: '302', name: 'Utilidades Retenidas', type: AccountType.EQUITY, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-401`, companyId: c, code: '401', name: 'Ventas de Servicios', type: AccountType.INCOME, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-402`, companyId: c, code: '402', name: 'Ingresos por Consultoría', type: AccountType.INCOME, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-501`, companyId: c, code: '501', name: 'Gastos de Personal', type: AccountType.EXPENSE, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-502`, companyId: c, code: '502', name: 'Alquiler de Oficina', type: AccountType.EXPENSE, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-503`, companyId: c, code: '503', name: 'Gastos de Internet', type: AccountType.EXPENSE, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
    { id: `${c}-504`, companyId: c, code: '504', name: 'Gastos de Servicios', type: AccountType.EXPENSE, parentId: null, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-03-01T08:30:00Z' },
  ]),
  // GRUPO CONSULTOR
  ...['comp-2'].flatMap((c) => [
    { id: `${c}-101`, companyId: c, code: '101', name: 'Caja', type: AccountType.ASSET, parentId: null, createdAt: '2024-02-20T09:00:00Z', updatedAt: '2025-04-15T11:00:00Z' },
    { id: `${c}-102`, companyId: c, code: '102', name: 'Banco', type: AccountType.ASSET, parentId: null, createdAt: '2024-02-20T09:00:00Z', updatedAt: '2025-04-15T11:00:00Z' },
    { id: `${c}-201`, companyId: c, code: '201', name: 'Proveedores', type: AccountType.LIABILITY, parentId: null, createdAt: '2024-02-20T09:00:00Z', updatedAt: '2025-04-15T11:00:00Z' },
    { id: `${c}-301`, companyId: c, code: '301', name: 'Capital', type: AccountType.EQUITY, parentId: null, createdAt: '2024-02-20T09:00:00Z', updatedAt: '2025-04-15T11:00:00Z' },
    { id: `${c}-401`, companyId: c, code: '401', name: 'Honorarios', type: AccountType.INCOME, parentId: null, createdAt: '2024-02-20T09:00:00Z', updatedAt: '2025-04-15T11:00:00Z' },
    { id: `${c}-501`, companyId: c, code: '501', name: 'Gastos Operativos', type: AccountType.EXPENSE, parentId: null, createdAt: '2024-02-20T09:00:00Z', updatedAt: '2025-04-15T11:00:00Z' },
  ]),
  // IMPORTACIONES DEL SUR
  ...['comp-3'].flatMap((c) => [
    { id: `${c}-101`, companyId: c, code: '101', name: 'Caja', type: AccountType.ASSET, parentId: null, createdAt: '2024-03-10T14:00:00Z', updatedAt: '2025-05-01T10:00:00Z' },
    { id: `${c}-102`, companyId: c, code: '102', name: 'Banco', type: AccountType.ASSET, parentId: null, createdAt: '2024-03-10T14:00:00Z', updatedAt: '2025-05-01T10:00:00Z' },
    { id: `${c}-104`, companyId: c, code: '104', name: 'Inventario', type: AccountType.ASSET, parentId: null, createdAt: '2024-03-10T14:00:00Z', updatedAt: '2025-05-01T10:00:00Z' },
    { id: `${c}-201`, companyId: c, code: '201', name: 'Proveedores', type: AccountType.LIABILITY, parentId: null, createdAt: '2024-03-10T14:00:00Z', updatedAt: '2025-05-01T10:00:00Z' },
    { id: `${c}-301`, companyId: c, code: '301', name: 'Capital Social', type: AccountType.EQUITY, parentId: null, createdAt: '2024-03-10T14:00:00Z', updatedAt: '2025-05-01T10:00:00Z' },
    { id: `${c}-401`, companyId: c, code: '401', name: 'Ventas por Importación', type: AccountType.INCOME, parentId: null, createdAt: '2024-03-10T14:00:00Z', updatedAt: '2025-05-01T10:00:00Z' },
    { id: `${c}-501`, companyId: c, code: '501', name: 'Costos de Importación', type: AccountType.EXPENSE, parentId: null, createdAt: '2024-03-10T14:00:00Z', updatedAt: '2025-05-01T10:00:00Z' },
  ]),
] as Account[];

export const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    companyId: 'comp-1',
    date: '2025-05-01',
    description: 'Pago de alquiler de oficina mensual',
    lines: [
      { id: 'el-1', accountId: 'comp-1-502', accountCode: '502', accountName: 'Alquiler de Oficina', debit: 8500, credit: 0, description: 'Alquiler mayo 2025' },
      { id: 'el-2', accountId: 'comp-1-102', accountCode: '102', accountName: 'Banco Cuenta Corriente', debit: 0, credit: 8500, description: 'Pago alquiler' },
    ],
    createdAt: '2025-05-01T08:00:00Z',
    updatedAt: '2025-05-01T08:00:00Z',
  },
  {
    id: 'entry-2',
    companyId: 'comp-1',
    date: '2025-05-05',
    description: 'Facturación de servicios mensuales',
    lines: [
      { id: 'el-3', accountId: 'comp-1-102', accountCode: '102', accountName: 'Banco Cuenta Corriente', debit: 45000, credit: 0, description: 'Depósito cliente' },
      { id: 'el-4', accountId: 'comp-1-401', accountCode: '401', accountName: 'Ventas de Servicios', debit: 0, credit: 45000, description: 'Ingreso servicios' },
    ],
    createdAt: '2025-05-05T09:30:00Z',
    updatedAt: '2025-05-05T09:30:00Z',
  },
  {
    id: 'entry-3',
    companyId: 'comp-1',
    date: '2025-05-10',
    description: 'Pago de planilla de sueldos',
    lines: [
      { id: 'el-5', accountId: 'comp-1-501', accountCode: '501', accountName: 'Gastos de Personal', debit: 32000, credit: 0, description: 'Sueldos mayo' },
      { id: 'el-6', accountId: 'comp-1-102', accountCode: '102', accountName: 'Banco Cuenta Corriente', debit: 0, credit: 32000, description: 'Pago planilla' },
    ],
    createdAt: '2025-05-10T14:00:00Z',
    updatedAt: '2025-05-10T14:00:00Z',
  },
  {
    id: 'entry-4',
    companyId: 'comp-1',
    date: '2025-05-12',
    description: 'Compra de equipos de cómputo',
    lines: [
      { id: 'el-7', accountId: 'comp-1-105', accountCode: '105', accountName: 'Equipos y Muebles', debit: 12400, credit: 0, description: 'Equipos oficina' },
      { id: 'el-8', accountId: 'comp-1-102', accountCode: '102', accountName: 'Banco Cuenta Corriente', debit: 0, credit: 12400, description: 'Pago proveedor' },
    ],
    createdAt: '2025-05-12T10:00:00Z',
    updatedAt: '2025-05-12T10:00:00Z',
  },
  {
    id: 'entry-5',
    companyId: 'comp-2',
    date: '2025-05-02',
    description: 'Honorarios recibidos por asesoría',
    lines: [
      { id: 'el-9', accountId: 'comp-2-102', accountCode: '102', accountName: 'Banco', debit: 28000, credit: 0, description: 'Honorarios mayo' },
      { id: 'el-10', accountId: 'comp-2-401', accountCode: '401', accountName: 'Honorarios', debit: 0, credit: 28000, description: 'Ingreso asesoría' },
    ],
    createdAt: '2025-05-02T11:00:00Z',
    updatedAt: '2025-05-02T11:00:00Z',
  },
  {
    id: 'entry-6',
    companyId: 'comp-3',
    date: '2025-05-03',
    description: 'Venta de mercadería importada',
    lines: [
      { id: 'el-11', accountId: 'comp-3-101', accountCode: '101', accountName: 'Caja', debit: 78000, credit: 0, description: 'Venta contado' },
      { id: 'el-12', accountId: 'comp-3-401', accountCode: '401', accountName: 'Ventas por Importación', debit: 0, credit: 78000, description: 'Ingreso venta' },
    ],
    createdAt: '2025-05-03T16:00:00Z',
    updatedAt: '2025-05-03T16:00:00Z',
  },
];
