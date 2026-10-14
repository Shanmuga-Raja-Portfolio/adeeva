import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const port = Number(process.env["MAKER_PORT"] ?? 5173);

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    strictPort: true,
    watch: { ignored: ["**/test-results*/**", "**/playwright-report/**"] },
    warmup: { clientFiles: ["./src/main.tsx", "./src/games/*/ui/**/*.tsx", "./src/studio/*.tsx"] },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
