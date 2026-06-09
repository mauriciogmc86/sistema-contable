"use client";

import { useState } from "react";
import { Download, FileText, Printer, Search } from "lucide-react";
import { cedulaSchema } from "@/application/validation";
import { getContractByCedula, type ContractData } from "@/infrastructure/repositories/SupabaseLegalRepository";
import { exportToDocx, exportToPdf } from "@/lib/contractExport";
import { Button } from "@/presentation/components/atoms/Button";
import { Input } from "@/presentation/components/atoms/Input";
import { Card, CardContent } from "@/presentation/components/molecules/Card";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { ContractPreview } from "@/presentation/components/organisms/ContractPreview";

export default function LegalPage() {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContractData | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const parsed = cedulaSchema.safeParse(cedula);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Cédula inválida");
      return;
    }
    setLoading(true);
    try {
      const data = await getContractByCedula(parsed.data);
      if (!data) setError("Trabajador no encontrado.");
      else setResult(data);
    } catch {
      setError("Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const getFilename = (ext: string) => {
    if (!result) return `contrato.${ext}`;
    const nombre = [
      result.empleado.primer_nombre,
      result.empleado.primer_apellido,
    ]
      .filter(Boolean)
      .join("_")
      .toUpperCase();
    return `contrato_${nombre}_${result.empleado.cedula}.${ext}`;
  };

  const handlePdf = async () => {
    if (!result) return;
    setExporting("pdf");
    try {
      await exportToPdf("printable-contract", getFilename("pdf"));
    } catch {
      alert("No se pudo generar el PDF. Intenta con Imprimir como PDF.");
    } finally {
      setExporting(null);
    }
  };

  const handleDocx = async () => {
    if (!result) return;
    setExporting("docx");
    try {
      await exportToDocx(result, getFilename("docx"));
    } catch {
      alert("No se pudo generar el documento Word.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Generador de Contratos"
          description="Busca un trabajador por cédula para generar su contrato."
        />

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
              <div className="flex-1">
                <label htmlFor="cedula" className="mb-1.5 block text-sm font-medium text-foreground">
                  Cédula del trabajador
                </label>
                <Input
                  id="cedula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="V-12345678"
                  invalid={Boolean(error)}
                  aria-describedby={error ? "cedula-error" : undefined}
                />
                {error && (
                  <p id="cedula-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" isLoading={loading} leftIcon={<Search className="h-4 w-4" aria-hidden />}>
                Buscar
              </Button>
              {result && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                    leftIcon={<Printer className="h-4 w-4" aria-hidden />}
                  >
                    Imprimir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePdf}
                    isLoading={exporting === "pdf"}
                    leftIcon={<Download className="h-4 w-4" aria-hidden />}
                  >
                    Descargar PDF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDocx}
                    isLoading={exporting === "docx"}
                    leftIcon={<FileText className="h-4 w-4" aria-hidden />}
                  >
                    Exportar a Google Docs
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {!result && !loading && !error && (
          <EmptyState
            icon={Search}
            title="Sin contrato generado"
            description="Ingresa la cédula de un trabajador registrado para generar su contrato."
          />
        )}
      </div>

      {result && <ContractPreview data={result} />}
    </div>
  );
}
