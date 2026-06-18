import { formatShortDate } from "@/lib/payrollDates";
import type { ClausulaRecord } from "@/infrastructure/repositories/SupabaseClausulaRepository";

const CLAUSULA_FALLBACK =
  "Del contrato de trabajo por tiempo determinado, suscrito entre las partes con fecha {fechaContrato}, lo cual constituye una violación al compromiso firmado entre las partes.";

/** Texto sugerido para el campo cláusula, editable antes de generar. */
export function buildDefaultClausulaText(
  clausulas: ClausulaRecord[],
  fechaIngreso?: string,
): string {
  const fechaContrato = fechaIngreso ? formatShortDate(fechaIngreso) : "—";
  const suffix = CLAUSULA_FALLBACK.replace("{fechaContrato}", fechaContrato);

  if (clausulas.length === 0) return suffix;

  const principal = clausulas[0];
  const titulo = principal.titulo?.trim() ?? "";
  const descripcion = principal.descripcion?.trim() ?? "";
  if (!titulo && !descripcion) return suffix;

  const cuerpo = titulo && descripcion ? `${titulo}: ${descripcion}` : titulo || descripcion;
  return `${cuerpo}. ${suffix}`;
}

export function amonestacionOrdinal(n: number): string {
  const ordinals: Record<number, string> = {
    1: "primera",
    2: "segunda",
    3: "tercera",
    4: "cuarta",
    5: "quinta",
  };
  return ordinals[n] ?? `${n}ª`;
}

export interface AmonestacionAdvertencia {
  tienePrevias: boolean;
  esSegundaOMas: boolean;
  mensaje: string;
  mensajeCritico: string | null;
}

export function buildAmonestacionAdvertencia(
  amonestacionesPrevias: number,
  siguienteNumero: number,
): AmonestacionAdvertencia {
  if (amonestacionesPrevias === 0) {
    return {
      tienePrevias: false,
      esSegundaOMas: false,
      mensaje: "Este trabajador no tiene amonestaciones previas. Se generará la primera amonestación.",
      mensajeCritico: null,
    };
  }

  const ordinal = amonestacionOrdinal(siguienteNumero);
  const mensaje = `Este trabajador ya tiene ${amonestacionesPrevias} amonestación${amonestacionesPrevias === 1 ? "" : "es"} registrada${amonestacionesPrevias === 1 ? "" : "s"}. Está generando la ${ordinal} amonestación.`;

  const mensajeCritico =
    siguienteNumero >= 2
      ? "Advertencia: con una segunda amonestación el trabajador queda en peligro de despido directo por causa justificada."
      : null;

  return {
    tienePrevias: true,
    esSegundaOMas: siguienteNumero >= 2,
    mensaje,
    mensajeCritico,
  };
}
