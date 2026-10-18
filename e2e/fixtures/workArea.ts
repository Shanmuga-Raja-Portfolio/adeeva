import { expect, type Locator, type Page, type ViewportSize } from "@playwright/test";
import { settle, stillBox } from "./settle";
import { widestSidewaysScroll } from "./sidewaysScroll";

export function isCompactScreen(viewport: ViewportSize | null): boolean {
  return viewport !== null && (viewport.width <= 480 || viewport.height <= 480);
}

async function scrollToWork(page: Page, parts: readonly Locator[]): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  const boxes = await Promise.all(parts.map((part) => stillBox(part)));
  const top = Math.min(...boxes.map((box) => box.y));
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 4)), top);
  await settle(page);
}

export async function expectWorkTogether(page: Page, parts: readonly Locator[]): Promise<void> {
  const view = page.viewportSize();
  if (view === null) throw new Error("No viewport");
  await scrollToWork(page, parts);
  for (const part of parts) {
    const box = await stillBox(part);
    expect(box.y, `top on screen: ${part.toString()}`).toBeGreaterThanOrEqual(-1);
    expect(box.y + box.height, `bottom on screen: ${part.toString()}`).toBeLessThanOrEqual(view.height + 1);
    expect(box.x, `left on screen: ${part.toString()}`).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, `right on screen: ${part.toString()}`).toBeLessThanOrEqual(view.width + 1);
  }
  expect(await widestSidewaysScroll(page)).toBe(0);
}

export async function expectHubActionsAtTop(page: Page): Promise<void> {
  const view = page.viewportSize();
  if (view === null) throw new Error("No viewport");
  await page.evaluate(() => window.scrollTo(0, 0));
  const exit = await stillBox(page.getByRole("button", { name: /Save & exit/ }).first());
  expect(exit.y + exit.height).toBeLessThanOrEqual(view.height);
  expect(exit.x + exit.width).toBeLessThanOrEqual(view.width + 1);
  expect(await widestSidewaysScroll(page)).toBe(0);
}
