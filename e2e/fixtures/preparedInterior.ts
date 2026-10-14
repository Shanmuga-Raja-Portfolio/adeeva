import { expect, type Page } from "@playwright/test";
import { reduce, serialize, type GameState, type RunStage } from "../../src/games/interior/core";
import {
  lastGigId,
  newTestGame,
  playRunTo,
  recipeFor,
  settleStories,
  withOrder,
} from "../../src/games/interior/core/testPlaythrough";
import { finishInteriorStories, INTERIOR_URL } from "./interiorStudio";

export function showHomeAt(stage: RunStage): GameState {
  const base = settleStories(newTestGame({ trait: "charmer" }));
  const ordered = withOrder(
    { ...base, reputation: 24, coins: 400, trends: { ...base.trends, current: ["classic", "cosy"] } },
    "bellwind",
  );
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, recipeFor("bellwind"), stage);
}

export function nookAt(stage: RunStage): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "nana-pearl");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, recipeFor("nana-pearl"), stage);
}

export async function openPreparedRoom(page: Page, state: GameState): Promise<void> {
  await page.goto(INTERIOR_URL);
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("interior.save.1", json);
    window.localStorage.setItem("interior.lastSlot", "1");
  }, serialize(state));
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishInteriorStories(page);
  await expect(page.getByTestId("loft-hub")).toBeVisible();
  await page.getByRole("button", { name: "Back to the room" }).first().click();
  await expect(page.locator("main.is-makeover")).toBeVisible();
}
