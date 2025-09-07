import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.{test,spec}.[jt]s?(x)"],
    exclude: ["node_modules", ".next", "dist"],
    css: true,
    alias: {
      "@": "./",
    },
  },
});
