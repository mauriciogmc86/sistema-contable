"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  liquidationCalculationSchema,
  type LiquidationCalculationFormInput,
} from "@/application/validation";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { FormField } from "@/presentation/components/molecules/FormField";
import { PrefixedCedulaInput } from "@/presentation/components/molecules/PrefixedCedulaInput";
import { sueldoDiarioBs, sueldoDiarioUsd, sueldoUsdToBs } from "@/lib/payrollSalary";
import { formatNumber } from "@/presentation/utils/format";

export interface LiquidationCalculationFormProps {
  onCalculate: (data: LiquidationCalculationFormInput) => void;
}

type LiquidationFormValues = z.input<typeof liquidationCalculationSchema>;

export function LiquidationCalculationForm({ onCalculate }: LiquidationCalculationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LiquidationFormValues, unknown, LiquidationCalculationFormInput>({
    resolver: zodResolver(liquidationCalculationSchema),
    defaultValues: {
      cedula: "",
      nombres: "",
      apellidos: "",
      cargo: "",
      sueldoMensualUsd: 0,
      tasaBcv: 0,
      fechaIngreso: "",
      diasTrabajados: 30,
      diasVacacionesPendientes: 15,
      diasBonoVacacional: 15,
      cestaTicketUsd: 20,
      ciudad: "Maracaibo",
      fechaDocumento: new Date().toISOString().slice(0, 10),
    },
  });

  const sueldoMensualUsd = watch("sueldoMensualUsd");
  const tasaBcv = watch("tasaBcv");

  const sueldoMensualBs = sueldoUsdToBs(Number(sueldoMensualUsd) || 0, Number(tasaBcv) || 0);
  const sueldoDiarioUsdVal = sueldoDiarioUsd(Number(sueldoMensualUsd) || 0);
  const sueldoDiario = sueldoDiarioBs(sueldoMensualBs);

  return (
    <form onSubmit={handleSubmit(onCalculate)} className="space-y-6" noValidate>
      <p className="text-sm text-muted-foreground">
        Ingresa los datos del trabajador. El sueldo se registra en dólares (USD) y se convierte a bolívares
        multiplicando por la tasa BCV del día. Este módulo solo genera el cálculo y el formato; no modifica
        la base de datos.
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
          {({ id, invalid }) => <Input id={id} invalid={invalid} {...register("cargo")} />}
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
        <FormField label="Fecha de ingreso" required error={errors.fechaIngreso?.message}>
          {({ id, invalid }) => <Input id={id} type="date" invalid={invalid} {...register("fechaIngreso")} />}
        </FormField>
        <FormField label="Días trabajados pendientes" required error={errors.diasTrabajados?.message}>
          {({ id, invalid }) => (
            <Input id={id} type="number" min="0" invalid={invalid} {...register("diasTrabajados", { valueAsNumber: true })} />
          )}
        </FormField>
        <FormField label="Días vacaciones pendientes" error={errors.diasVacacionesPendientes?.message}>
          {({ id }) => (
            <Input id={id} type="number" min="0" {...register("diasVacacionesPendientes", { valueAsNumber: true })} />
          )}
        </FormField>
        <FormField label="Días bono vacacional" error={errors.diasBonoVacacional?.message}>
          {({ id }) => (
            <Input id={id} type="number" min="0" {...register("diasBonoVacacional", { valueAsNumber: true })} />
          )}
        </FormField>
        <FormField label="Cesta Ticket USD" error={errors.cestaTicketUsd?.message}>
          {({ id }) => (
            <Input id={id} type="number" min="0" {...register("cestaTicketUsd", { valueAsNumber: true })} />
          )}
        </FormField>
        <FormField label="Ciudad del documento" error={errors.ciudad?.message}>
          {({ id }) => <Input id={id} {...register("ciudad")} />}
        </FormField>
        <FormField label="Fecha del documento" error={errors.fechaDocumento?.message}>
          {({ id }) => <Input id={id} type="date" {...register("fechaDocumento")} />}
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Calcular liquidación</Button>
      </div>
    </form>
  );
}
