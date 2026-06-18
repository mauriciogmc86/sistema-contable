"use client";

import { Info } from "lucide-react";
import type { UseFormRegister, FieldPath, FieldValues } from "react-hook-form";
import { Input } from "@/presentation/components/atoms/Input";
import { Textarea } from "@/presentation/components/atoms/Textarea";
import { FormField } from "@/presentation/components/molecules/FormField";
import { CLAUSE_TOKENS } from "@/lib/contractClauses";

interface ClausulaFieldsetProps<T extends FieldValues> {
  tituloName: FieldPath<T>;
  descripcionName: FieldPath<T>;
  register: UseFormRegister<T>;
  tituloError?: string;
  descripcionError?: string;
  showTokenHint?: boolean;
}

export function ClausulaFieldset<T extends FieldValues>({
  tituloName,
  descripcionName,
  register,
  tituloError,
  descripcionError,
  showTokenHint = true,
}: ClausulaFieldsetProps<T>) {
  return (
    <div className="flex flex-col gap-3">
      <FormField label="Título" required error={tituloError}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            placeholder="Ej: CLÁUSULA PRIMERA: OBLIGACIONES DEL TRABAJADOR."
            aria-describedby={describedBy}
            invalid={invalid}
            {...register(tituloName)}
          />
        )}
      </FormField>
      <FormField label="Descripción" required error={descripcionError}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            rows={5}
            placeholder="Texto de la cláusula. Usa {{cargo}}, {{empresa}}, {{salario}}, etc."
            aria-describedby={describedBy}
            invalid={invalid}
            {...register(descripcionName)}
          />
        )}
      </FormField>
      {showTokenHint && (
        <details className="rounded-lg border border-border bg-surface-muted text-xs">
          <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 font-medium text-muted-foreground select-none">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Tokens dinámicos disponibles
          </summary>
          <ul className="divide-y divide-border px-3 pb-2">
            {CLAUSE_TOKENS.map(({ token, label, example }) => (
              <li key={token} className="flex flex-col gap-0.5 py-1.5">
                <span className="font-mono font-semibold text-foreground">{token}</span>
                <span className="text-muted-foreground">
                  {label} — <em>{example}</em>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
