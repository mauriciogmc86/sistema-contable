import { z } from "zod";
import {
  cedulaDigitsSchema,
  emailSchema,
  isoDateSchema,
  montoSchema,
  optionalCedulaDigitsSchema,
  optionalPhoneSchema,
  requiredText,
  rifDigitsSchema,
} from "./common";

/* -------------------------------------------------------------------------- */
/*  Auth                                                                       */
/* -------------------------------------------------------------------------- */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/*  Empresa                                                                    */
/* -------------------------------------------------------------------------- */
export const empresaSchema = z.object({
  rif: rifDigitsSchema,
  nombre: requiredText("El nombre"),
  direccion: z.string().trim().optional(),
  registro_mercantil: z.string().trim().optional(),
  tomo_numero: z.string().trim().optional(),
  numero_registro: z.string().trim().optional(),
  fecha_constitucion: z.string().optional(),
  representante_nombre: z.string().trim().optional(),
  representante_cedula: optionalCedulaDigitsSchema,
  representante_profesion: z.string().trim().optional(),
  logo_url: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  const hasRepData =
    Boolean(data.representante_nombre?.trim()) || Boolean(data.representante_profesion?.trim());
  if (hasRepData && !data.representante_cedula?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["representante_cedula"],
      message: "Ingresa la cédula del representante legal",
    });
  }
});
export type EmpresaInput = z.infer<typeof empresaSchema>;

/* -------------------------------------------------------------------------- */
/*  Trabajador (nómina)                                                        */
/* -------------------------------------------------------------------------- */
export const ESTADOS_CIVILES = ["Soltero", "Casado", "Divorciado", "Viudo"] as const;

export const trabajadorSchema = z.object({
  cedula: cedulaDigitsSchema,
  nombres: requiredText("Los nombres"),
  apellidos: requiredText("Los apellidos"),
  fecha_nacimiento: isoDateSchema,
  estado_civil: z.enum(ESTADOS_CIVILES, {
    errorMap: () => ({ message: "Selecciona el estado civil" }),
  }),
  cargo_nombre: requiredText("El cargo"),
  direccion_habitacion: requiredText("La dirección de habitación"),
  sueldo_base: montoSchema,
  fecha_ingreso: isoDateSchema,
});
export type TrabajadorInput = z.infer<typeof trabajadorSchema>;

/** Campos del trabajador ingresados manualmente (módulo nómina, sin BD). */
export const payrollWorkerFieldsSchema = z.object({
  cedula: cedulaDigitsSchema,
  nombres: requiredText("Los nombres"),
  apellidos: requiredText("Los apellidos"),
  cargo: requiredText("El cargo"),
  sueldoMensualUsd: z.coerce
    .number({ invalid_type_error: "Debe ser un número" })
    .positive("El sueldo mensual debe ser mayor a cero"),
  fechaIngreso: isoDateSchema,
});
export type PayrollWorkerFieldsInput = z.infer<typeof payrollWorkerFieldsSchema>;

export const vacationCalculationSchema = payrollWorkerFieldsSchema.extend({
  tasaBcv: z.coerce.number().positive("La tasa BCV debe ser mayor a cero"),
  diasDisfrutados: z.coerce.number().int().min(0).max(30),
  ciudad: z.string().trim(),
  fechaDocumento: z.string().optional(),
});
export type VacationCalculationFormInput = z.infer<typeof vacationCalculationSchema>;

export const liquidationCalculationSchema = payrollWorkerFieldsSchema.extend({
  diasTrabajados: z.coerce.number().int().min(0).max(365),
  diasVacacionesPendientes: z.coerce.number().int().min(0).max(30),
  diasBonoVacacional: z.coerce.number().int().min(0).max(30),
  tasaBcv: z.coerce.number().positive("La tasa BCV debe ser mayor a cero"),
  cestaTicketUsd: z.coerce.number().positive(),
  ciudad: z.string().trim().optional(),
  fechaDocumento: z.string().optional(),
});
export type LiquidationCalculationFormInput = z.infer<typeof liquidationCalculationSchema>;

/* -------------------------------------------------------------------------- */
/*  Cliente                                                                    */
/* -------------------------------------------------------------------------- */
export const CLIENTE_STATUSES = ["activo", "inactivo"] as const;

export const clienteSchema = z.object({
  name: requiredText("El nombre"),
  email: emailSchema,
  phone: optionalPhoneSchema,
  rif: rifDigitsSchema,
  status: z.enum(CLIENTE_STATUSES),
  creditLimit: z.coerce.number().nonnegative("No puede ser negativo").default(0),
});
export type ClienteInput = z.infer<typeof clienteSchema>;

/* -------------------------------------------------------------------------- */
/*  Asiento contable (partida doble)                                           */
/* -------------------------------------------------------------------------- */
export const asientoLineSchema = z.object({
  accountId: z.string().min(1, "Selecciona una cuenta"),
  description: z.string().trim().optional(),
  debit: z.coerce.number().nonnegative("No puede ser negativo").default(0),
  credit: z.coerce.number().nonnegative("No puede ser negativo").default(0),
});

export const asientoSchema = z
  .object({
    date: isoDateSchema,
    number: requiredText("El número", 1),
    description: requiredText("La descripción", 3),
    reference: z.string().trim().optional(),
    lines: z.array(asientoLineSchema).min(2, "Un asiento requiere al menos 2 líneas"),
  })
  .refine(
    (data) => {
      const debit = data.lines.reduce((s, l) => s + (l.debit || 0), 0);
      const credit = data.lines.reduce((s, l) => s + (l.credit || 0), 0);
      return Math.abs(debit - credit) < 0.01 && debit > 0;
    },
    { message: "El asiento no está balanceado: el total Debe debe igualar al Haber", path: ["lines"] },
  );
export type AsientoInput = z.infer<typeof asientoSchema>;

/* -------------------------------------------------------------------------- */
/*  Cuenta contable                                                            */
/* -------------------------------------------------------------------------- */
export const ACCOUNT_TYPES = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"] as const;

export const accountSchema = z.object({
  code: requiredText("El código", 1),
  name: requiredText("El nombre"),
  type: z.enum(ACCOUNT_TYPES),
  parentId: z.string().nullable().optional(),
});
export type AccountInput = z.infer<typeof accountSchema>;

/* -------------------------------------------------------------------------- */
/*  Libro de compras (IVA)                                                     */
/* -------------------------------------------------------------------------- */
export const PURCHASE_DOCUMENT_TYPES = ["FACTURA", "NOTA_DEBITO", "NOTA_CREDITO"] as const;

export const compraSchema = z
  .object({
    date: isoDateSchema,
    documentType: z.enum(PURCHASE_DOCUMENT_TYPES, {
      errorMap: () => ({ message: "Selecciona el tipo de documento" }),
    }),
    documentNumber: requiredText("El número de factura", 1),
    controlNumber: requiredText("El número de control", 1),
    affectedDocument: z.string().trim().optional(),
    vendorName: requiredText("El nombre del proveedor", 2),
    vendorRif: rifDigitsSchema,
    totalIncludingIva: z.coerce.number().positive("El monto total debe ser mayor a cero"),
    exemptAmount: z.coerce.number().nonnegative("No puede ser negativo").default(0),
    base8: z.coerce.number().nonnegative("No puede ser negativo").default(0),
    importBase16: z.coerce.number().nonnegative("No puede ser negativo").default(0),
    ivaWithheld: z.coerce.number().nonnegative("No puede ser negativo").default(0),
    withholdingVoucherNumber: z.string().trim().optional(),
    igtf: z.coerce.number().nonnegative("No puede ser negativo").default(0),
  })
  .refine((data) => data.exemptAmount <= data.totalIncludingIva, {
    message: "El monto exento no puede superar el total",
    path: ["exemptAmount"],
  });
export type CompraInput = z.infer<typeof compraSchema>;
