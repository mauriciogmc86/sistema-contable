import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActiveCurrency = "VES" | "USD";

interface CurrencyStore {
  currency: ActiveCurrency;
  toggleCurrency: () => void;
  setCurrency: (c: ActiveCurrency) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "VES",
      toggleCurrency: () => set({ currency: get().currency === "VES" ? "USD" : "VES" }),
      setCurrency: (c) => set({ currency: c }),
    }),
    { name: "currency-pref" },
  ),
);
