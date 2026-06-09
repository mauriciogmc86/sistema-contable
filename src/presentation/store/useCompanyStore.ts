import { create } from "zustand";
import { listEmpresas } from "@/infrastructure/repositories/SupabaseEmpresaRepository";

/** Lightweight company view-model used across the shell (selector, headers). */
export interface CompanyOption {
  id: string;
  name: string;
  rif?: string | null;
}

interface CompanyStore {
  companies: CompanyOption[];
  activeCompanyId: string | null;
  loading: boolean;
  setCompanies: (companies: CompanyOption[]) => void;
  setActiveCompanyId: (id: string | null) => void;
  loadCompanies: () => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  companies: [],
  activeCompanyId: null,
  loading: false,
  setCompanies: (companies) =>
    set((state) => ({
      companies,
      activeCompanyId: state.activeCompanyId ?? companies[0]?.id ?? null,
    })),
  setActiveCompanyId: (id) => set({ activeCompanyId: id }),
  loadCompanies: async () => {
    set({ loading: true });
    try {
      const records = await listEmpresas();
      const companies: CompanyOption[] = records.map((e) => ({
        id: e.id,
        name: e.nombre,
        rif: e.rif,
      }));
      set((state) => ({
        companies,
        loading: false,
        activeCompanyId: state.activeCompanyId
          ? (companies.some((c) => c.id === state.activeCompanyId)
              ? state.activeCompanyId
              : (companies[0]?.id ?? null))
          : (companies[0]?.id ?? null),
      }));
    } catch {
      set({ loading: false });
    }
  },
}));
