"use client";

import { forwardRef } from "react";
import { cn } from "@/presentation/utils/cn";

const inputBase =
  "w-full h-11 rounded-lg border bg-input px-3.5 text-sm text-foreground " +
  "placeholder:text-muted-foreground/70 transition-all duration-200 shadow-sm " +
  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/12 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leftIcon, ...props },
  ref,
) {
  if (leftIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {leftIcon}
        </span>
        <input
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(inputBase, "pl-9", invalid ? "border-danger" : "border-border", className)}
          {...props}
        />
      </div>
    );
  }
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(inputBase, invalid ? "border-danger" : "border-border", className)}
      {...props}
    />
  );
});
