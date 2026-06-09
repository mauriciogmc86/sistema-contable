"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/presentation/store/useThemeStore";

/**
 * Single source of truth for theming. Keeps the <html> `dark` class in sync
 * with the persisted theme and reacts to OS changes when theme === "system".
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const applyResolvedTheme = useThemeStore((s) => s.applyResolvedTheme);

  useEffect(() => {
    applyResolvedTheme();
  }, [theme, applyResolvedTheme]);

  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyResolvedTheme();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, applyResolvedTheme]);

  return <>{children}</>;
}
