"use client";

import { forwardRef } from "react";
import { cn } from "@/presentation/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full min-h-24 rounded-lg border bg-input px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted-foreground/70 transition-colors duration-200",
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        invalid ? "border-danger" : "border-border",
        className,
      )}
      {...props}
    />
  );
});
