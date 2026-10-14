import { expect, type Page } from "@playwright/test";
import type { DifficultyId } from "../../src/engine/difficulty";
import { serialize, type GameState } from "../../src/games/chef/core";
import { newTestGame, settleStories } from "../../src/games/chef/core/testPlaythrough";
import { CHEF_URL, finishChefStories } from "./chefKitchen";

export function readyHeadChef(difficulty: DifficultyId): GameState {
  const head = settleStories(
    newTestGame({ seed: 21, name: "Tomi", trait: "charmer", difficulty, start: "head" }),
  );
  return { ...head, reputation: 90, coins: 1500, passes: { ...head.passes, head: 12 } };
}

export function versionOneSave(state: GameState): string {
  const raw = JSON.parse(serialize(state)) as Record<string, unknown>;
  delete raw.path;
  delete raw.peeked;
  return JSON.stringify({ ...raw, schemaVersion: 1 });
}

export async function openChefSave(page: Page, json: string): Promise<void> {
  await page.goto("/");
  await page.evaluate((save) => {
    window.localStorage.clear();
    window.localStorage.setItem("chef.sound", "off");
    window.localStorage.setItem("chef.save.1", save);
    window.localStorage.setItem("chef.lastSlot", "1");
  }, json);
  await page.goto(CHEF_URL);
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
}

export async function chooseDoor(page: Page, door: "restaurant" | "truck" | "tv"): Promise<void> {
  await finishChefStories(page);
  await page.getByTestId("visit-crossroads").click();
  await expect(page.getByTestId("crossroads")).toBeVisible();
  await page.getByTestId(`choose-${door}`).click();
  if (door === "restaurant") await page.getByTestId("name-harbour-table").click();
  await page.getByTestId("confirm-path").click();
  await expect(page.locator(".ck-story")).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByTestId("path-hub")).toBeVisible();
}

export async function endDays(page: Page, count: number): Promise<void> {
  for (let day = 0; day < count; day += 1) {
    await page.getByTestId("end-day").click();
    await page.getByRole("button", { name: "Into the kitchen" }).click();
    await finishChefStories(page);
  }
}

export async function savedChef<T>(page: Page, pick: (state: GameState) => T): Promise<T> {
  const raw = await page.evaluate(() => window.localStorage.getItem("chef.save.1"));
  if (raw === null) throw new Error("Slot 1 is empty");
  return pick(JSON.parse(raw) as GameState);
}
