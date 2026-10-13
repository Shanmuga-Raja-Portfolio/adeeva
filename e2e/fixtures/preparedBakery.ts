import { expect, type Page } from "@playwright/test";
import { serialize, type GameState } from "../../src/games/patisserie/core";
import { finishBakeryStories, PATISSERIE_URL } from "./patisseriePage";

export async function openPreparedBakery(page: Page, state: GameState): Promise<void> {
  await page.goto(PATISSERIE_URL);
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("patisserie.save.1", json);
    window.localStorage.setItem("patisserie.lastSlot", "1");
  }, serialize(state));
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
}

export async function openPreparedBench(page: Page, state: GameState): Promise<void> {
  await openPreparedBakery(page, state);
  await page.getByRole("button", { name: "Back to the bench" }).first().click();
  await expect(page.locator("main.pa-bake")).toBeVisible();
}

export async function savedBakery<T>(page: Page, pick: (state: GameState) => T): Promise<T> {
  const raw = await page.evaluate(() => window.localStorage.getItem("patisserie.save.1"));
  if (raw === null) throw new Error("Slot 1 is empty");
  return pick(JSON.parse(raw) as GameState);
}
