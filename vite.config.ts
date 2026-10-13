import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const port = Number(process.env["MAKER_PORT"] ?? 5173);

export default defineConfig({
  plugins: [react()],
  server: { port, strictPort: true },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
