import { z } from "zod";

/** Venezuelan RIF: letter (V,E,J,P,G,R,C) + 8 digits + 1 check digit. */
export const rifSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[VEJPGRC]-?\d{8}-?\d$/, "RIF inválido. Formato esperado: J-12345678-9");

/** Venezuelan cédula: V/E + 6 to 8 digits. */
export const cedulaSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[VE]-?\d{6,8}$/, "Cédula inválida. Formato esperado: V-12345678");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "El correo es requerido")
  .email("Correo electrónico inválido");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?58)?[-\s]?0?4\d{2}[-\s]?\d{7}$|^0?2\d{2}[-\s]?\d{7}$/, "Teléfono venezolano inválido");

export const optionalPhoneSchema = z
  .union([phoneSchema, z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

/** Non-negative monetary amount with up to 2 decimals. */
export const montoSchema = z
  .number({ invalid_type_error: "Debe ser un número" })
  .nonnegative("No puede ser negativo")
  .finite("Monto inválido");

export const requiredText = (label: string, min = 2) =>
  z.string().trim().min(min, `${label} debe tener al menos ${min} caracteres`);

export const isoDateSchema = z
  .string()
  .min(1, "La fecha es requerida")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida");
