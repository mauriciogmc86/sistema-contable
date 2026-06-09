"use client";

import { useMemo, useState } from "react";
import { ACCOUNT_TYPE_LABELS, AccountType, type Account } from "@/domain/entities";
import { ACCOUNTING_COMPANY_ID } from "@/presentation/config/accounting";
import { Badge } from "@/presentation/components/atoms/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/molecules/Card";
import { SearchInput } from "@/presentation/components/molecules/SearchInput";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { ErrorState } from "@/presentation/components/molecules/ErrorState";
import { TableSkeleton } from "@/presentation/components/molecules/Skeleton";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { useAccounts } from "@/presentation/hooks";

const TYPE_ORDER: AccountType[] = [
  AccountType.ASSET,
  AccountType.LIABILITY,
  AccountType.EQUITY,
  AccountType.INCOME,
  AccountType.EXPENSE,
];

const TYPE_TONE: Record<AccountType, "success" | "danger" | "warning" | "info" | "primary"> = {
  [AccountType.ASSET]: "success",
  [AccountType.LIABILITY]: "danger",
  [AccountType.EQUITY]: "warning",
  [AccountType.INCOME]: "info",
  [AccountType.EXPENSE]: "primary",
};

export default function PlanCuentasPage() {
  const { data, loading, error, reload } = useAccounts(ACCOUNTING_COMPANY_ID);
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = (data ?? []).filter(
      (a) => !q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
    );
    const map = new Map<AccountType, Account[]>();
    for (const a of filtered) {
      const list = map.get(a.type) ?? [];
      list.push(a);
      map.set(a.type, list);
    }
    return map;
  }, [data, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Plan de Cuentas" description="Catálogo contable agrupado por tipo de cuenta." />

      <div className="max-w-sm">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código o nombre..."
          aria-label="Buscar cuentas"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <TableSkeleton rows={6} cols={2} />
          </CardContent>
        </Card>
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="Sin cuentas" description="Esta empresa aún no tiene un plan de cuentas." />
      ) : grouped.size === 0 ? (
        <EmptyState title="Sin coincidencias" description="Ninguna cuenta coincide con tu búsqueda." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {TYPE_ORDER.filter((t) => grouped.has(t)).map((type) => (
            <Card key={type}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{ACCOUNT_TYPE_LABELS[type]}</CardTitle>
                <Badge tone={TYPE_TONE[type]}>{grouped.get(type)!.length} cuentas</Badge>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {grouped
                    .get(type)!
                    .sort((a, b) => a.code.localeCompare(b.code))
                    .map((a) => (
                      <li key={a.id} className="flex items-center gap-3 py-2.5">
                        <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{a.code}</span>
                        <span className="text-sm text-foreground">{a.name}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
