import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { parseHeadersFile } from "./tooling/headersFile.ts";
import { hostHeaders } from "./tooling/hostHeaders.ts";
import { offlineBuild } from "./tooling/offlineBuild.ts";

const port = Number(process.env["MAKER_PORT"] ?? 5173);
const hostRules = parseHeadersFile(
  readFileSync(fileURLToPath(new URL("./public/_headers", import.meta.url)), "utf8"),
);
const workerTemplate = fileURLToPath(new URL("./src/offline/serviceWorker.js", import.meta.url));

export default defineConfig({
  plugins: [react(), offlineBuild(workerTemplate), hostHeaders(hostRules)],
  server: {
    port,
    strictPort: true,
    watch: { ignored: ["**/test-results*/**", "**/playwright-report/**", "**/dist-e2e/**"] },
    warmup: { clientFiles: ["./src/main.tsx", "./src/games/*/ui/**/*.tsx", "./src/studio/*.tsx"] },
  },
  preview: { cors: false },
  test: {
    include: ["src/**/*.test.ts", "tooling/**/*.test.ts"],
    environment: "node",
  },
});
