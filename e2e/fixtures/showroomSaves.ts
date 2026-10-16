import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";
import type { RunStage } from "../../src/games/workshop/content/runStage";
import { serialize, type GameState } from "../../src/games/workshop/core";
import { reduce } from "../../src/games/workshop/core/reduce";
import {
  NOOK_PLAN,
  playSetToFloor,
  playSetUntil,
  READING_PLAN,
  showroomTestGame,
  type SetPlan,
} from "../../src/games/workshop/core/setPlaythrough";
import { settleStories } from "../../src/games/workshop/core/testPlaythrough";
import { finishWorkshopStories } from "./workshopPage";

export function thresholdV1(): string {
  return readFileSync(
    new URL("../../src/games/workshop/core/v1Saves/threshold.json", import.meta.url),
    "utf8",
  );
}

export function themedShowroom(): GameState {
  return reduce(
    reduce(showroomTestGame({ name: "Juno", trait: "charmer" }), {
      type: "chooseFairTheme",
      themeId: "orchard-picnic",
    }),
    {
      type: "takeRenOn",
    },
  );
}

export function setAt(stage: RunStage, plan: SetPlan = NOOK_PLAN): GameState {
  return playSetUntil(themedShowroom(), plan, stage);
}

export function twoSetsOnFloor(): GameState {
  const first = reduce(playSetToFloor(themedShowroom(), { ...READING_PLAN, cushion: "mustard-dot" }), {
    type: "markFloorSet",
    setId: "set-1",
    mode: "show",
  });
  return playSetToFloor(first, NOOK_PLAN);
}

export function fairDayShowroom(): GameState {
  let state = twoSetsOnFloor();
  while (state.calendar.day < 13) state = settleStories(reduce(state, { type: "endDay" }));
  return state;
}

export async function openRawSave(page: Page, json: string): Promise<void> {
  await page.goto("about:blank");
  await page.goto("/#/workshop");
  await page.evaluate((save) => {
    window.localStorage.clear();
    window.localStorage.setItem("workshop.save.1", save);
    window.localStorage.setItem("workshop.lastSlot", "1");
  }, json);
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
}

export async function openShowroomSave(page: Page, state: GameState): Promise<void> {
  await openRawSave(page, serialize(state));
  await finishWorkshopStories(page);
  await expect(page.getByTestId("workshop-hub")).toBeVisible();
}

export async function endShopDay(page: Page): Promise<void> {
  await page.getByTestId("end-day").click();
  await page.getByRole("button", { name: /^Open the (shop|garage)$/ }).click();
  await finishWorkshopStories(page);
}
