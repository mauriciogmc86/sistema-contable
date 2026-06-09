import { create } from "zustand";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";

type ThemeState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  applyResolvedTheme: () => void;
};

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyClass(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

const initialTheme = getStoredTheme();

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolvedTheme: resolve(initialTheme),
  setTheme: (theme) => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, theme);
    const resolved = resolve(theme);
    applyClass(resolved);
    set({ theme, resolvedTheme: resolved });
  },
  toggleTheme: () => {
    const next: Theme = get().resolvedTheme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
  applyResolvedTheme: () => {
    const resolved = resolve(get().theme);
    applyClass(resolved);
    set({ resolvedTheme: resolved });
  },
}));
