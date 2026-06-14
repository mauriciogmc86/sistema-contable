"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { empresaSchema, type EmpresaInput } from "@/application/validation";
import { existsEmpresaRif } from "@/infrastructure/repositories/duplicateChecks";
import { cedulaToInputValue, rifToInputValue } from "@/lib/venezuelanId";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { DuplicateRecordModal, type DuplicateRecordKind } from "@/presentation/components/molecules/DuplicateRecordModal";
import { FormField } from "@/presentation/components/molecules/FormField";
import { PrefixedCedulaInput } from "@/presentation/components/molecules/PrefixedCedulaInput";
import { PrefixedRifInput } from "@/presentation/components/molecules/PrefixedRifInput";

type EmpresaFormValues = z.input<typeof empresaSchema>;

export interface EmpresaFormProps {
  onSubmit: (data: EmpresaInput, logoFile?: File | null) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: EmpresaInput;
  excludeEmpresaId?: string;
  submitLabel?: string;
}

const EMPTY_EMPRESA: EmpresaFormValues = {
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
  logo_url: "",
};

function toFormValues(input?: EmpresaInput): EmpresaFormValues {
  if (!input) return EMPTY_EMPRESA;
  return {
    ...input,
    rif: rifToInputValue(input.rif),
    representante_cedula: cedulaToInputValue(input.representante_cedula ?? ""),
  };
}

export function EmpresaForm({
  onSubmit,
  onCancel,
  defaultValues,
  excludeEmpresaId,
  submitLabel = "Registrar empresa",
}: EmpresaFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateKind, setDuplicateKind] = useState<DuplicateRecordKind>("rif");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultValues?.logo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormValues, unknown, EmpresaInput>({
    resolver: zodResolver(empresaSchema),
    defaultValues: toFormValues(defaultValues),
  });

  useEffect(() => {
    reset(toFormValues(defaultValues));
    setLogoPreview(defaultValues?.logo_url || null);
    setLogoFile(null);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const submit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      const rifDuplicate = await existsEmpresaRif(data.rif, excludeEmpresaId);
      if (rifDuplicate) {
        setDuplicateKind("rif");
        setDuplicateOpen(true);
        return;
      }

      await onSubmit(data, logoFile);
      reset(EMPTY_EMPRESA);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo registrar la empresa. Intenta de nuevo.",
      );
    }
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
  };

  return (
    <>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        {submitError && (
          <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger sm:col-span-2">
            {submitError}
          </p>
        )}
        <FormField label="RIF" required error={errors.rif?.message}>
          {({ id, describedBy, invalid }) => (
            <Controller
              name="rif"
              control={control}
              render={({ field }) => (
                <PrefixedRifInput
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
        <FormField label="Nombre / Razón social" required error={errors.nombre?.message} className="sm:col-span-2">
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} invalid={invalid} {...register("nombre")} />
          )}
        </FormField>
        <FormField label="Logo de la empresa" className="sm:col-span-2">
          {({ id, describedBy }) => (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Vista previa del logo"
                  className="h-16 w-auto max-w-[160px] rounded border border-border object-contain bg-white p-1"
                />
              )}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  id={id}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  aria-describedby={describedBy}
                  className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                  onChange={handleLogoChange}
                />
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP o GIF. Máximo 5 MB. Aparecerá en los contratos legales.</p>
              </div>
            </div>
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
            <Controller
              name="representante_cedula"
              control={control}
              render={({ field }) => (
                <PrefixedCedulaInput
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
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
            {submitLabel}
          </Button>
        </div>
      </form>

      <DuplicateRecordModal open={duplicateOpen} kind={duplicateKind} onClose={() => setDuplicateOpen(false)} />
    </>
  );
}
