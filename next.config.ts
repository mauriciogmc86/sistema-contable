import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Evita que Next.js use el lockfile del directorio padre como raíz del workspace.
  outputFileTracingRoot: appDir,
};

export default nextConfig;
