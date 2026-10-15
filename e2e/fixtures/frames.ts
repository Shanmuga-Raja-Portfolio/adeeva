import type { Page } from "@playwright/test";

export async function afterNextFrame(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise((frame) => requestAnimationFrame(() => requestAnimationFrame(frame))),
  );
}
