import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { reduce, requiredPieces, type Action, type GameState } from "../../src/games/adeeva/core";
import {
  assembleToSew,
  craftToReview,
  DEFAULT_CRAFT,
  dispatchAll,
  layoutAndCut,
  newTestGame,
  SIMPLE_DESIGN,
  SIMPLE_LAYOUT,
  sketchAndShop,
  withActiveGig,
  type CraftOptions,
} from "../../src/games/adeeva/core/testPlaythrough";
import { openAdeeva } from "../fixtures/adeevaPage";
import { openPreparedGame, settleStories } from "../fixtures/preparedGame";
import { seasonReadyForRunway } from "../fixtures/runwaySeason";
import { settledForShot } from "../fixtures/settle";
import { holdShowTime, playToScene, releaseShowTime } from "../fixtures/showTime";

const folder = process.env["QUALITY_SHOTS_DIR"];

const CRAFT: CraftOptions = { ...DEFAULT_CRAFT, fabricId: "blush-floral" };

function student(): GameState {
  return withActiveGig(settleStories(newTestGame({ seed: 7, name: "Ada" })), "mom");
}

function onTable(): GameState {
  const state = student();
  const gig = state.gigs.active[state.gigs.active.length - 1];
  if (gig === undefined) throw new Error("No gig was added");
  return reduce(state, { type: "startRun", gigId: gig.id });
}

function sketched(): GameState {
  const categories = Object.keys(SIMPLE_DESIGN) as (keyof typeof SIMPLE_DESIGN)[];
  return dispatchAll(onTable(), [
    { type: "goToStage", stage: "sketch" },
    ...categories.map((category): Action => ({
      type: "chooseSketchPart",
      category,
      partId: SIMPLE_DESIGN[category],
    })),
    ...categories.map((category): Action => ({
      type: "chooseSketchFabric",
      category,
      fabricId: CRAFT.fabricId,
    })),
  ]);
}

function laidOut(): GameState {
  const shopped = sketchAndShop(onTable(), CRAFT);
  const run = shopped.activeRun;
  if (run === null) throw new Error("No run at the cutting table");
  return dispatchAll(
    shopped,
    requiredPieces(run.design).map((entry): Action => {
      const spot = SIMPLE_LAYOUT[entry.piece.id];
      if (spot === undefined) throw new Error(`No layout for ${entry.piece.id}`);
      return { type: "placePiece", pieceId: entry.piece.id, ...spot };
    }),
  );
}

function atMachine(): GameState {
  return assembleToSew(
    dispatchAll(layoutAndCut(sketchAndShop(onTable(), CRAFT), CRAFT), [{ type: "endDay" }]),
  );
}

function atFitting(): GameState {
  return craftToReview(onTable(), CRAFT);
}

function expectStage(state: GameState, stage: string): GameState {
  if (state.activeRun?.stage !== stage) throw new Error(`Expected ${stage}, got ${state.activeRun?.stage}`);
  return state;
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

async function openTable(page: Page, state: GameState): Promise<void> {
  await openPreparedGame(page, state, false);
  await page
    .getByTestId("gig-card")
    .getByRole("button", { name: /^Continue/ })
    .click();
}

async function centreOf(locator: Locator): Promise<[number, number]> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("Element is not visible");
  return [box.x + box.width / 2, box.y + box.height / 2];
}

async function svgToScreen(
  svg: Locator,
  points: readonly (readonly [number, number])[],
): Promise<[number, number][]> {
  return svg.evaluate((element, list) => {
    const matrix = (element as SVGSVGElement).getScreenCTM();
    if (matrix === null) return [];
    return list.map(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix);
      return [point.x, point.y] as [number, number];
    });
  }, points);
}

async function openBoard(page: Page): Promise<void> {
  await openPreparedGame(page, seasonReadyForRunway(), false);
  await page.getByRole("button", { name: "Open collection board" }).click();
  await expect(page.getByTestId("collection-board")).toBeVisible();
}

test.describe("quality screenshots", () => {
  test.skip(!process.env["QUALITY_SHOTS_DIR"], "Set QUALITY_SHOTS_DIR to capture quality screenshots");
  test.use({ viewport: { width: 1280, height: 800 } });

  test("title", async ({ page }) => {
    await openPreparedGame(page, student(), false);
    await openAdeeva(page);
    await expect(page.getByTestId("slot-1")).toContainText("Ada");
    await restPointer(page);
    await snap(page, "title.png");
  });

  test("hub", async ({ page }) => {
    await openPreparedGame(page, student(), false);
    await expect(page.getByTestId("gig-card")).toHaveCount(1);
    await restPointer(page);
    await snap(page, "hub.png");
  });

  test("craft-1 sketch", async ({ page }) => {
    await openTable(page, expectStage(sketched(), "sketch"));
    await expect(page.getByRole("heading", { name: "Sketch the dress" })).toBeVisible();
    await restPointer(page);
    await snap(page, "craft-1.png");
  });

  test("craft-2 cutting", async ({ page }) => {
    await openTable(page, expectStage(laidOut(), "cut"));
    await expect(page.getByRole("heading", { name: "Cutting table" })).toBeVisible();
    await page.getByTestId("start-cutting").click();
    const mat = page.getByTestId("trace-mat");
    await expect(mat).toBeVisible();
    await mat.scrollIntoViewIfNeeded();
    const outline = JSON.parse((await mat.getAttribute("data-outline")) ?? "[]") as [number, number][];
    const path = await svgToScreen(mat, outline);
    const first = path[0];
    if (first === undefined) throw new Error("No outline to trace");
    await page.mouse.move(first[0], first[1]);
    await page.mouse.down();
    for (const point of path.slice(1, Math.ceil(path.length * 0.6))) {
      await page.mouse.move(point[0], point[1], { steps: 18 });
    }
    await snap(page, "craft-2.png", false);
    await page.mouse.up();
  });

  test("craft-3 sewing", async ({ page }) => {
    await openTable(page, expectStage(atMachine(), "sew"));
    await expect(page.getByRole("heading", { name: "Sewing machine" })).toBeVisible();
    const bed = page.getByTestId("sewing-bed");
    await bed.scrollIntoViewIfNeeded();
    const [x, y] = await centreOf(bed);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await expect
      .poll(async () => Number(await bed.getAttribute("data-progress")), { timeout: 20_000 })
      .toBeGreaterThan(0.45);
    await snap(page, "craft-3.png", false);
    await page.mouse.up();
  });

  test("showcase", async ({ page }) => {
    await openBoard(page);
    await page.getByRole("button", { name: "Plan the runway" }).click();
    await page.getByRole("radio", { name: /Dreamy Strings/ }).click();
    await page.getByRole("radio", { name: /Spotlight/ }).click();
    await page.clock.install();
    await holdShowTime(page);
    await page.getByRole("button", { name: "Raise the curtain" }).click();
    await expect(page.getByTestId("runway-show")).toBeVisible();
    await playToScene(page, "runway-show", "walk-2");
    await page.clock.runFor(1800);
    await snap(page, "showcase.png", false);
    await releaseShowTime(page);
  });

  test("results", async ({ page }) => {
    await openTable(page, expectStage(atFitting(), "review"));
    await page.getByTestId("deliver").click();
    const results = page.getByTestId("results");
    await expect(results).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "results.png");
  });

  test("career2-hub", async ({ page }) => {
    await openPreparedGame(page, seasonReadyForRunway(), false);
    await restPointer(page);
    await snap(page, "career2-hub.png");
  });
});
