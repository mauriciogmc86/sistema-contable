import { z } from "zod";
import { formatCedula, formatRif, parseRifInput, stripCedulaPrefix } from "@/lib/venezuelanId";

/** Venezuelan RIF completo (normalizado). */
export const rifSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[VEJPGRC]-?\d{8}-?\d$/, "RIF inválido. Formato esperado: J-12345678-9");

/** Venezuelan cédula completa (normalizada). */
export const cedulaSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[VE]-?\d{6,8}$/, "Cédula inválida. Formato esperado: V-12345678");

/** Solo dígitos de cédula → normaliza a V-XXXXXXXX al validar. */
export const cedulaDigitsSchema = z
  .string()
  .trim()
  .min(1, "La cédula es requerida")
  .superRefine((val, ctx) => {
    const digits = stripCedulaPrefix(val);
    if (!/^\d{6,8}$/.test(digits)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ingresa entre 6 y 8 dígitos" });
    }
  })
  .transform((val) => formatCedula(stripCedulaPrefix(val)));

/** Cédula opcional (representante legal). */
export const optionalCedulaDigitsSchema = z
  .string()
  .trim()
  .superRefine((val, ctx) => {
    if (val === "") return;
    const digits = stripCedulaPrefix(val);
    if (!/^\d{6,8}$/.test(digits)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ingresa entre 6 y 8 dígitos" });
    }
  })
  .transform((val) => (val === "" ? "" : formatCedula(stripCedulaPrefix(val))));

/** Solo dígitos de RIF (8 + verificador) → normaliza a J-XXXXXXXX-X al validar. */
export const rifDigitsSchema = z
  .string()
  .trim()
  .min(1, "El RIF es requerido")
  .superRefine((val, ctx) => {
    const { body, check } = parseRifInput(val);
    if (!/^\d{9}$/.test(`${body}${check}`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresa 9 dígitos (incluye el verificador)",
      });
    }
  })
  .transform((val) => {
    const { body, check } = parseRifInput(val);
    return formatRif(body, check);
  });

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
