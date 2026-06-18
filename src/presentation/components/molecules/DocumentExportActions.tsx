"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/presentation/components/atoms/Button";

interface DocumentExportActionsProps {
  elementId: string;
  filename: string;
  exporting: boolean;
  onExport: (elementId: string, filename: string) => void;
}

export function DocumentExportActions({
  elementId,
  filename,
  exporting,
  onExport,
}: DocumentExportActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="outline"
        leftIcon={<Printer className="h-4 w-4" aria-hidden />}
        onClick={() => window.print()}
      >
        Imprimir
      </Button>
      <Button
        leftIcon={<Download className="h-4 w-4" aria-hidden />}
        isLoading={exporting}
        onClick={() => onExport(elementId, filename)}
      >
        Descargar PDF
      </Button>
    </div>
  );
}
