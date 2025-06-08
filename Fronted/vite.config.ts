// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./jest.setup.ts",
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: [...configDefaults.exclude, "node_modules"],
    coverage: {
      provider: 'v8', // usa 'v8' porque instalaste @vitest/coverage-v8
      reporter: ['text', 'html'], // genera reporte en consola y también una carpeta HTML
    },
  },
});