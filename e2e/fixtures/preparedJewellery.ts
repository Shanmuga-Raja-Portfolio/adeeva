import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";
import { serialize, type GameState } from "../../src/games/jewellery/core";
import type { NewGameSettings } from "../../src/games/jewellery/core/newGame";
import {
  buyLineGems,
  collectionTestGame,
  confirmBoard,
  endDayOnce,
  lanternNightLine,
  pickFirstTheme,
  playWholeLine,
  shootLookbook,
  stagedLaunch,
} from "../../src/games/jewellery/core/linePlaythrough";
import { JEWELLERY_URL, finishJewelleryStories } from "./jewelleryBench";

export function v1Save(name: string): string {
  return readFileSync(
    new URL(`../../src/games/jewellery/core/v1Saves/${name}.json`, import.meta.url),
    "utf8",
  );
}

export function themedLoft(settings: Partial<NewGameSettings> = {}): GameState {
  return pickFirstTheme(collectionTestGame({ seed: 41, ...settings }));
}

export function boardedLoft(settings: Partial<NewGameSettings> = {}): GameState {
  return confirmBoard(themedLoft(settings));
}

export function madeLine(settings: Partial<NewGameSettings> = {}): GameState {
  return playWholeLine(buyLineGems(boardedLoft(settings)));
}

export function shotLine(settings: Partial<NewGameSettings> = {}): GameState {
  return shootLookbook(madeLine(settings));
}

export function lanternNight(settings: Partial<NewGameSettings> = {}): GameState {
  return lanternNightLine({ seed: 41, ...settings });
}

export function popupDay(settings: Partial<NewGameSettings> = {}): GameState {
  return endDayOnce(stagedLaunch(lanternNight(settings)));
}

export async function openRawJewellery(page: Page, json: string): Promise<void> {
  await page.goto("/");
  await page.evaluate((save) => {
    window.localStorage.clear();
    window.localStorage.setItem("jewellery.save.1", save);
    window.localStorage.setItem("jewellery.lastSlot", "1");
  }, json);
  await page.goto(JEWELLERY_URL);
  await page.getByRole("button", { name: /^Continue/ }).click();
}

export async function openPreparedJewellery(page: Page, state: GameState): Promise<void> {
  await openRawJewellery(page, serialize(state));
  await finishJewelleryStories(page);
  await expect(page.getByTestId("bench-hub")).toBeVisible();
}
