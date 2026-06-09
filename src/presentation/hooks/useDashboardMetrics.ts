"use client";

import { getDashboardMetrics } from "@/infrastructure/di";
import { useAsync } from "./useAsync";

export function useDashboardMetrics(companyId?: string) {
  return useAsync(() => getDashboardMetrics(companyId), [companyId]);
}
