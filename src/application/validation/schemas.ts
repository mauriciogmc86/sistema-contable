import { z } from "zod";
import {
  cedulaSchema,
  emailSchema,
  isoDateSchema,
  montoSchema,
  optionalPhoneSchema,
  requiredText,
  rifSchema,
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
  rif: rifSchema,
  nombre: requiredText("El nombre"),
  direccion: z.string().trim().optional(),
  registro_mercantil: z.string().trim().optional(),
  tomo_numero: z.string().trim().optional(),
  numero_registro: z.string().trim().optional(),
  fecha_constitucion: z.string().optional(),
  representante_nombre: z.string().trim().optional(),
  representante_cedula: z.union([cedulaSchema, z.literal("")]).optional(),
  representante_profesion: z.string().trim().optional(),
});
export type EmpresaInput = z.infer<typeof empresaSchema>;

/* -------------------------------------------------------------------------- */
/*  Trabajador (nómina)                                                        */
/* -------------------------------------------------------------------------- */
export const ESTADOS_CIVILES = ["Soltero", "Casado", "Divorciado", "Viudo"] as const;

export const trabajadorSchema = z.object({
  cedula: cedulaSchema,
  nombres: requiredText("Los nombres"),
  apellidos: requiredText("Los apellidos"),
  fecha_nacimiento: isoDateSchema,
  estado_civil: z.enum(ESTADOS_CIVILES, {
    errorMap: () => ({ message: "Selecciona el estado civil" }),
  }),
  cargo_nombre: requiredText("El cargo"),
  direccion_habitacion: requiredText("La dirección de habitación"),
  sueldo_base: montoSchema,
});
export type TrabajadorInput = z.infer<typeof trabajadorSchema>;

/* -------------------------------------------------------------------------- */
/*  Cliente                                                                    */
/* -------------------------------------------------------------------------- */
export const CLIENTE_STATUSES = ["activo", "inactivo"] as const;

export const clienteSchema = z.object({
  name: requiredText("El nombre"),
  email: emailSchema,
  phone: optionalPhoneSchema,
  rif: rifSchema,
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
