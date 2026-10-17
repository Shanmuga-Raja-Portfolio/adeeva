import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { openAdeeva } from "../fixtures/adeevaPage";
import { serialize } from "../../src/games/adeeva/core";
import { seasonReadyForRunway } from "../fixtures/runwaySeason";
import { holdShowTime, playToScene, releaseShowTime } from "../fixtures/showTime";
import { finishStories } from "../fixtures/story";

async function shot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), animations: "disabled" });
}

interface SavedGame {
  readonly coins: number;
  readonly day: number;
  readonly deadlineDay: number;
  readonly seasonNumber: number;
  readonly resultCoins: number | null;
}

async function savedGame(page: Page): Promise<SavedGame> {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem("adeeva.save.1");
    const parsed = JSON.parse(raw ?? "{}") as {
      coins?: number;
      calendar?: { day?: number };
      season?: { number?: number; deadlineDay?: number; result?: { coins?: number } | null };
    };
    return {
      coins: parsed.coins ?? -1,
      day: parsed.calendar?.day ?? -1,
      deadlineDay: parsed.season?.deadlineDay ?? -1,
      seasonNumber: parsed.season?.number ?? -1,
      resultCoins: parsed.season?.result?.coins ?? null,
    };
  });
}

async function loadPreparedSave(page: Page, save: string) {
  await openAdeeva(page);
  await page.evaluate((raw) => {
    window.localStorage.clear();
    window.localStorage.setItem("adeeva.save.1", raw);
    window.localStorage.setItem("adeeva.lastSlot", "1");
  }, save);
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishStories(page);
  await expect(page.getByTestId("studio-hub")).toBeVisible();
  await page.getByRole("button", { name: "Open collection board" }).click();
  await expect(page.getByTestId("collection-board")).toBeVisible();
}

async function restUntilAfterShow(page: Page) {
  for (let guard = 0; guard < 30; guard += 1) {
    const saved = await savedGame(page);
    if (saved.day > saved.deadlineDay) return;
    await page.getByRole("button", { name: "End day" }).click();
    await page.getByRole("button", { name: "Start the day" }).click();
    await finishStories(page);
    await expect.poll(async () => (await savedGame(page)).day).toBe(saved.day + 1);
  }
  throw new Error("The calendar never moved past the show");
}

const prepared = serialize(seasonReadyForRunway());

test("a finished collection walks the runway, earns its reviews and opens the next season", async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadPreparedSave(page, prepared);
  const board = page.getByTestId("collection-board");
  await expect(board.getByTestId("season-header")).toContainText("Season 1");
  for (const slot of [1, 2, 3]) {
    await expect(page.getByTestId(`look-slot-${slot}`)).toContainText("Quality");
  }
  await expect(page.getByTestId("cohesion")).toContainText("Shared palette");
  await shot(page, testInfo, "desk-01-board");

  const before = await savedGame(page);
  await page.getByRole("button", { name: "Plan the runway" }).click();
  const planner = page.getByTestId("runway-planner");
  await expect(planner).toBeVisible();
  const curtain = page.getByRole("button", { name: "Raise the curtain" });
  await expect(curtain).toBeDisabled();
  await expect(planner).toContainText("Pick the music and the lights first.");
  await shot(page, testInfo, "desk-02-planner-empty");

  const firstCard = page.getByTestId("walk-slot-1").locator(".ad-walk-card");
  const lastSlot = page.getByTestId("walk-slot-3").locator(".ad-walk-card");
  const from = await firstCard.boundingBox();
  const to = await lastSlot.boundingBox();
  if (from === null || to === null) throw new Error("walk cards are not on screen");
  await page.mouse.move(from.x + from.width / 2, from.y + 60);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 60, from.y + 70, { steps: 4 });
  await page.mouse.move(to.x + to.width / 2, to.y + 70, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByTestId("walk-slot-3")).toContainText("Look 1");
  await page.getByRole("button", { name: "Move look 1 earlier" }).click();
  await expect(page.getByTestId("walk-slot-2")).toContainText("Look 1");
  await page
    .getByTestId("walk-slot-1")
    .locator(".ad-walk-card")
    .click({ position: { x: 40, y: 60 } });
  await page
    .getByTestId("walk-slot-3")
    .locator(".ad-walk-card")
    .click({ position: { x: 40, y: 60 } });
  await expect(page.getByTestId("walk-slot-1")).toContainText("Look 3");

  await page.getByRole("radio", { name: /Dreamy Strings/ }).click();
  await expect(curtain).toBeDisabled();
  const lightCard = page.getByRole("radio", { name: /Cool Wash/ });
  await lightCard.click();
  await expect(curtain).toBeEnabled();
  const lightBox = await lightCard.boundingBox();
  const goBox = await page.locator(".ad-planner__go").boundingBox();
  if (lightBox === null || goBox === null) throw new Error("planner controls are not on screen");
  expect(lightBox.y + lightBox.height).toBeLessThanOrEqual(goBox.y + 1);
  await shot(page, testInfo, "desk-03-planner-ready");

  await page.clock.install();
  await holdShowTime(page);
  await curtain.click();
  await expect(page.getByTestId("runway-show")).toBeVisible();
  for (const scene of ["lights", "walk-1", "walk-2", "walk-3", "finale", "bow"]) {
    await playToScene(page, "runway-show", scene);
    await shot(page, testInfo, `desk-04-show-${scene}`);
  }
  await releaseShowTime(page);

  const results = page.getByTestId("show-results");
  await expect(results).toBeVisible({ timeout: 15_000 });
  for (const panel of ["critics", "buyers", "audience"]) {
    await expect(page.getByTestId(`panel-${panel}`)).toBeVisible();
  }
  await expect(page.getByTestId("press-quote")).toBeVisible();
  await expect.poll(async () => (await savedGame(page)).resultCoins).not.toBeNull();
  const after = await savedGame(page);
  expect(after.resultCoins ?? 0).toBeGreaterThan(0);
  expect(after.coins).toBe(before.coins + (after.resultCoins ?? 0));
  await expect(page.getByTestId("purse-coins")).toHaveText(String(after.coins));
  await expect(page.getByTestId("reward-coins")).toHaveText(`+${after.resultCoins ?? 0}`, {
    timeout: 10_000,
  });
  await shot(page, testInfo, "desk-05-results");

  await page.getByRole("button", { name: "Back to studio" }).last().click();
  await finishStories(page);
  await restUntilAfterShow(page);
  await page.getByRole("button", { name: "Open collection board" }).click();
  await expect(page.getByTestId("show-results")).toBeVisible();
  const themes = page.getByRole("radiogroup", { name: "Next season theme" }).getByRole("radio");
  await expect(themes).toHaveCount(2);
  await themes.last().click();
  await page.getByRole("button", { name: "Next season", exact: true }).click();
  await expect(page.getByTestId("collection-board")).toBeVisible();
  await expect(page.getByTestId("season-header")).toContainText("Season 2");
  await expect(page.getByRole("button", { name: "Design look 1" })).toBeEnabled();
  await expect.poll(async () => (await savedGame(page)).seasonNumber).toBe(2);
  await shot(page, testInfo, "desk-06-next-season-board");
});

test("the show plays on a tall tablet, skips to the reviews and crossfades for reduced motion", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await loadPreparedSave(page, prepared);
  await shot(page, testInfo, "tab-01-board");
  await page.getByRole("button", { name: "Plan the runway" }).click();
  await page.getByRole("radio", { name: /Synth Pulse/ }).click();
  await page.getByRole("radio", { name: /Spotlight/ }).click();
  await page.getByTestId("stage-preview").scrollIntoViewIfNeeded();
  await shot(page, testInfo, "tab-02-planner");
  await page.clock.install();
  await holdShowTime(page);
  await page.getByRole("button", { name: "Raise the curtain" }).click();
  await playToScene(page, "runway-show", "walk-1");
  await shot(page, testInfo, "tab-03-show-walk1");
  await playToScene(page, "runway-show", "walk-2");
  await releaseShowTime(page);
  await page.getByRole("button", { name: /Skip to the reviews/ }).click();
  await expect(page.getByTestId("show-results")).toBeVisible();
  await expect.poll(async () => (await savedGame(page)).resultCoins).not.toBeNull();
  const result = await savedGame(page);
  await expect(page.getByTestId("reward-coins")).toHaveText(`+${result.resultCoins ?? 0}`, {
    timeout: 10_000,
  });
  await shot(page, testInfo, "tab-04-results");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await holdShowTime(page);
  await page.getByRole("button", { name: /Watch the show again/ }).click();
  await playToScene(page, "runway-show", "walk-1");
  await shot(page, testInfo, "tab-05-reduced-walk1");
  await playToScene(page, "runway-show", "finale");
  await shot(page, testInfo, "tab-06-reduced-finale");
  await releaseShowTime(page);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("show-results")).toBeVisible();
  await page.getByRole("button", { name: "Back to studio" }).last().click();
  await expect(page.getByTestId("studio-hub")).toBeVisible();
});
