import { expect, type Page } from "@playwright/test";
import { currentBeat, reduce, serialize, type GameState } from "../../src/games/adeeva/core";
import { openAdeeva } from "./adeevaPage";
import { finishStories } from "./story";

export function settleStories(state: GameState): GameState {
  let next = state;
  for (let guard = 0; guard < 20; guard += 1) {
    const beat = currentBeat(next);
    if (beat === null) return next;
    const choice = beat.choices[0];
    next =
      choice === undefined
        ? reduce(next, { type: "markBeatSeen", beatId: beat.id })
        : reduce(next, { type: "chooseStoryOption", beatId: beat.id, choiceId: choice.id });
  }
  return next;
}

export async function openPreparedGame(page: Page, state: GameState): Promise<void> {
  await openAdeeva(page);
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("adeeva.save.1", json);
    window.localStorage.setItem("adeeva.lastSlot", "1");
    window.localStorage.setItem(
      "adeeva.settings",
      JSON.stringify({ reducedMotion: true, assistCut: false, assistSew: false }),
    );
  }, serialize(state));
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishStories(page);
  await expect(page.getByTestId("studio-hub")).toBeVisible();
}

export async function savedState<T>(page: Page, pick: (state: GameState) => T): Promise<T> {
  const raw = await page.evaluate(() => window.localStorage.getItem("adeeva.save.1"));
  if (raw === null) throw new Error("Slot 1 is empty");
  return pick(JSON.parse(raw) as GameState);
}
