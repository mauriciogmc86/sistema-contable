"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cedulaDigitsSchema } from "@/application/validation";
import { Button } from "@/presentation/components/atoms/Button";
import { PrefixedCedulaInput } from "@/presentation/components/molecules/PrefixedCedulaInput";

interface WorkerCedulaSearchProps<T> {
  onFound: (data: T) => void;
  onClear?: () => void;
  searchWorker: (cedula: string) => Promise<T | null>;
  label?: string;
  inputId?: string;
}

export function WorkerCedulaSearch<T>({
  onFound,
  onClear,
  searchWorker,
  label = "Cédula del trabajador",
  inputId = "worker-cedula-search",
}: WorkerCedulaSearchProps<T>) {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onClear?.();

    const parsed = cedulaDigitsSchema.safeParse(cedula);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Cédula inválida");
      return;
    }

    setLoading(true);
    try {
      const data = await searchWorker(parsed.data);
      if (!data) {
        setError("Trabajador no encontrado.");
        return;
      }
      onFound(data);
    } catch {
      setError("Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
      <div className="flex-1">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
        <PrefixedCedulaInput
          id={inputId}
          value={cedula}
          onChange={setCedula}
          invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" isLoading={loading} leftIcon={<Search className="h-4 w-4" aria-hidden />}>
        Buscar
      </Button>
    </form>
  );
}
