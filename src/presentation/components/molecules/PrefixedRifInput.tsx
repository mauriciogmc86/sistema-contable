"use client";

import { forwardRef } from "react";
import { rifToInputValue } from "@/lib/venezuelanId";
import { cn } from "@/presentation/utils/cn";

export interface PrefixedRifInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  invalid?: boolean;
}

export const PrefixedRifInput = forwardRef<HTMLInputElement, PrefixedRifInputProps>(
  function PrefixedRifInput({ value = "", onChange, invalid, className, id, ...props }, ref) {
    const digits = rifToInputValue(value);

    return (
      <div
        className={cn(
          "flex h-11 overflow-hidden rounded-lg border bg-input shadow-sm transition-all duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/12",
          invalid ? "border-danger" : "border-border",
        )}
      >
        <span className="flex shrink-0 items-center border-r border-border bg-surface-muted px-3 text-sm font-semibold text-muted-foreground">
          J-
        </span>
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={invalid || undefined}
          placeholder="123456789"
          maxLength={9}
          value={digits}
          onChange={(e) => onChange?.(e.target.value.replace(/\D/g, "").slice(0, 9))}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
