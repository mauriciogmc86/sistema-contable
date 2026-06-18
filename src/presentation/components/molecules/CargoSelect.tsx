"use client";

import { useMemo } from "react";
import Link from "next/link";
import { listCargos } from "@/infrastructure/repositories/SupabaseCargoRepository";
import { Select } from "@/presentation/components/atoms/Select";
import { useAsync } from "@/presentation/hooks";

interface CargoSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  /** Incluye un cargo legacy al editar si ya no está en el catálogo. */
  fallbackOption?: string;
}

export function CargoSelect({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  fallbackOption,
}: CargoSelectProps) {
  const cargosQuery = useAsync(() => listCargos(), []);

  const options = useMemo(() => {
    const items = cargosQuery.data ?? [];
    const names = new Set(items.map((c) => c.nombre_cargo.toLowerCase()));
    const fallback = fallbackOption?.trim();
    if (fallback && !names.has(fallback.toLowerCase())) {
      return [...items, { id: -1, nombre_cargo: fallback, funciones: "" }];
    }
    return items;
  }, [cargosQuery.data, fallbackOption]);

  if (cargosQuery.loading) {
    return (
      <Select id={id} disabled aria-describedby={describedBy} invalid={invalid}>
        <option value="">Cargando cargos…</option>
      </Select>
    );
  }

  if (cargosQuery.error) {
    return (
      <p className="text-sm text-danger" role="alert">
        No se pudieron cargar los cargos. Intenta de nuevo.
      </p>
    );
  }

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay cargos registrados.{" "}
        <Link href="/dashboard/cargos" className="font-medium text-primary underline-offset-2 hover:underline">
          Agrega un cargo
        </Link>{" "}
        antes de registrar trabajadores.
      </p>
    );
  }

  return (
    <Select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-describedby={describedBy}
      invalid={invalid}
    >
      <option value="" disabled>
        Seleccionar cargo
      </option>
      {options.map((cargo) => (
        <option key={cargo.id} value={cargo.nombre_cargo}>
          {cargo.nombre_cargo}
        </option>
      ))}
    </Select>
  );
}
