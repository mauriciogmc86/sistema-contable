"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { calcNational16Taxes } from "@/domain/entities/PurchaseBookEntry";
import { compraSchema, PURCHASE_DOCUMENT_TYPES, type CompraInput } from "@/application/validation";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { Select } from "@/presentation/components/atoms/Select";
import { FormField } from "@/presentation/components/molecules/FormField";
import { PrefixedRifInput } from "@/presentation/components/molecules/PrefixedRifInput";
import { formatCurrency } from "@/presentation/utils/format";

type CompraFormValues = z.input<typeof compraSchema>;

const DOCUMENT_LABELS: Record<(typeof PURCHASE_DOCUMENT_TYPES)[number], string> = {
  FACTURA: "Factura",
  NOTA_DEBITO: "Nota de débito",
  NOTA_CREDITO: "Nota de crédito",
};

export interface CompraFormProps {
  onSubmit: (data: CompraInput) => Promise<void> | void;
  onCancel?: () => void;
  submitError?: string | null;
}

export function CompraForm({ onSubmit, onCancel, submitError }: CompraFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompraFormValues, unknown, CompraInput>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      documentType: "FACTURA",
      documentNumber: "",
      controlNumber: "",
      affectedDocument: "",
      vendorName: "",
      vendorRif: "",
      totalIncludingIva: 0,
      exemptAmount: 0,
      base8: 0,
      importBase16: 0,
      ivaWithheld: 0,
      withholdingVoucherNumber: "",
      igtf: 0,
    },
  });

  const totalIncludingIva = Number(watch("totalIncludingIva")) || 0;
  const exemptAmount = Number(watch("exemptAmount")) || 0;
  const { base16, iva16 } = calcNational16Taxes(totalIncludingIva, exemptAmount);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Fecha" required error={errors.date?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="date" aria-describedby={describedBy} invalid={invalid} {...register("date")} />
          )}
        </FormField>

        <FormField label="Tipo documento" required error={errors.documentType?.message}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} aria-describedby={describedBy} invalid={invalid} {...register("documentType")}>
              {PURCHASE_DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {DOCUMENT_LABELS[t]}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Nro. documento" required error={errors.documentNumber?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              placeholder="00005874"
              aria-describedby={describedBy}
              invalid={invalid}
              {...register("documentNumber")}
            />
          )}
        </FormField>

        <FormField label="Nro. control" required error={errors.controlNumber?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              placeholder="00-005905"
              aria-describedby={describedBy}
              invalid={invalid}
              {...register("controlNumber")}
            />
          )}
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Doc. afectado" error={errors.affectedDocument?.message}>
          {({ id }) => (
            <Input id={id} placeholder="Solo para notas de crédito/débito" {...register("affectedDocument")} />
          )}
        </FormField>

        <FormField label="Nombre o razón social" required error={errors.vendorName?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              placeholder="UNITRUCK C.A"
              aria-describedby={describedBy}
              invalid={invalid}
              {...register("vendorName")}
            />
          )}
        </FormField>

        <FormField label="R.I.F." required error={errors.vendorRif?.message}>
          {({ id, describedBy, invalid }) => (
            <Controller
              name="vendorRif"
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Total compras incl. IVA" required error={errors.totalIncludingIva?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              step="0.01"
              min="0"
              aria-describedby={describedBy}
              invalid={invalid}
              {...register("totalIncludingIva")}
            />
          )}
        </FormField>

        <FormField label="Monto exento (opcional)" error={errors.exemptAmount?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              step="0.01"
              min="0"
              aria-describedby={describedBy}
              invalid={invalid}
              {...register("exemptAmount")}
            />
          )}
        </FormField>

        <FormField label="Base imponible 16% (calculada)">
          {({ id }) => (
            <Input id={id} readOnly value={formatCurrency(base16)} className="bg-muted/40" tabIndex={-1} />
          )}
        </FormField>

        <FormField label="I.V.A. 16% (calculado)">
          {({ id }) => (
            <Input id={id} readOnly value={formatCurrency(iva16)} className="bg-muted/40" tabIndex={-1} />
          )}
        </FormField>
      </div>

      <div className="rounded-lg border border-border bg-surface/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Datos adicionales (opcional)</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Base compras 8%" error={errors.base8?.message}>
            {({ id, invalid }) => (
              <Input id={id} type="number" step="0.01" min="0" invalid={invalid} {...register("base8")} />
            )}
          </FormField>

          <FormField label="Base importación 16%" error={errors.importBase16?.message}>
            {({ id, invalid }) => (
              <Input id={id} type="number" step="0.01" min="0" invalid={invalid} {...register("importBase16")} />
            )}
          </FormField>

          <FormField label="IVA retenido a terceros" error={errors.ivaWithheld?.message}>
            {({ id, invalid }) => (
              <Input id={id} type="number" step="0.01" min="0" invalid={invalid} {...register("ivaWithheld")} />
            )}
          </FormField>

          <FormField label="Nº comprobante retención" error={errors.withholdingVoucherNumber?.message}>
            {({ id }) => (
              <Input id={id} placeholder="20241000001559" {...register("withholdingVoucherNumber")} />
            )}
          </FormField>

          <FormField label="IGTF" error={errors.igtf?.message}>
            {({ id, invalid }) => (
              <Input id={id} type="number" step="0.01" min="0" invalid={invalid} {...register("igtf")} />
            )}
          </FormField>
        </div>
      </div>

      {submitError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          Guardar factura
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
