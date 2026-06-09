"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ESTADOS_CIVILES, trabajadorSchema, type TrabajadorInput } from "@/application/validation";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { Select } from "@/presentation/components/atoms/Select";
import { FormField } from "@/presentation/components/molecules/FormField";
import { useCurrencyStore } from "@/presentation/store/useCurrencyStore";

export interface TrabajadorFormProps {
  onSubmit: (data: TrabajadorInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function TrabajadorForm({ onSubmit, onCancel }: TrabajadorFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const currency = useCurrencyStore((s) => s.currency);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrabajadorInput>({
    resolver: zodResolver(trabajadorSchema),
    defaultValues: {
      cedula: "",
      nombres: "",
      apellidos: "",
      fecha_nacimiento: "",
      cargo_nombre: "",
      direccion_habitacion: "",
      sueldo_base: 0,
    },
  });

  const submit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await onSubmit(data);
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo guardar el trabajador. Intenta de nuevo.",
      );
    }
  });

  const salaryLabel = currency === "USD" ? "Salario Base (USD)" : "Salario Base (Bs.)";

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      {submitError && (
        <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger sm:col-span-2">
          {submitError}
        </p>
      )}
      <FormField label="Cédula" required error={errors.cedula?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} placeholder="V-12345678" aria-describedby={describedBy} invalid={invalid} {...register("cedula")} />
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
      <FormField label="Estado civil" required error={errors.estado_civil?.message}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} aria-describedby={describedBy} invalid={invalid} defaultValue="" {...register("estado_civil")}>
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
      <FormField label="Cargo / Puesto" required error={errors.cargo_nombre?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} placeholder="Ej: Ayudante, Chofer, Vendedor" aria-describedby={describedBy} invalid={invalid} {...register("cargo_nombre")} />
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
          Guardar trabajador
        </Button>
      </div>
    </form>
  );
}
