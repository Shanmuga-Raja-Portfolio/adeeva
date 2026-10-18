import { expect, test, type Page } from "@playwright/test";

interface ManifestIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
  readonly purpose: string;
}

interface Manifest {
  readonly name: string;
  readonly start_url: string;
  readonly scope: string;
  readonly display: string;
  readonly theme_color: string;
  readonly background_color: string;
  readonly icons: readonly ManifestIcon[];
}

function pngSize(bytes: Buffer): string {
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

async function workerSettled(page: Page): Promise<boolean> {
  return page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 30_000)),
    ]);
    return registration?.active !== null && registration?.active !== undefined;
  });
}

test("the manifest describes an installable app and every icon loads", async ({ page }) => {
  await page.goto("/");
  const href = await page.locator("link[rel='manifest']").getAttribute("href");
  expect(href).toBe("/manifest.webmanifest");
  const reply = await page.request.get(href ?? "");
  expect(reply.ok()).toBe(true);
  const manifest = (await reply.json()) as Manifest;
  expect(manifest).toMatchObject({ name: "Maker Studio", start_url: "/", scope: "/", display: "standalone" });
  expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/);
  expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/);
  expect(manifest.icons.map((icon) => icon.purpose)).toEqual(["any", "any", "maskable"]);

  const appleIcon = await page.locator("link[rel='apple-touch-icon']").getAttribute("href");
  const icons = [...manifest.icons, { src: appleIcon ?? "", sizes: "180x180", type: "image/png" }];
  for (const icon of icons) {
    const image = await page.request.get(icon.src);
    expect(image.ok(), icon.src).toBe(true);
    expect(image.headers()["content-type"]).toBe("image/png");
    expect(pngSize(await image.body())).toBe(icon.sizes);
  }
  await expect(page.locator("meta[name='theme-color']")).toHaveAttribute("content", manifest.theme_color);
});

test("each file gets the host's caching rule for its own path", async ({ page }) => {
  const entry = await page.goto("/");
  expect((await entry?.allHeaders())?.["cache-control"]).toBe("no-cache");
  const script = await page.locator("script[type='module']").getAttribute("src");
  expect(script).toMatch(/^\/assets\//);
  for (const [path, rule] of [
    ["/sw.js", "no-cache"],
    ["/manifest.webmanifest", "no-cache"],
    [script ?? "", "public, max-age=31536000, immutable"],
  ] as const) {
    const reply = await page.request.get(path);
    expect(reply.headers()["cache-control"], path).toBe(rule);
    expect(reply.headers()["content-security-policy"], path).toContain("default-src 'self'");
    expect(reply.headers()["cross-origin-resource-policy"], path).toBe("same-origin");
    expect(reply.headers()["cross-origin-embedder-policy"], path).toBeUndefined();
  }
});

test("the service worker takes over after a reload and the studio plays offline", async ({
  context,
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("studio-home")).toBeVisible();
  expect(await workerSettled(page)).toBe(true);
  await page.reload();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? "")).toMatch(/\/sw\.js$/);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await page.getByRole("link", { name: /Play Jewellery Bench/ }).click();
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await page.getByRole("link", { name: "About and privacy" }).click();
  await expect(page.getByTestId("about-page")).toBeVisible();
  await context.setOffline(false);
});
