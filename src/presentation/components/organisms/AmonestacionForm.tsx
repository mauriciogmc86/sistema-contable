"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { amonestacionSchema, type AmonestacionFormInput } from "@/application/validation";
import {
  createAmonestacion,
  type AmonestacionRecord,
  type AmonestacionWorkerContext,
} from "@/infrastructure/repositories/SupabaseAmonestacionRepository";
import { fullWorkerName, workerCargo } from "@/lib/workerDocumentUtils";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { AmonestacionWarningAlert } from "@/presentation/components/molecules/AmonestacionWarningAlert";
import { FormField } from "@/presentation/components/molecules/FormField";

interface AmonestacionFormProps {
  worker: AmonestacionWorkerContext;
  onGenerated: (record: AmonestacionRecord) => void;
}

type AmonestacionFormValues = z.input<typeof amonestacionSchema>;

export function AmonestacionForm({ worker, onGenerated }: AmonestacionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AmonestacionFormValues, unknown, AmonestacionFormInput>({
    resolver: zodResolver(amonestacionSchema),
    defaultValues: {
      clausula: worker.clausulaSugerida,
      ciudad: "Maracaibo",
      fechaDocumento: new Date().toISOString().slice(0, 10),
    },
  });

  const submit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      const record = await createAmonestacion({
        trabajadorId: worker.trabajadorId,
        clausula: data.clausula,
        ciudad: data.ciudad,
        fechaDocumento: data.fechaDocumento,
      });
      onGenerated(record);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo registrar la amonestación.",
      );
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm">
        <p className="font-medium text-foreground">{fullWorkerName(worker.empleado)}</p>
        <p className="text-muted-foreground">
          {worker.empleado.cedula} · {workerCargo(worker.empleado) || "Sin cargo"}
        </p>
        <p className="text-muted-foreground">Empresa: {worker.empresa?.nombre ?? "—"}</p>
      </div>

      <AmonestacionWarningAlert
        amonestacionesPrevias={worker.amonestacionesPrevias}
        siguienteNumero={worker.siguienteNumero}
      />

      <div className="grid gap-4 sm:grid-cols-2">
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

        <FormField
          label="Cláusula incumplida"
          required
          error={errors.clausula?.message}
          className="sm:col-span-2"
          hint="Puede editar el texto según el caso. Se incluirá en la carta de amonestación."
        >
          {({ id, describedBy, invalid }) => (
            <textarea
              id={id}
              rows={6}
              aria-describedby={describedBy}
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm ${invalid ? "border-danger" : "border-border"}`}
              {...register("clausula")}
            />
          )}
        </FormField>
      </div>

      {submitError && (
        <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger">
          {submitError}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Generar y registrar amonestación
        </Button>
      </div>
    </form>
  );
}
