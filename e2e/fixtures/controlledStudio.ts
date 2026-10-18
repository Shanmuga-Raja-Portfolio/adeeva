import { expect, type Page } from "@playwright/test";

export async function controlledStudio(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
}
