"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { asientoSchema, type AsientoInput } from "@/application/validation";

type AsientoFormValues = z.input<typeof asientoSchema>;
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { Select } from "@/presentation/components/atoms/Select";
import { FormField } from "@/presentation/components/molecules/FormField";
import { formatCurrency } from "@/presentation/utils/format";

export interface AccountOption {
  id: string;
  code: string;
  name: string;
}

export interface AsientoFormProps {
  accounts: AccountOption[];
  onSubmit: (data: AsientoInput) => Promise<void> | void;
  onCancel?: () => void;
}

const emptyLine = { accountId: "", description: "", debit: 0, credit: 0 };

export function AsientoForm({ accounts, onSubmit, onCancel }: AsientoFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AsientoFormValues, unknown, AsientoInput>({
    resolver: zodResolver(asientoSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      number: "",
      description: "",
      reference: "",
      lines: [emptyLine, emptyLine],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const lines = watch("lines");
  const totalDebit = lines?.reduce((s, l) => s + (Number(l.debit) || 0), 0) ?? 0;
  const totalCredit = lines?.reduce((s, l) => s + (Number(l.credit) || 0), 0) ?? 0;
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Fecha" required error={errors.date?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="date" aria-describedby={describedBy} invalid={invalid} {...register("date")} />
          )}
        </FormField>
        <FormField label="Número" required error={errors.number?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} placeholder="AS-0001" aria-describedby={describedBy} invalid={invalid} {...register("number")} />
          )}
        </FormField>
        <FormField label="Referencia" error={errors.reference?.message} className="sm:col-span-2 lg:col-span-2">
          {({ id }) => <Input id={id} placeholder="Documento, factura..." {...register("reference")} />}
        </FormField>
      </div>

      <FormField label="Descripción" required error={errors.description?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} placeholder="Concepto del asiento" aria-describedby={describedBy} invalid={invalid} {...register("description")} />
        )}
      </FormField>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Líneas del asiento</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(emptyLine)}
            leftIcon={<Plus className="h-4 w-4" aria-hidden />}
          >
            Agregar línea
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-5">
                <Controller
                  control={control}
                  name={`lines.${index}.accountId`}
                  render={({ field: f }) => (
                    <Select aria-label="Cuenta" invalid={Boolean(errors.lines?.[index]?.accountId)} {...f}>
                      <option value="">Selecciona cuenta</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} — {a.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </div>
              <div className="sm:col-span-3">
                <Input aria-label="Descripción de línea" placeholder="Detalle" {...register(`lines.${index}.description`)} />
              </div>
              <div className="sm:col-span-2">
                <Input aria-label="Debe" type="number" step="0.01" min="0" placeholder="Debe" {...register(`lines.${index}.debit`)} />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <Input aria-label="Haber" type="number" step="0.01" min="0" placeholder="Haber" {...register(`lines.${index}.credit`)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar línea"
                  onClick={() => fields.length > 2 && remove(index)}
                  disabled={fields.length <= 2}
                >
                  <Trash2 className="h-4 w-4 text-danger" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {errors.lines?.message && (
          <p role="alert" className="text-xs font-medium text-danger">
            {errors.lines.message}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-6 rounded-lg bg-surface-muted px-4 py-3 text-sm tabular-nums">
          <span className="text-muted-foreground">
            Debe: <span className="font-semibold text-foreground">{formatCurrency(totalDebit)}</span>
          </span>
          <span className="text-muted-foreground">
            Haber: <span className="font-semibold text-foreground">{formatCurrency(totalCredit)}</span>
          </span>
          <span className={balanced ? "font-semibold text-success" : "font-semibold text-danger"}>
            {balanced ? "Balanceado" : "Descuadrado"}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} disabled={!balanced}>
          Guardar asiento
        </Button>
      </div>
    </form>
  );
}
