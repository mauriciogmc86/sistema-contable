"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { CompraInput } from "@/application/validation";
import { purchaseBookUseCases } from "@/infrastructure/di";
import { ACCOUNTING_COMPANY_ID } from "@/presentation/config/accounting";
import { CompraForm } from "@/presentation/components/organisms/CompraForm";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { Button } from "@/presentation/components/atoms/Button";
import { Card, CardContent } from "@/presentation/components/molecules/Card";

export default function NuevaCompraPage() {
  const router = useRouter();
  const [createdNumber, setCreatedNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: CompraInput) => {
    setSubmitError(null);
    try {
      await purchaseBookUseCases.create({
        companyId: ACCOUNTING_COMPANY_ID,
        ...values,
      });
      setCreatedNumber(values.documentNumber);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo guardar la factura");
    }
  };

  if (createdNumber) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle text-success">
              <CheckCircle2 className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Factura registrada</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Se registró la factura{" "}
                <span className="font-medium text-foreground">{createdNumber}</span> en el libro de compras.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCreatedNumber(null)}>
                Registrar otra
              </Button>
              <Button onClick={() => router.push("/dashboard/libros-fiscales")}>Ver libro de compras</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incluir factura de compra"
        description="Registra una factura en el libro de compras con cálculo automático de IVA al 16%."
      />
      <Card>
        <CardContent className="pt-6">
          <CompraForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/libros-fiscales")}
            submitError={submitError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
