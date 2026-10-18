import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { reduce, serialize, type Action, type GameState } from "../../src/games/thrift-flip/core";
import { endDays, rackPieceFixture, withRack } from "../../src/games/thrift-flip/core/boutiquePlaythrough";
import {
  cutActions,
  dispatchAll,
  flipAtUnpick,
  layoutActions,
  newTestGame,
  playFlipToReview,
  scrubAll,
  seamActions,
  settleStories,
  unpickAll,
  withActiveGig,
  type FlipPlan,
} from "../../src/games/thrift-flip/core/testPlaythrough";
import { openThriftSave, showcaseSave, tillDaySave } from "../fixtures/boutiqueSaves";
import { afterNextFrame } from "../fixtures/frames";
import { settledForShot } from "../fixtures/settle";
import { holdShowTime, playToScene, playWithinScene, releaseShowTime } from "../fixtures/showTime";
import { finishStories } from "../fixtures/story";
import { scrollIntoView } from "../fixtures/thriftBench";
import { centreOf, svgToScreen, THRIFT_URL } from "../fixtures/thriftPage";

const folder = process.env["QUALITY_SHOTS_DIR"];

const PLAYER = { seed: 11, name: "Rosa", trait: "charmer" } as const;

const CUSHION: FlipPlan = {
  design: { recipeId: "cushion-cover", parts: {} },
  findId: "tea-dress",
  grade: "loved",
  pullCm: 2,
  harshShare: 0,
  cut: "trace",
  seamAccuracy: 0.92,
};

function stallDay3(): GameState {
  const fresh = settleStories(newTestGame(PLAYER));
  const later = endDays(fresh, 2);
  return withRack(later, [
    rackPieceFixture("piece-1", {
      recipeId: "remade-top",
      design: { recipeId: "remade-top", parts: { bodice: "wrap-bodice", sleeves: "cap-sleeve" } },
      cloth: { colour: "lavender", print: "solid", material: "satin" },
      colours: ["lavender"],
      tags: ["romantic", "elegant"],
      findIds: ["satin-dress"],
    }),
  ]);
}

function withNana(): GameState {
  return withActiveGig(settleStories(newTestGame(PLAYER)), "nana-bea");
}

function gigId(state: GameState): string {
  const gig = state.gigs.active[state.gigs.active.length - 1];
  if (gig === undefined) throw new Error("No gig on the board");
  return gig.id;
}

function atUnpick(): GameState {
  return flipAtUnpick(settleStories(newTestGame(PLAYER)), "nana-bea", CUSHION.design, [
    { findId: CUSHION.findId, grade: "tired" },
  ]);
}

function partlyUnpicked(): GameState {
  const state = atUnpick();
  const run = state.activeRun;
  const owned = run?.finds[0];
  if (owned === undefined) throw new Error("No find on the bench");
  const pulls = Array.from({ length: 6 }, (_, stitch): Action => ({
    type: "pullStitch",
    findKey: owned.id,
    line: 0,
    stitch,
    distanceCm: 2,
    assisted: false,
  }));
  return dispatchAll(state, pulls);
}

function atClean(): GameState {
  return reduce(unpickAll(atUnpick(), 2), { type: "goToStage", stage: "clean" });
}

function atFinish(): GameState {
  const cleaned = reduce(scrubAll(atClean(), 0), { type: "goToStage", stage: "layout" });
  const laid = dispatchAll(cleaned, [...layoutActions(cleaned), { type: "goToStage", stage: "cut" }]);
  const cut = dispatchAll(laid, [...cutActions(laid, "trace"), { type: "goToStage", stage: "sew" }]);
  return dispatchAll(cut, [
    ...seamActions(cut, CUSHION.seamAccuracy),
    { type: "goToStage", stage: "finish" },
  ]);
}

function atReview(): GameState {
  const state = withNana();
  return playFlipToReview(state, gigId(state), CUSHION);
}

function expectStage(state: GameState, stage: string): GameState {
  if (state.activeRun?.stage !== stage) throw new Error(`Expected ${stage}, got ${state.activeRun?.stage}`);
  return state;
}

function boutiqueHub(): GameState {
  const state = tillDaySave();
  return reduce(state, { type: "endDay" });
}

async function snap(page: Page, name: string, settled = true): Promise<void> {
  if (folder === undefined) throw new Error("QUALITY_SHOTS_DIR is not set");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  if (settled) await settledForShot(page);
  mkdirSync(folder, { recursive: true });
  await page.screenshot({ path: join(folder, name), animations: "disabled", caret: "hide" });
}

async function restPointer(page: Page): Promise<void> {
  await page.mouse.move(1279, 799);
}

async function openSave(page: Page, state: GameState): Promise<void> {
  await openThriftSave(page, state);
  await finishStories(page);
}

async function openBench(page: Page, state: GameState): Promise<void> {
  await openSave(page, state);
  await page
    .getByTestId("gig-card")
    .getByRole("button", { name: /^Continue/ })
    .click();
}

test.describe("quality screenshots", () => {
  test.skip(!process.env["QUALITY_SHOTS_DIR"], "Set QUALITY_SHOTS_DIR to capture quality screenshots");
  test.use({ viewport: { width: 1280, height: 720 } });

  test("title", async ({ page }) => {
    await page.goto(THRIFT_URL);
    await page.evaluate((json) => {
      window.localStorage.clear();
      window.localStorage.setItem("thrift-flip.save.1", json);
      window.localStorage.setItem("thrift-flip.lastSlot", "1");
    }, serialize(stallDay3()));
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Thrift-Flip Studio" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("slot-1")).toContainText("Rosa");
    await restPointer(page);
    await snap(page, "title.png");
  });

  test("hub", async ({ page }) => {
    await openSave(page, stallDay3());
    await expect(page.getByTestId("stall-hub")).toHaveAttribute("data-career", "stall");
    await restPointer(page);
    await snap(page, "hub.png");
  });

  test("craft-1 unpick", async ({ page }) => {
    await openBench(page, expectStage(partlyUnpicked(), "unpick"));
    await expect(page.getByRole("heading", { level: 1, name: "Snip old stitches" })).toBeVisible();
    const bench = page.getByTestId("stitch-bench");
    await settledForShot(page);
    const stitches = bench.locator('[data-stitch][data-popped="no"]');
    const first = await centreOf(stitches.nth(0).locator(".tf-stitch__hit"));
    const second = await centreOf(stitches.nth(1).locator(".tf-stitch__hit"));
    const spacing = Math.hypot(second[0] - first[0], second[1] - first[1]);
    await page.mouse.move(first[0], first[1]);
    await page.mouse.down();
    await page.mouse.move(first[0], first[1] + spacing * 0.3, { steps: 8 });
    await afterNextFrame(page);
    await snap(page, "craft-1.png", false);
    await page.mouse.up();
  });

  test("craft-2 scrub", async ({ page }) => {
    await openBench(page, expectStage(atClean(), "clean"));
    await expect(page.getByRole("heading", { level: 1, name: "Scrub the stains" })).toBeVisible();
    const scrubber = page.getByTestId("stain-scrubber");
    await settledForShot(page);
    const box = await scrubber.boundingBox();
    if (box === null) throw new Error("No stain on the bench");
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const radius = box.width * 0.17;
    await page.mouse.move(cx + radius, cy);
    await page.mouse.down();
    for (let turn = 0; turn < 40; turn += 1) {
      const angle = (turn / 8) * Math.PI * 2;
      await page.mouse.move(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, { steps: 4 });
      await afterNextFrame(page);
    }
    await expect.poll(async () => Number(await scrubber.getAttribute("data-scrub-ticks"))).toBeGreaterThan(0);
    await snap(page, "craft-2.png", false);
    await page.mouse.up();
  });

  test("craft-3 finishing", async ({ page }) => {
    await openBench(page, expectStage(atFinish(), "finish"));
    await expect(page.getByRole("heading", { level: 1, name: "Finishing touches" })).toBeVisible();
    await scrollIntoView(page, ".tf-finish");
    await page.locator('[data-drawer="tin"]').click();
    const preview = page.locator(".tf-finish__svg");
    const [placed, target] = await svgToScreen(preview, [
      [170, 190],
      [235, 235],
    ]);
    if (placed === undefined || target === undefined) throw new Error("No spot on the piece");
    const button = page.locator('[data-finish="new-button"]');
    const from = await centreOf(button);
    await page.mouse.move(from[0], from[1]);
    await page.mouse.down();
    await page.mouse.move(placed[0], placed[1], { steps: 14 });
    await page.mouse.up();
    await expect(preview.locator("[data-finish-id]")).toHaveCount(1);
    await settledForShot(page);
    const again = await centreOf(button);
    await page.mouse.move(again[0], again[1]);
    await page.mouse.down();
    await page.mouse.move(target[0] + 6, target[1] + 6, { steps: 14 });
    await expect(page.locator(".tf-finish__ghost")).toBeVisible();
    await afterNextFrame(page);
    await snap(page, "craft-3.png", false);
    await page.mouse.up();
  });

  test("showcase", async ({ page }) => {
    await openSave(page, showcaseSave());
    await page.getByTestId("open-showcase").click();
    await expect(page.getByTestId("showcase-planner")).toBeVisible();
    await page.getByRole("radio", { name: /Dreamy Strings/ }).click();
    await page.getByRole("radio", { name: /Warm Glow/ }).click();
    await page.clock.install();
    await holdShowTime(page);
    await page.getByTestId("stage-showcase").click();
    await expect(page.getByTestId("hall-show")).toBeVisible();
    const card = page.getByTestId("show-story-card");
    await playToScene(page, "hall-show", "walk-1");
    await playWithinScene(page, "hall-show", "walk-1", () => card.isVisible());
    await expect(page.getByTestId("hall-show")).toHaveAttribute("data-scene", "walk-1");
    await expect(card).toBeVisible();
    await page.clock.runFor(1700);
    await restPointer(page);
    await snap(page, "showcase.png", false);
    await releaseShowTime(page);
  });

  test("results", async ({ page }) => {
    await openBench(page, expectStage(atReview(), "review"));
    await expect(page.getByRole("heading", { level: 1, name: "Ready to hand over" })).toBeVisible();
    await page.getByTestId("deliver").click();
    await expect(page.getByTestId("results")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "results.png");
  });

  test("career2-hub", async ({ page }) => {
    await openSave(page, boutiqueHub());
    await expect(page.getByTestId("stall-hub")).toHaveAttribute("data-career", "boutique");
    await restPointer(page);
    await snap(page, "career2-hub.png");
  });
});
