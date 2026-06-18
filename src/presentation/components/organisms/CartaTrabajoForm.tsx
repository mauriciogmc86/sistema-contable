"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  CONVERSION_CURRENCIES,
  cartaTrabajoSchema,
  type CartaTrabajoFormInput,
} from "@/application/validation";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { Select } from "@/presentation/components/atoms/Select";
import { FormField } from "@/presentation/components/molecules/FormField";
import type { WorkerDocumentData } from "@/infrastructure/repositories/SupabaseLegalRepository";
import { fullWorkerName, workerCargo } from "@/lib/workerDocumentUtils";
import { formatNumber } from "@/presentation/utils/format";

interface CartaTrabajoFormProps {
  worker: WorkerDocumentData;
  onGenerate: (data: CartaTrabajoFormInput) => void;
}

type CartaTrabajoFormValues = z.input<typeof cartaTrabajoSchema>;

export function CartaTrabajoForm({ worker, onGenerate }: CartaTrabajoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CartaTrabajoFormValues, unknown, CartaTrabajoFormInput>({
    resolver: zodResolver(cartaTrabajoSchema),
    defaultValues: {
      tasaBcv: 0,
      monedaConversion: "USD",
      ciudad: "Maracaibo",
      fechaDocumento: new Date().toISOString().slice(0, 10),
    },
  });

  const tasaBcv = Number(watch("tasaBcv")) || 0;
  const salarioBase = Number(worker.empleado.salario_base) || 0;
  const sueldoBs = salarioBase * tasaBcv;

  return (
    <form onSubmit={handleSubmit(onGenerate)} className="space-y-4" noValidate>
      <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm">
        <p className="font-medium text-foreground">{fullWorkerName(worker.empleado)}</p>
        <p className="text-muted-foreground">
          {worker.empleado.cedula} · {workerCargo(worker.empleado) || "Sin cargo"} · Salario base:{" "}
          {formatNumber(salarioBase, 2)} USD
        </p>
        <p className="text-muted-foreground">
          Empresa: {worker.empresa?.nombre ?? "—"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tasa BCV" required error={errors.tasaBcv?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              min="0"
              step="0.01"
              aria-describedby={describedBy}
              invalid={invalid}
              {...register("tasaBcv", { valueAsNumber: true })}
            />
          )}
        </FormField>

        <FormField label="Moneda de conversión" required error={errors.monedaConversion?.message}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} aria-describedby={describedBy} invalid={invalid} {...register("monedaConversion")}>
              {CONVERSION_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c === "USD" ? "Dólar (USD)" : "Euro (EUR)"}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Ciudad" error={errors.ciudad?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} invalid={invalid} {...register("ciudad")} />
          )}
        </FormField>

        <FormField label="Fecha del documento" error={errors.fechaDocumento?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="date" aria-describedby={describedBy} invalid={invalid} {...register("fechaDocumento")} />
          )}
        </FormField>
      </div>

      {tasaBcv > 0 && (
        <p className="text-sm text-muted-foreground">
          Sueldo mensual estimado: {formatNumber(sueldoBs, 2)} Bs. (a tasa {formatNumber(tasaBcv, 2)})
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit">Generar carta de trabajo</Button>
      </div>
    </form>
  );
}
