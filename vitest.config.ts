import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.{test,spec}.[jt]s?(x)"],
    exclude: ["node_modules", ".next", "dist"],
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "."),
    },
  },
});
