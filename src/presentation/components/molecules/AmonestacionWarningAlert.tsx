"use client";

import { AlertTriangle, Info } from "lucide-react";
import { buildAmonestacionAdvertencia } from "@/lib/amonestacionUtils";

interface AmonestacionWarningAlertProps {
  amonestacionesPrevias: number;
  siguienteNumero: number;
}

export function AmonestacionWarningAlert({
  amonestacionesPrevias,
  siguienteNumero,
}: AmonestacionWarningAlertProps) {
  const advertencia = buildAmonestacionAdvertencia(amonestacionesPrevias, siguienteNumero);
  const isCritical = advertencia.esSegundaOMas;

  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm ${
        isCritical
          ? "border-danger bg-danger-subtle text-danger"
          : advertencia.tienePrevias
            ? "border-warning bg-warning-subtle text-warning"
            : "border-border bg-surface-muted text-muted-foreground"
      }`}
    >
      <div className="flex items-start gap-2">
        {isCritical ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        )}
        <div className="space-y-1">
          <p className="font-medium">{advertencia.mensaje}</p>
          {advertencia.mensajeCritico && (
            <p className="font-semibold">{advertencia.mensajeCritico}</p>
          )}
        </div>
      </div>
    </div>
  );
}
