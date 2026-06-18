"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clausulaGlobalSchema, type ClausulaGlobalInput } from "@/application/validation";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { ClausulaFieldset } from "@/presentation/components/molecules/ClausulaFieldset";
import { FormField } from "@/presentation/components/molecules/FormField";

export interface ClausulaGlobalFormProps {
  onSubmit: (data: ClausulaGlobalInput) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: ClausulaGlobalInput;
  submitLabel?: string;
}

const EMPTY: ClausulaGlobalInput = { titulo: "", descripcion: "", orden: 0 };

export function ClausulaGlobalForm({
  onSubmit,
  onCancel,
  defaultValues,
  submitLabel = "Guardar cláusula",
}: ClausulaGlobalFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClausulaGlobalInput>({
    resolver: zodResolver(clausulaGlobalSchema),
    defaultValues: defaultValues ?? EMPTY,
  });

  const submit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await onSubmit(data);
      reset(EMPTY);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo guardar la cláusula. Intenta de nuevo.",
      );
    }
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {submitError && (
        <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger">
          {submitError}
        </p>
      )}

      <ClausulaFieldset
        tituloName="titulo"
        descripcionName="descripcion"
        register={register}
        tituloError={errors.titulo?.message}
        descripcionError={errors.descripcion?.message}
        showTokenHint
      />

      <FormField label="Orden" hint="Número para ordenar las cláusulas (menor = primero)">
        {({ id }) => (
          <Input
            id={id}
            type="number"
            min="0"
            step="10"
            {...register("orden", { valueAsNumber: true })}
          />
        )}
      </FormField>

      <div className="flex justify-end gap-3 pt-1">
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
  );
}
