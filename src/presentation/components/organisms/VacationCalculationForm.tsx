"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  vacationCalculationSchema,
  type VacationCalculationFormInput,
} from "@/application/validation";
import {
  formatLongDate,
  formatShortDate,
  getVacationEndDate,
  getVacationPeriodLabel,
  getVacationStartDate,
  hasCompletedFirstYear,
  toIsoDate,
  vacationBonusDaysArt192,
  vacationDaysArt190,
  completedServiceYears,
} from "@/lib/payrollDates";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { FormField } from "@/presentation/components/molecules/FormField";
import { PrefixedCedulaInput } from "@/presentation/components/molecules/PrefixedCedulaInput";
import { sueldoDiarioBs, sueldoDiarioUsd, sueldoUsdToBs } from "@/lib/payrollSalary";
import { formatNumber } from "@/presentation/utils/format";

export interface VacationCalculationFormProps {
  onCalculate: (data: VacationCalculationFormInput) => void;
}

type VacationFormValues = z.input<typeof vacationCalculationSchema>;

export function VacationCalculationForm({ onCalculate }: VacationCalculationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VacationFormValues, unknown, VacationCalculationFormInput>({
    resolver: zodResolver(vacationCalculationSchema),
    defaultValues: {
      cedula: "",
      nombres: "",
      apellidos: "",
      cargo: "",
      sueldoMensualUsd: 0,
      fechaIngreso: "",
      diasDisfrutados: 0,
      tasaBcv: 0,
      ciudad: "Maracaibo",
      fechaDocumento: new Date().toISOString().slice(0, 10),
    },
  });

  const fechaIngreso = watch("fechaIngreso");
  const sueldoMensualUsd = watch("sueldoMensualUsd");
  const tasaBcv = watch("tasaBcv");

  const sueldoMensualBs = sueldoUsdToBs(Number(sueldoMensualUsd) || 0, Number(tasaBcv) || 0);
  const sueldoDiarioUsdVal = sueldoDiarioUsd(Number(sueldoMensualUsd) || 0);
  const sueldoDiario = sueldoDiarioBs(sueldoMensualBs);
  const cestaPreview = (Number(tasaBcv) || 0) * 20;

  const preview =
    fechaIngreso && hasCompletedFirstYear(fechaIngreso)
      ? (() => {
          const start = getVacationStartDate(fechaIngreso);
          const ref = start;
          const days = vacationDaysArt190(fechaIngreso, ref);
          const end = getVacationEndDate(fechaIngreso, days, ref);
          const years = completedServiceYears(fechaIngreso, ref);
          return {
            periodo: getVacationPeriodLabel(fechaIngreso, years),
            dias190: days,
            dias192: vacationBonusDaysArt192(fechaIngreso, ref),
            desde: formatShortDate(toIsoDate(start)),
            hasta: formatShortDate(end),
          };
        })()
      : null;

  return (
    <form onSubmit={handleSubmit(onCalculate)} className="space-y-6" noValidate>
      <p className="text-sm text-muted-foreground">
        Ingresa los datos del trabajador. El sueldo se registra en dólares (USD) y se convierte a bolívares
        multiplicando por la tasa BCV del día. Las vacaciones se calculan después de 12 meses ininterrumpidos
        (LOTTT Art. 190 y 192). Este módulo no modifica la base de datos.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Cédula del trabajador" required error={errors.cedula?.message}>
          {({ id, invalid }) => (
            <Controller
              name="cedula"
              control={control}
              render={({ field }) => (
                <PrefixedCedulaInput id={id} invalid={invalid} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
              )}
            />
          )}
        </FormField>
        <FormField label="Cargo del trabajador" required error={errors.cargo?.message}>
          {({ id, invalid }) => (
            <Input id={id} placeholder="Ej. Asistente administrativo" invalid={invalid} {...register("cargo")} />
          )}
        </FormField>
        <FormField label="Nombre(s) del trabajador" required error={errors.nombres?.message}>
          {({ id, invalid }) => <Input id={id} invalid={invalid} {...register("nombres")} />}
        </FormField>
        <FormField label="Apellido(s) del trabajador" required error={errors.apellidos?.message}>
          {({ id, invalid }) => <Input id={id} invalid={invalid} {...register("apellidos")} />}
        </FormField>
        <FormField label="Sueldo mensual (USD)" required error={errors.sueldoMensualUsd?.message}>
          {({ id, invalid }) => (
            <Input
              id={id}
              type="number"
              min="0"
              step="0.01"
              invalid={invalid}
              {...register("sueldoMensualUsd", { valueAsNumber: true })}
            />
          )}
        </FormField>
        <FormField label="Tasa BCV del día" required error={errors.tasaBcv?.message}>
          {({ id, invalid }) => (
            <Input id={id} type="number" min="0" step="0.01" invalid={invalid} {...register("tasaBcv", { valueAsNumber: true })} />
          )}
        </FormField>
        <FormField label="Sueldo mensual (Bs.)" className="sm:col-span-2">
          {({ id }) => (
            <Input id={id} readOnly value={formatNumber(sueldoMensualBs, 2)} className="bg-surface-muted" />
          )}
        </FormField>
        <FormField label="Sueldo diario (USD)">
          {({ id }) => (
            <Input id={id} readOnly value={formatNumber(sueldoDiarioUsdVal, 2)} className="bg-surface-muted" />
          )}
        </FormField>
        <FormField label="Sueldo diario (Bs.)">
          {({ id }) => (
            <Input id={id} readOnly value={formatNumber(sueldoDiario, 2)} className="bg-surface-muted" />
          )}
        </FormField>
        <FormField label="Fecha de ingreso" required error={errors.fechaIngreso?.message} className="sm:col-span-2">
          {({ id, invalid }) => <Input id={id} type="date" invalid={invalid} {...register("fechaIngreso")} />}
        </FormField>

        {fechaIngreso && preview && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 sm:col-span-2">
            <p className="mb-2 text-sm font-semibold text-foreground">Vista previa (LOTTT)</p>
            <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <span>
                Ingreso: <strong className="text-foreground">{formatLongDate(fechaIngreso)}</strong>
              </span>
              <span>
                Periodo vacacional: <strong className="text-foreground">{preview.periodo}</strong>
              </span>
              <span>
                Art. 190 — Vacaciones: <strong className="text-foreground">{preview.dias190} días</strong>
              </span>
              <span>
                Art. 192 — Bono vacacional: <strong className="text-foreground">{preview.dias192} días</strong>
              </span>
              <span className="sm:col-span-2">
                DESDE: <strong className="text-foreground">{preview.desde}</strong> — HASTA:{" "}
                <strong className="text-foreground">{preview.hasta}</strong>
              </span>
            </div>
          </div>
        )}

        {fechaIngreso && !preview && (
          <p className="text-sm text-warning sm:col-span-2">
            La fecha de ingreso indica que aún no cumple 12 meses de servicio ininterrumpido.
          </p>
        )}

        <FormField label="Días ya disfrutados (deducción)" error={errors.diasDisfrutados?.message}>
          {({ id }) => <Input id={id} type="number" min="0" {...register("diasDisfrutados", { valueAsNumber: true })} />}
        </FormField>
        <FormField label="Ciudad del documento" error={errors.ciudad?.message}>
          {({ id }) => <Input id={id} {...register("ciudad")} />}
        </FormField>
        <FormField label="Fecha del documento" error={errors.fechaDocumento?.message}>
          {({ id }) => <Input id={id} type="date" {...register("fechaDocumento")} />}
        </FormField>

        <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 sm:col-span-2">
          <p className="text-xs text-muted-foreground">Cesta Ticket estimado (tasa BCV × 20 USD)</p>
          <p className="text-lg font-semibold tabular-nums">{formatNumber(cestaPreview, 2)} Bs.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Calcular y generar formato</Button>
      </div>
    </form>
  );
}
