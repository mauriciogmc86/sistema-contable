"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ESTADOS_CIVILES, trabajadorSchema, type TrabajadorInput } from "@/application/validation";
import { existsTrabajadorCedula } from "@/infrastructure/repositories/duplicateChecks";
import { cedulaToInputValue } from "@/lib/venezuelanId";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { Select } from "@/presentation/components/atoms/Select";
import { DuplicateRecordModal } from "@/presentation/components/molecules/DuplicateRecordModal";
import { CargoSelect } from "@/presentation/components/molecules/CargoSelect";
import { FormField } from "@/presentation/components/molecules/FormField";
import { PrefixedCedulaInput } from "@/presentation/components/molecules/PrefixedCedulaInput";
import { useCurrencyStore } from "@/presentation/store/useCurrencyStore";

type TrabajadorFormValues = z.input<typeof trabajadorSchema>;

export interface TrabajadorFormProps {
  onSubmit: (data: TrabajadorInput) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: TrabajadorInput;
  excludeTrabajadorId?: string;
  submitLabel?: string;
}

const EMPTY_TRABAJADOR: TrabajadorFormValues = {
  cedula: "",
  nombres: "",
  apellidos: "",
  fecha_nacimiento: "",
  cargo_nombre: "",
  direccion_habitacion: "",
  sueldo_base: 0,
  estado_civil: "Soltero",
  es_fiscal: undefined as unknown as boolean,
  fecha_ingreso: "",
};

function toFormValues(input?: TrabajadorInput): TrabajadorFormValues {
  if (!input) return EMPTY_TRABAJADOR;
  return {
    ...input,
    cedula: cedulaToInputValue(input.cedula),
  };
}

export function TrabajadorForm({
  onSubmit,
  onCancel,
  defaultValues,
  excludeTrabajadorId,
  submitLabel = "Guardar trabajador",
}: TrabajadorFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const currency = useCurrencyStore((s) => s.currency);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrabajadorFormValues, unknown, TrabajadorInput>({
    resolver: zodResolver(trabajadorSchema),
    defaultValues: toFormValues(defaultValues),
  });

  const submit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      const duplicate = await existsTrabajadorCedula(data.cedula, excludeTrabajadorId);
      if (duplicate) {
        setDuplicateOpen(true);
        return;
      }
      await onSubmit(data);
      reset(EMPTY_TRABAJADOR);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo guardar el trabajador. Intenta de nuevo.",
      );
    }
  });

  const salaryLabel = currency === "USD" ? "Salario Base (USD)" : "Salario Base (Bs.)";

  return (
    <>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        {submitError && (
          <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger sm:col-span-2">
            {submitError}
          </p>
        )}
        <FormField label="Cédula" required error={errors.cedula?.message}>
          {({ id, describedBy, invalid }) => (
            <Controller
              name="cedula"
              control={control}
              render={({ field }) => (
                <PrefixedCedulaInput
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          )}
        </FormField>
        <FormField label="Fecha de nacimiento" required error={errors.fecha_nacimiento?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="date" aria-describedby={describedBy} invalid={invalid} {...register("fecha_nacimiento")} />
          )}
        </FormField>
        <FormField label="Nombres" required error={errors.nombres?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} placeholder="Ej: José Luis" aria-describedby={describedBy} invalid={invalid} {...register("nombres")} />
          )}
        </FormField>
        <FormField label="Apellidos" required error={errors.apellidos?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} placeholder="Ej: Pérez García" aria-describedby={describedBy} invalid={invalid} {...register("apellidos")} />
          )}
        </FormField>
        <FormField label="Fecha de ingreso" required error={errors.fecha_ingreso?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="date" aria-describedby={describedBy} invalid={invalid} {...register("fecha_ingreso")} />
          )}
        </FormField>
        <FormField label="Estado civil" required error={errors.estado_civil?.message}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} aria-describedby={describedBy} invalid={invalid} defaultValue={defaultValues?.estado_civil ?? ""} {...register("estado_civil")}>
              <option value="" disabled>
                Seleccionar
              </option>
              {ESTADOS_CIVILES.map((ec) => (
                <option key={ec} value={ec}>
                  {ec}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label="Tipo fiscal" required error={errors.es_fiscal?.message}>
          {({ id, describedBy, invalid }) => (
            <Controller
              name="es_fiscal"
              control={control}
              render={({ field }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={field.value === undefined ? "" : String(field.value)}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : value === "true");
                  }}
                  onBlur={field.onBlur}
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  <option value="true">Fiscal</option>
                  <option value="false">No fiscal</option>
                </Select>
              )}
            />
          )}
        </FormField>
        <FormField label="Cargo / Puesto" required error={errors.cargo_nombre?.message}>
          {({ id, describedBy, invalid }) => (
            <Controller
              name="cargo_nombre"
              control={control}
              render={({ field }) => (
                <CargoSelect
                  id={id}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={invalid}
                  describedBy={describedBy}
                  fallbackOption={defaultValues?.cargo_nombre}
                />
              )}
            />
          )}
        </FormField>
        <FormField label={salaryLabel} required error={errors.sueldo_base?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              min="0"
              step="0.01"
              aria-describedby={describedBy}
              invalid={invalid}
              {...register("sueldo_base", { valueAsNumber: true })}
            />
          )}
        </FormField>
        <FormField label="Dirección de habitación" required error={errors.direccion_habitacion?.message} className="sm:col-span-2">
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} invalid={invalid} {...register("direccion_habitacion")} />
          )}
        </FormField>

        <div className="flex justify-end gap-3 pt-1 sm:col-span-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" isLoading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>

      <DuplicateRecordModal open={duplicateOpen} kind="cedula" onClose={() => setDuplicateOpen(false)} />
    </>
  );
}
