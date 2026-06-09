"use client";

import { useId } from "react";
import { Label } from "@/presentation/components/atoms/Label";
import { cn } from "@/presentation/utils/cn";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  /** Render prop receives ids to wire the control for accessibility. */
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}

/**
 * Accessible field wrapper: associates label, hint and error (role="alert")
 * with the control via aria-describedby / aria-invalid.
 */
export function FormField({ label, required, error, hint, className, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
