import type { Config } from "tailwindcss";

/**
 * Tailwind v4 is configured CSS-first in `src/app/globals.css` via `@theme`.
 * This file only declares content sources and class-based dark mode for tooling.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
};

export default config;
