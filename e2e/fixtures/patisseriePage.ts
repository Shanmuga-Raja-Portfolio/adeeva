import { expect, type Locator, type Page } from "@playwright/test";
import { stillBox } from "./settle";

export const PATISSERIE_URL = "/#/patisserie";

export async function freshPatisserie(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(PATISSERIE_URL);
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
}

export async function finishBakeryStories(page: Page): Promise<void> {
  const story = page.locator(".pa-story");
  for (let step = 0; step < 40; step += 1) {
    if ((await story.count()) === 0) return;
    await story.locator(".pa-story__footer button").first().click();
  }
  await expect(story).toHaveCount(0);
}

export async function coins(page: Page): Promise<number> {
  const text = await page.getByTestId("stat-coins").innerText();
  return Number(text.replace(/[^0-9-]/g, ""));
}

export async function centreOf(locator: Locator): Promise<{ readonly x: number; readonly y: number }> {
  const box = await stillBox(locator);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export async function dragBetween(page: Page, from: Locator, to: Locator): Promise<void> {
  const start = await centreOf(from);
  const end = await centreOf(to);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (let step = 1; step <= 12; step += 1)
    await page.mouse.move(
      start.x + ((end.x - start.x) * step) / 12,
      start.y + ((end.y - start.y) * step) / 12,
    );
  await page.mouse.up();
}
