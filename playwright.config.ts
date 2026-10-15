import { defineConfig, devices } from "@playwright/test";

const makerPort = Number(process.env["MAKER_PORT"] ?? 5173);
const port = makerPort + 1000;
const host = "127.0.0.1";
const origin = `http://${host}:${port}`;
const outDir = `dist-e2e/${port}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  use: { baseURL: origin, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec vite build --outDir ${outDir} && pnpm exec vite preview --outDir ${outDir} --host ${host} --port ${port} --strictPort`,
    url: origin,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
