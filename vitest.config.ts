import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist", "build"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/**/index.ts",
        "src/**/__tests__/**",
        "src/**/__mocks__/**",
        "src/**/types/**",
        "src/@core/types/*.ts",
        "src/@core/control-window/types.ts",
        "src/@core/bootstrap/initialize-ipc/**",
        "src/@core/control-window/create.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      all: true,
      clean: true,
    },
    setupFiles: ["./src/__tests__/setup.ts"],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
