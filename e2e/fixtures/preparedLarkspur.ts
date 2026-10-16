import { readFileSync } from "node:fs";
import { expect, type Page } from "@playwright/test";
import { FLOORS } from "../../src/games/interior/content/floor";
import { reduce, serialize, type GameState } from "../../src/games/interior/core";
import {
  homeRecipe,
  newShowHomeGame,
  openRoom,
  planHome,
  project,
  readyHome,
  startHome,
  toStagingDay,
} from "../../src/games/interior/core/larkspurPlaythrough";
import { playRunTo } from "../../src/games/interior/core/testPlaythrough";
import { finishInteriorStories, INTERIOR_URL } from "./interiorStudio";

export function v1ThresholdSave(): string {
  return readFileSync(
    new URL("../../src/games/interior/core/v1Saves/threshold.json", import.meta.url),
    "utf8",
  );
}

export function showHomeStart(): GameState {
  return newShowHomeGame({ seed: 41 });
}

export function plannedHome(): GameState {
  return planHome(startHome(showHomeStart()));
}

export function openHouseReady(): GameState {
  return toStagingDay(readyHome(plannedHome()));
}

export function thresholdRoomAtFloor(): GameState {
  const base = showHomeStart();
  const larkspur = base.larkspur;
  if (larkspur === null) throw new Error("No Larkspur");
  const planned = planHome(startHome({ ...base, larkspur: { ...larkspur, plot: 2 } }));
  const hall = project(planned).palette.hallFloor;
  const opened = openRoom(planned, 1);
  const run = opened.activeRun;
  if (run === null) throw new Error("No room");
  const pattern = FLOORS.find((entry) => entry.id === hall)?.pattern;
  const floor = FLOORS.find((entry) => entry.pattern === pattern && entry.id !== hall)?.id ?? "oak-boards";
  const atFloor = playRunTo(opened, homeRecipe(opened, run, { floor }), "floor");
  return reduce(atFloor, { type: "closeHomeRoom" });
}

export async function loadSave(page: Page, json: string): Promise<void> {
  await page.goto("/");
  await page.evaluate((save) => {
    window.localStorage.clear();
    window.localStorage.setItem("interior.save.1", save);
    window.localStorage.setItem("interior.lastSlot", "1");
  }, json);
  await page.goto(INTERIOR_URL);
  await page.getByRole("button", { name: /^Continue/ }).click();
}

export async function openPreparedHome(page: Page, state: GameState): Promise<void> {
  await loadSave(page, serialize(state));
  await finishInteriorStories(page);
  await expect(page.getByTestId("loft-hub")).toBeVisible();
  await page.getByTestId("open-project").click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
}
