import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.{test,spec}.{js,jsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    globals: true,
    setupFiles: "./tests/setup.js",
  },
});