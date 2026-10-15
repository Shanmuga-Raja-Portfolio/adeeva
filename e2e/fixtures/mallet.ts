import { expect, type Page } from "@playwright/test";

async function malletMark(page: Page): Promise<string> {
  const taps = await page.getByTestId("mallet").locator(".ww-mallet__count").allInnerTexts();
  const seated = await page.locator(".ww-join__chip--done").count();
  return `${taps.join(",")}|${seated}`;
}

export async function tapMalletOnce(page: Page, tap: () => Promise<void>): Promise<void> {
  const before = await malletMark(page);
  await tap();
  await expect.poll(() => malletMark(page)).not.toBe(before);
}
