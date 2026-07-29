"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cargoSchema, type CargoInput } from "@/application/validation";
import { existsCargoNombre } from "@/infrastructure/repositories/duplicateChecks";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { Textarea } from "@/presentation/components/atoms/Textarea";
import { FormField } from "@/presentation/components/molecules/FormField";
import { ClausulaFieldset } from "@/presentation/components/molecules/ClausulaFieldset";
import { DuplicateRecordModal } from "@/presentation/components/molecules/DuplicateRecordModal";
import { normalizeCargoClausulas } from "@/lib/clausulaOrdering";
import { ensureFreshSession, toUserFacingError } from "@/lib/supabase/session";

type CargoFormValues = z.input<typeof cargoSchema>;

export interface CargoFormProps {
  onSubmit: (data: CargoInput) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: CargoInput;
  excludeCargoId?: number;
  submitLabel?: string;
}

const EMPTY_CARGO: CargoFormValues = {
  nombre_cargo: "",
  funciones: "",
  clausulas: [],
};

function toFormValues(input?: CargoInput): CargoFormValues {
  if (!input) return EMPTY_CARGO;
  return {
    nombre_cargo: input.nombre_cargo ?? "",
    funciones: input.funciones ?? "",
    clausulas: (input.clausulas ?? []).map((clausula, index) => ({
      id: clausula.id,
      titulo: clausula.titulo ?? "",
      descripcion: clausula.descripcion ?? "",
      orden: clausula.orden ?? (index + 1) * 10,
    })),
  };
}

export function CargoForm({
  onSubmit,
  onCancel,
  defaultValues,
  excludeCargoId,
  submitLabel = "Guardar cargo",
}: CargoFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CargoFormValues, unknown, CargoInput>({
    resolver: zodResolver(cargoSchema),
    defaultValues: toFormValues(defaultValues),
  });

  // keyName distinto de "id" para no pisar el UUID real de la cláusula en BD.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "clausulas",
    keyName: "fieldKey",
  });

  const submit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await ensureFreshSession();
      const duplicate = await existsCargoNombre(data.nombre_cargo, excludeCargoId);
      if (duplicate) {
        setDuplicateOpen(true);
        return;
      }
      await onSubmit({
        ...data,
        clausulas: normalizeCargoClausulas(data.clausulas).map(({ id, titulo, descripcion, orden }) => ({
          ...(id && !id.startsWith("tmp-") ? { id } : {}),
          titulo,
          descripcion,
          orden,
        })),
      });
      reset(EMPTY_CARGO);
    } catch (err) {
      setSubmitError(toUserFacingError(err, "No se pudo guardar el cargo. Intenta de nuevo."));
    }
  });

  return (
    <>
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        {submitError && (
          <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger">
            {submitError}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre del cargo" required error={errors.nombre_cargo?.message} className="sm:col-span-2">
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="Ej: CHOFER, VENDEDOR, CAJERA"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register("nombre_cargo")}
              />
            )}
          </FormField>
          <FormField label="Funciones generales" error={errors.funciones?.message} className="sm:col-span-2">
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                rows={3}
                placeholder="Descripción general de las funciones del cargo (opcional)"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register("funciones")}
              />
            )}
          </FormField>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Cláusulas del cargo</h3>
              <p className="text-xs text-muted-foreground">
                {fields.length > 0
                  ? `${fields.length} cláusula${fields.length === 1 ? "" : "s"} en este cargo.`
                  : "Si agregas cláusulas aquí, reemplazan las globales del mismo número (p. ej. CLÁUSULA PRIMERA). Las demás cláusulas globales siguen aplicando."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  id: `tmp-${Date.now()}-${fields.length}`,
                  titulo: "",
                  descripcion: "",
                  orden: (fields.length + 1) * 10,
                })
              }
              leftIcon={<Plus className="h-4 w-4" aria-hidden />}
            >
              Agregar cláusula
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
              Sin cláusulas específicas para este cargo. Las cláusulas globales aplican a todos los contratos.
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.fieldKey} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <GripVertical className="h-4 w-4" aria-hidden />
                    Cláusula {index + 1}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar cláusula ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-danger" aria-hidden />
                  </Button>
                </div>
                <ClausulaFieldset
                  tituloName={`clausulas.${index}.titulo` as never}
                  descripcionName={`clausulas.${index}.descripcion` as never}
                  register={register as never}
                  tituloError={errors.clausulas?.[index]?.titulo?.message}
                  descripcionError={errors.clausulas?.[index]?.descripcion?.message}
                  showTokenHint={index === 0}
                />
              </div>
            ))}
          </div>

          {fields.length > 0 && (
            <details className="mt-1 rounded-lg border border-border bg-surface-muted text-xs">
              <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 font-medium text-muted-foreground select-none">
                Ver tokens dinámicos disponibles
              </summary>
              <ul className="divide-y divide-border px-3 pb-2">
                {["{{cargo}}", "{{empresa}}", "{{direccion_empresa}}", "{{salario}}", "{{fecha_inicio}}", "{{fecha_fin}}", "{{fecha_inicio_num}}"].map((t) => (
                  <li key={t} className="py-1 font-mono font-semibold text-foreground">{t}</li>
                ))}
              </ul>
            </details>
          )}
        </div>

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

      <DuplicateRecordModal
        open={duplicateOpen}
        kind="cargo"
        onClose={() => setDuplicateOpen(false)}
      />
    </>
  );
}
