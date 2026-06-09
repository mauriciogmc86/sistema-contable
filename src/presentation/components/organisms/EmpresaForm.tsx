"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { empresaSchema, type EmpresaInput } from "@/application/validation";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { FormField } from "@/presentation/components/molecules/FormField";

export interface EmpresaFormProps {
  onSubmit: (data: EmpresaInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function EmpresaForm({ onSubmit, onCancel }: EmpresaFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaInput>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      rif: "",
      nombre: "",
      direccion: "",
      registro_mercantil: "",
      tomo_numero: "",
      numero_registro: "",
      fecha_constitucion: "",
      representante_nombre: "",
      representante_cedula: "",
      representante_profesion: "",
    },
  });

  const submit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await onSubmit(data);
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo registrar la empresa. Intenta de nuevo.",
      );
    }
  });

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      {submitError && (
        <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger sm:col-span-2">
          {submitError}
        </p>
      )}
      <FormField label="RIF" required error={errors.rif?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} placeholder="J-12345678-9" aria-describedby={describedBy} invalid={invalid} {...register("rif")} />
        )}
      </FormField>
      <FormField label="Nombre / Razón social" required error={errors.nombre?.message} className="sm:col-span-2">
        {({ id, describedBy, invalid }) => (
          <Input id={id} aria-describedby={describedBy} invalid={invalid} {...register("nombre")} />
        )}
      </FormField>
      <FormField label="Dirección fiscal" error={errors.direccion?.message} className="sm:col-span-2">
        {({ id }) => <Input id={id} {...register("direccion")} />}
      </FormField>
      <FormField label="Registro mercantil" error={errors.registro_mercantil?.message}>
        {({ id }) => <Input id={id} {...register("registro_mercantil")} />}
      </FormField>
      <FormField label="Tomo" error={errors.tomo_numero?.message}>
        {({ id }) => <Input id={id} {...register("tomo_numero")} />}
      </FormField>
      <FormField label="Número de registro" error={errors.numero_registro?.message}>
        {({ id }) => <Input id={id} {...register("numero_registro")} />}
      </FormField>
      <FormField label="Fecha de constitución" error={errors.fecha_constitucion?.message}>
        {({ id }) => <Input id={id} type="date" {...register("fecha_constitucion")} />}
      </FormField>

      <div className="sm:col-span-2">
        <p className="mb-2 mt-2 text-sm font-semibold text-foreground">Representante legal (opcional)</p>
      </div>
      <FormField label="Nombre del representante" error={errors.representante_nombre?.message}>
        {({ id }) => <Input id={id} {...register("representante_nombre")} />}
      </FormField>
      <FormField label="Cédula del representante" error={errors.representante_cedula?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} placeholder="V-12345678" aria-describedby={describedBy} invalid={invalid} {...register("representante_cedula")} />
        )}
      </FormField>
      <FormField label="Profesión / Cargo" error={errors.representante_profesion?.message}>
        {({ id }) => <Input id={id} {...register("representante_profesion")} />}
      </FormField>

      <div className="flex justify-end gap-3 pt-1 sm:col-span-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          Registrar empresa
        </Button>
      </div>
    </form>
  );
}
