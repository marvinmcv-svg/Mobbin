import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: { include: ["tests/unit/screens.test.ts", "tests/unit/memory.test.ts"], fileParallelism: false, sequence: { concurrent: false } },
});
