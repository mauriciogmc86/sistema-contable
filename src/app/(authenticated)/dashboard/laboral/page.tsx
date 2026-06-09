"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Calculator } from "lucide-react";
import { Input } from "@/presentation/components/atoms/Input";
import { Label } from "@/presentation/components/atoms/Label";
import { Badge } from "@/presentation/components/atoms/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/molecules/Card";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { formatCurrency } from "@/presentation/utils/format";

export default function LaboralPage() {
  const [sueldo, setSueldo] = useState("");
  const [dias, setDias] = useState("30");

  const liquidacion = useMemo(() => {
    const s = Number(sueldo) || 0;
    const d = Number(dias) || 0;
    return (s / 30) * d;
  }, [sueldo, dias]);

  return (
    <div className="space-y-6">
      <PageHeader title="Área Laboral" description="Gestión de nómina: liquidaciones y vacaciones." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle>Cálculo de liquidación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sueldo">Sueldo base mensual (Bs.)</Label>
              <Input
                id="sueldo"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={sueldo}
                onChange={(e) => setSueldo(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dias">Días trabajados</Label>
              <Input
                id="dias"
                type="number"
                min="0"
                max="365"
                value={dias}
                onChange={(e) => setDias(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">Liquidación estimada</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {formatCurrency(liquidacion)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" aria-hidden />
            <CardTitle>Control de vacaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Días acumulados promedio</span>
              <Badge tone="info">15 días</Badge>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Alertas (15 días de anticipación)</p>
              <EmptyState
                icon={CalendarClock}
                title="Sin alertas"
                description="No hay vacaciones próximas a vencer."
                className="py-8"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
