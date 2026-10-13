import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env["MAKER_PORT"] ?? 5173);
const origin = `http://localhost:${port}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  use: { baseURL: origin, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "pnpm dev", url: origin, reuseExistingServer: true },
});
