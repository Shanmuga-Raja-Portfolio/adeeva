import { expect, type Page } from "@playwright/test";
import { serialize, type GameState } from "../../src/games/workshop/core";
import type { RunStage } from "../../src/games/workshop/content/runStage";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playUntil,
  settleStories,
  withActiveGig,
  type PiecePlan,
} from "../../src/games/workshop/core/testPlaythrough";
import { finishWorkshopStories } from "./workshopPage";

export const BENCH_PLAN: PiecePlan = {
  ...BIRDHOUSE_PLAN,
  productId: "window-bench",
  options: { edge: "rounded-edge", legs: "splayed-legs" },
  woodId: "cedar",
};

export function commissionAt(clientId: string, plan: PiecePlan, stage: RunStage): GameState {
  const base = settleStories(newTestGame({ difficulty: "standard", trait: "charmer" }));
  const state = withActiveGig({ ...base, coins: 300, reputation: 9 }, clientId);
  return playUntil(state, lastGigId(state), plan, stage);
}

export async function openPreparedWorkshop(page: Page, state: GameState): Promise<void> {
  await page.goto("/#/workshop");
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("workshop.save.1", json);
    window.localStorage.setItem("workshop.lastSlot", "1");
  }, serialize(state));
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishWorkshopStories(page);
  await expect(page.getByTestId("workshop-hub")).toBeVisible();
}

export async function openPreparedBench(page: Page, state: GameState): Promise<void> {
  await openPreparedWorkshop(page, state);
  await page.getByRole("button", { name: "Back to the workbench" }).first().click();
  await expect(page.locator("main.ww-build")).toBeVisible();
}
