import type { Page } from "@playwright/test";

export const ADEEVA_URL = "/#/adeeva";

export async function openAdeeva(page: Page): Promise<void> {
  if (page.url() !== "about:blank") await page.goto("about:blank");
  await page.goto(ADEEVA_URL);
}
