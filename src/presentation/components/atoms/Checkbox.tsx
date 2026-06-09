"use client";

import { forwardRef } from "react";
import { cn } from "@/presentation/utils/cn";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, id, ...props },
  ref,
) {
  const input = (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 cursor-pointer rounded border-border bg-input text-primary",
        "accent-[var(--color-primary)] focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
  if (!label) return input;
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      {input}
      {label}
    </label>
  );
});
