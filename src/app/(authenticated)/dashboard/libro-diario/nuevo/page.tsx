"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { AsientoInput } from "@/application/validation";
import { journalEntryUseCases } from "@/infrastructure/di";
import { ACCOUNTING_COMPANY_ID } from "@/presentation/config/accounting";
import { AsientoForm } from "@/presentation/components/organisms/AsientoForm";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { Button } from "@/presentation/components/atoms/Button";
import { Card, CardContent } from "@/presentation/components/molecules/Card";
import { ErrorState } from "@/presentation/components/molecules/ErrorState";
import { TableSkeleton } from "@/presentation/components/molecules/Skeleton";
import { useAccounts } from "@/presentation/hooks";

export default function NuevoAsientoPage() {
  const router = useRouter();
  const { data: accounts, loading, error, reload } = useAccounts(ACCOUNTING_COMPANY_ID);
  const [createdNumber, setCreatedNumber] = useState<string | null>(null);

  const handleSubmit = async (values: AsientoInput) => {
    const accountMap = new Map((accounts ?? []).map((a) => [a.id, a]));
    await journalEntryUseCases.create({
      companyId: ACCOUNTING_COMPANY_ID,
      date: values.date,
      description: values.description,
      lines: values.lines.map((l, i) => {
        const acc = accountMap.get(l.accountId);
        return {
          id: `line-${Date.now()}-${i}`,
          accountId: l.accountId,
          accountCode: acc?.code ?? "",
          accountName: acc?.name ?? "",
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description ?? "",
        };
      }),
    });
    setCreatedNumber(values.number);
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
              <h2 className="text-xl font-semibold text-foreground">Asiento guardado</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Se registró el asiento <span className="font-medium text-foreground">{createdNumber}</span> en el libro diario.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCreatedNumber(null)}>
                Crear otro
              </Button>
              <Button onClick={() => router.push("/dashboard/libro-diario")}>Ver libro diario</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo asiento contable"
        description="Registra un asiento de partida doble en el libro diario."
      />
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : error ? (
            <ErrorState description={error} onRetry={reload} />
          ) : (
            <AsientoForm
              accounts={(accounts ?? []).map((a) => ({ id: a.id, code: a.code, name: a.name }))}
              onSubmit={handleSubmit}
              onCancel={() => router.push("/dashboard/libro-diario")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
