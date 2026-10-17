import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { reduce, serialize, type GameState } from "../../src/games/patisserie/core";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  settleStories,
  withOrder,
  type BakePlan,
} from "../../src/games/patisserie/core/testPlaythrough";
import { endDays } from "../../src/games/patisserie/core/salonPlaythrough";
import { centreOf, PATISSERIE_URL } from "../fixtures/patisseriePage";
import { openPreparedBakery, openPreparedBench } from "../fixtures/preparedBakery";
import { fairDay, stockedSalon } from "../fixtures/salonStates";
import { settledForShot } from "../fixtures/settle";
import { holdShowTime, playToScene, releaseShowTime } from "../fixtures/showTime";
import { traceLegs, type TracePoint } from "../fixtures/traceLegs";

const folder = process.env["QUALITY_SHOTS_DIR"];

const LAYER_CAKE: BakePlan = {
  ...GOOD_PLAN,
  productId: "layer-cake",
  mixIds: ["honey-sponge"],
  fillingId: "raspberry-jam",
  colours: ["ivory", "blush"],
};

const CUPCAKES: BakePlan = {
  ...GOOD_PLAN,
  productId: "cupcake-tray",
  mixIds: ["vanilla-sponge"],
  fillingId: null,
  colours: ["lavender", "sky", "blush"],
};

function baker(): GameState {
  return settleStories(newTestGame());
}

function seasonedBaker(): GameState {
  const first = withOrder(baker(), "ms-farrow");
  const served = settleStories(playOrder(first, lastGigId(first), CUPCAKES));
  return withOrder(endDays(served, 2), "grandpa-tomasz");
}

function cakeAt(stage: "weigh" | "pipe" | "decorate" | "review"): GameState {
  const ordered = withOrder(baker(), "grandpa-tomasz");
  return playRunTo(reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) }), LAYER_CAKE, stage);
}

async function snap(page: Page, name: string, settled = true): Promise<void> {
  if (folder === undefined) throw new Error("QUALITY_SHOTS_DIR is not set");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  if (settled) await settledForShot(page);
  mkdirSync(folder, { recursive: true });
  await page.screenshot({ path: join(folder, name), animations: "disabled", caret: "hide" });
}

async function restPointer(page: Page): Promise<void> {
  await page.mouse.move(1279, 719);
}

async function traceSome(page: Page, share: number): Promise<void> {
  const table = page.getByTestId("pipe-table");
  await table.scrollIntoViewIfNeeded();
  const points = JSON.parse((await table.getAttribute("data-path")) ?? "[]") as TracePoint[];
  const box = await table.boundingBox();
  if (box === null) throw new Error("No pipe table");
  const toScreen = ([x, y]: TracePoint) => ({
    x: box.x + (x / 24) * box.width,
    y: box.y + (y / 24) * box.height,
  });
  const legs = traceLegs(points);
  const first = points[0];
  if (first === undefined) throw new Error("Empty path");
  const start = toScreen(first);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (const [, to] of legs.slice(0, Math.max(1, Math.ceil(legs.length * share)))) {
    const next = toScreen(to);
    await page.mouse.move(next.x, next.y, { steps: 12 });
  }
}

test.describe("quality screenshots", () => {
  test.skip(!process.env["QUALITY_SHOTS_DIR"], "Set QUALITY_SHOTS_DIR to capture quality screenshots");
  test.use({ viewport: { width: 1280, height: 720 } });

  test("title", async ({ page }) => {
    await page.goto(PATISSERIE_URL);
    await page.evaluate((json) => {
      window.localStorage.clear();
      window.localStorage.setItem("patisserie.save.1", json);
      window.localStorage.setItem("patisserie.lastSlot", "1");
    }, serialize(seasonedBaker()));
    await page.reload();
    await expect(page.getByRole("button", { name: /^Continue/ })).toBeVisible();
    await restPointer(page);
    await snap(page, "title.png");
  });

  test("hub", async ({ page }) => {
    await openPreparedBakery(page, seasonedBaker());
    await restPointer(page);
    await snap(page, "hub.png");
  });

  test("craft-1 weigh", async ({ page }) => {
    await openPreparedBench(page, cakeAt("weigh"));
    await expect(page.getByTestId("weigh-station")).toBeVisible();
    const pad = await centreOf(page.getByTestId("pour-pad"));
    await page.mouse.move(pad.x, pad.y);
    await page.mouse.down();
    await page.waitForFunction(
      () => {
        const label = document.querySelector(".pa-dial")?.getAttribute("aria-label") ?? "";
        return Number(/shows (\d+)/.exec(label)?.[1] ?? "0") >= 150;
      },
      undefined,
      { polling: "raf", timeout: 15_000 },
    );
    await snap(page, "craft-1.png", false);
    await page.mouse.up();
  });

  test("craft-2 pipe", async ({ page }) => {
    await openPreparedBench(page, cakeAt("pipe"));
    await expect(page.getByTestId("pipe-table")).toBeVisible();
    await traceSome(page, 0.6);
    await snap(page, "craft-2.png", false);
    await page.mouse.up();
  });

  test("craft-3 decorate", async ({ page }) => {
    await openPreparedBench(page, cakeAt("decorate"));
    const cake = page.locator(".pa-decorate__cake");
    await expect(cake).toBeVisible();
    const box = await cake.boundingBox();
    if (box === null) throw new Error("No cake");
    const rose = page.getByTestId("topping-sugar-rose");
    for (const [x, y] of [
      [0.42, 0.47],
      [0.6, 0.49],
    ] as const) {
      const from = await centreOf(rose);
      const to = { x: box.x + box.width * x, y: box.y + box.height * y };
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      for (let step = 1; step <= 12; step += 1)
        await page.mouse.move(from.x + ((to.x - from.x) * step) / 12, from.y + ((to.y - from.y) * step) / 12);
      await page.mouse.up();
    }
    await expect(page.locator(".pa-decorate__hit")).toHaveCount(2);
    await restPointer(page);
    await snap(page, "craft-3.png");
  });

  test("showcase", async ({ page }) => {
    await openPreparedBakery(page, fairDay());
    await page.getByTestId("go-to-fair").click();
    await page.getByTestId("fair-board-next").click();
    await expect(page.getByTestId("fair-planner")).toBeVisible();
    await page.clock.install();
    await holdShowTime(page);
    await page.getByTestId("start-showcase").click();
    await playToScene(page, "fair-showcase", "wait-1");
    await page.getByTestId("lift-cloche").click();
    await expect(page.getByTestId("fair-showcase")).toHaveAttribute("data-scene", "reveal-1");
    await page.clock.runFor(900);
    await restPointer(page);
    await snap(page, "showcase.png", false);
    await releaseShowTime(page);
  });

  test("results", async ({ page }) => {
    await openPreparedBench(page, cakeAt("review"));
    await page.getByTestId("deliver").click();
    await expect(page.getByTestId("results")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "results.png");
  });

  test("career2-hub", async ({ page }) => {
    await openPreparedBakery(page, endDays(stockedSalon(), 3));
    await restPointer(page);
    await snap(page, "career2-hub.png");
  });
});
