"use client";

import { useEffect } from "react";
import { companyUseCases } from "@/infrastructure/di";
import { useCompanyStore } from "@/presentation/store/useCompanyStore";
import { useAsync } from "./useAsync";

/** Loads companies through the use-case layer and hydrates the company store. */
export function useCompanies() {
  const setCompanies = useCompanyStore((s) => s.setCompanies);
  const state = useAsync(() => companyUseCases.getAll(), []);

  useEffect(() => {
    if (state.data) {
      setCompanies(
        state.data.map((c) => ({ id: c.id, name: c.name, rif: c.taxIdentifier })),
      );
    }
  }, [state.data, setCompanies]);

  return state;
}
