import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { reduce, serialize, type GameState, type RunStage } from "../../src/games/jewellery/core";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  settleStories,
  withOrder,
} from "../../src/games/jewellery/core/testPlaythrough";
import { afterNextFrame } from "../fixtures/frames";
import { cutByHand, JEWELLERY_URL, toScreen } from "../fixtures/jewelleryBench";
import { lanternNight, madeLine, openPreparedJewellery } from "../fixtures/preparedJewellery";
import { settledForShot } from "../fixtures/settle";
import { holdShowTime, playToScene, releaseShowTime } from "../fixtures/showTime";

const folder = process.env["QUALITY_SHOTS_DIR"];

const PLAYER = { seed: 41, name: "Mira" } as const;

function loftHub(): GameState {
  const line = madeLine(PLAYER);
  const declined = reduce(line, { type: "setBenchTour", on: false });
  if (declined === line) throw new Error("The bench tour stayed on the hub");
  return declined;
}

function freshBench(): GameState {
  return settleStories(newTestGame(PLAYER));
}

function seasonedBench(): GameState {
  const first = withOrder(freshBench(), "gran-mina");
  const delivered = settleStories(playOrder(first, lastGigId(first), GOOD_PLAN));
  return withOrder(delivered, "kiko");
}

function benchAt(stage: RunStage): GameState {
  const ordered = withOrder(freshBench(), "gran-mina");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, GOOD_PLAN, stage);
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

async function openBench(page: Page, stage: RunStage): Promise<void> {
  await openPreparedJewellery(page, benchAt(stage));
  await page.getByRole("button", { name: "Back to the bench" }).first().click();
}

async function dismissCoach(page: Page): Promise<void> {
  await page.getByTestId("coach-bubble").click();
  await expect(page.getByTestId("coach-bubble")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.describe("quality screenshots", () => {
  test.skip(!process.env["QUALITY_SHOTS_DIR"], "Set QUALITY_SHOTS_DIR to capture quality screenshots");
  test.use({ viewport: { width: 1280, height: 800 } });

  test("title", async ({ page }) => {
    await page.goto(JEWELLERY_URL);
    await page.evaluate((json) => {
      window.localStorage.clear();
      window.localStorage.setItem("jewellery.save.1", json);
      window.localStorage.setItem("jewellery.lastSlot", "1");
    }, serialize(seasonedBench()));
    await page.reload();
    await expect(page.getByRole("button", { name: /^Continue/ })).toContainText("Mira", { timeout: 30_000 });
    await restPointer(page);
    await snap(page, "title.png");
  });

  test("hub", async ({ page }) => {
    await openPreparedJewellery(page, seasonedBench());
    await restPointer(page);
    await snap(page, "hub.png");
  });

  test("craft-1 cut", async ({ page }) => {
    await openBench(page, "cut");
    await expect(page.getByRole("heading", { name: "Cut out" })).toBeVisible();
    await cutByHand(page, 0.55, true);
    await afterNextFrame(page);
    await snap(page, "craft-1.png", false);
    await page.mouse.up();
  });

  test("craft-2 joining lamp", async ({ page }) => {
    await openBench(page, "join");
    await expect(page.getByRole("heading", { name: "The Joining Lamp" })).toBeVisible();
    const bench = page.getByTestId("lamp-bench");
    const button = page.getByTestId("warm-button");
    await dismissCoach(page);
    await settledForShot(page);
    const [from] = ((await bench.getAttribute("data-zone")) ?? "0.7,0.85").split(",").map(Number);
    const box = await button.boundingBox();
    if (box === null) throw new Error("No warm button");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect
      .poll(async () => Number(await bench.getAttribute("data-warmth")), { timeout: 10_000, intervals: [40] })
      .toBeGreaterThanOrEqual((from ?? 0.7) + 0.04);
    await snap(page, "craft-2.png", false);
    await page.mouse.up();
  });

  test("craft-3 stone setting", async ({ page }) => {
    await openBench(page, "set");
    await expect(page.getByRole("heading", { name: "Set the stones" })).toBeVisible();
    const bench = page.getByTestId("stone-bench");
    const svg = bench.locator("svg").first();
    await dismissCoach(page);
    await settledForShot(page);
    const [x, y] = ((await bench.getAttribute("data-pose")) ?? "0,0,0").split(",").map(Number);
    const [stone, seat] = await toScreen(svg, [
      [x ?? 0, y ?? 0],
      [0, 0],
    ]);
    if (stone === undefined || seat === undefined) throw new Error("No stone on screen");
    await page.mouse.move(stone[0], stone[1]);
    await page.mouse.down();
    await page.mouse.move(seat[0], seat[1], { steps: 12 });
    await page.mouse.up();
    await expect(bench).toHaveAttribute("data-seated", "true");
    await page.getByTestId("press-claws").click();
    const claw = page.getByTestId("claw-0");
    const [sx, sy] = ((await claw.getAttribute("data-snug")) ?? "0,0").split(",").map(Number);
    const box = await claw.boundingBox();
    const [snug] = await toScreen(svg, [[sx ?? 0, sy ?? 0]]);
    if (box === null || snug === undefined) throw new Error("No claw on screen");
    const grip: [number, number] = [box.x + box.width / 2, box.y + box.height / 2];
    await page.mouse.move(grip[0], grip[1]);
    await page.mouse.down();
    await page.mouse.move(grip[0] + (snug[0] - grip[0]) * 0.6, grip[1] + (snug[1] - grip[1]) * 0.6, {
      steps: 10,
    });
    await afterNextFrame(page);
    await snap(page, "craft-3.png", false);
    await page.mouse.up();
  });

  test("showcase", async ({ page }) => {
    await openPreparedJewellery(page, lanternNight());
    await page.getByTestId("open-launch").click();
    await expect(page.getByTestId("launch-board")).toBeVisible();
    await page.getByTestId("to-planner").click();
    await page.getByTestId("lantern-rose").click();
    await page.getByTestId("music-beach-pop").click();
    await page.getByTestId("story-card-0").click();
    await page.clock.install();
    await holdShowTime(page);
    await page.getByTestId("stage-launch").click();
    await expect(page.getByTestId("lantern-launch")).toBeVisible();
    await playToScene(page, "lantern-launch", "wait-1");
    await page.getByTestId("open-lid").click();
    await playToScene(page, "lantern-launch", "reveal-1");
    await page.clock.runFor(1300);
    await restPointer(page);
    await snap(page, "showcase.png", false);
    await releaseShowTime(page);
  });

  test("results", async ({ page }) => {
    await openBench(page, "review");
    await expect(page.getByRole("heading", { name: "Ready to wrap" })).toBeVisible();
    await page.getByTestId("deliver").click();
    await expect(page.getByTestId("results")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "results.png");
  });

  test("career2-hub", async ({ page }) => {
    await openPreparedJewellery(page, loftHub());
    await expect(page.getByTestId("line-card")).toBeVisible();
    await restPointer(page);
    await snap(page, "career2-hub.png");
  });
});
