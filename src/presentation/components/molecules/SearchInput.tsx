"use client";

import { Search } from "lucide-react";
import { Input, type InputProps } from "@/presentation/components/atoms/Input";

export interface SearchInputProps extends Omit<InputProps, "leftIcon" | "type"> {
  "aria-label"?: string;
}

export function SearchInput({ placeholder = "Buscar...", ...props }: SearchInputProps) {
  return (
    <Input
      type="search"
      placeholder={placeholder}
      aria-label={props["aria-label"] ?? "Buscar"}
      leftIcon={<Search className="h-4 w-4" aria-hidden />}
      {...props}
    />
  );
}
