import { defineConfig, devices } from "@playwright/test";

const makerPort = Number(process.env["MAKER_PORT"] ?? 5173);
const port = makerPort + 1000;
const host = "127.0.0.1";
const origin = `http://${host}:${port}`;
const outDir = `dist-e2e/${port}`;
const deviceSpecs = /release[\\/](smoke|install)\.spec\.ts$/;
const safariSpecs = /release[\\/](smoke|noNetwork|install|update|about)\.spec\.ts$/;

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  use: { baseURL: origin, trace: { mode: "retain-on-failure", screenshots: false } },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "android-handheld", testMatch: deviceSpecs, use: { ...devices["Pixel 7 landscape"] } },
    {
      name: "chromebook",
      testMatch: deviceSpecs,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } },
    },
    { name: "webkit-iphone", testMatch: safariSpecs, use: { ...devices["iPhone 15"] } },
    { name: "webkit-ipad", testMatch: safariSpecs, use: { ...devices["iPad (gen 11)"] } },
  ],
  webServer: {
    command: `pnpm exec vite build --outDir ${outDir} && pnpm exec vite preview --outDir ${outDir} --host ${host} --port ${port} --strictPort`,
    url: origin,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
