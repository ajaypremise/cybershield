import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: { environment: "node", globals: true, coverage: { reporter: ["text"] } },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});

