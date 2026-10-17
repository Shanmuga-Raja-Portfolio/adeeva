import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { reduce, serialize, type GameState } from "../../src/games/workshop/core";
import { afterNextFrame } from "../fixtures/frames";
import {
  BENCH_PLAN,
  commissionAt,
  openPreparedBench,
  openPreparedWorkshop,
} from "../fixtures/preparedWorkshop";
import { settledForShot } from "../fixtures/settle";
import { fairDayShowroom, openShowroomSave, twoSetsOnFloor } from "../fixtures/showroomSaves";
import { holdShowTime, playToScene, releaseShowTime } from "../fixtures/showTime";
import { centreOf, drag, svgToScreen, type ScreenPoint } from "../fixtures/workshopPage";

const folder = process.env["QUALITY_SHOTS_DIR"];

function benchOnTheGo(): GameState {
  return reduce(commissionAt("rosalind", BENCH_PLAN, "finish"), { type: "endDay" });
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

async function dismissCoach(page: Page): Promise<void> {
  const coach = page.getByTestId("coach-bubble");
  if ((await coach.count()) > 0) await coach.click();
  await expect(coach).toHaveCount(0);
}

async function holdAlong(page: Page, route: readonly ScreenPoint[]): Promise<void> {
  const [first, ...rest] = route;
  if (first === undefined) return;
  await page.mouse.move(first[0], first[1]);
  await page.mouse.down();
  let at = first;
  for (const point of rest) {
    const steps = Math.max(2, Math.ceil(Math.hypot(point[0] - at[0], point[1] - at[1]) / 3));
    await page.mouse.move(point[0], point[1], { steps });
    at = point;
  }
  await afterNextFrame(page);
}

test.describe("quality screenshots", () => {
  test.skip(!process.env["QUALITY_SHOTS_DIR"], "Set QUALITY_SHOTS_DIR to capture quality screenshots");
  test.use({ viewport: { width: 1280, height: 800 } });

  test("title", async ({ page }) => {
    await page.goto("/#/workshop");
    await page.evaluate((json) => {
      window.localStorage.clear();
      window.localStorage.setItem("workshop.save.1", json);
      window.localStorage.setItem("workshop.lastSlot", "1");
    }, serialize(benchOnTheGo()));
    await page.reload();
    await expect(page.getByRole("button", { name: /^Continue/ })).toBeVisible();
    await restPointer(page);
    await snap(page, "title.png");
  });

  test("hub", async ({ page }) => {
    await openPreparedWorkshop(page, benchOnTheGo());
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "hub.png");
  });

  test("craft-1 saw", async ({ page }) => {
    await openPreparedBench(page, commissionAt("rosalind", BENCH_PLAN, "saw"));
    await dismissCoach(page);
    const bench = page.getByTestId("saw-bench");
    await bench.evaluate((element) => element.scrollIntoView({ block: "end" }));
    await settledForShot(page);
    const cut = JSON.parse((await bench.getAttribute("data-cut")) ?? "[]") as [number, number][];
    const route = await svgToScreen(bench, cut.slice(0, Math.ceil(cut.length * 0.4)));
    await holdAlong(page, route);
    await snap(page, "craft-1.png", false);
    await page.mouse.up();
  });

  test("craft-2 sand", async ({ page }) => {
    await openPreparedBench(page, commissionAt("rosalind", BENCH_PLAN, "sand"));
    await dismissCoach(page);
    const sand = page.getByTestId("sand-bench");
    await sand.evaluate((element) => element.scrollIntoView({ block: "end" }));
    await settledForShot(page);
    for (const y of [20, 60]) {
      const strokes = Number(await sand.getAttribute("data-strokes"));
      await holdAlong(
        page,
        await svgToScreen(sand, [
          [4, y],
          [316, y],
          [4, y],
          [316, y],
        ]),
      );
      await page.mouse.up();
      await expect.poll(async () => Number(await sand.getAttribute("data-strokes"))).toBeGreaterThan(strokes);
    }
    await holdAlong(
      page,
      await svgToScreen(sand, [
        [4, 100],
        [316, 100],
        [150, 100],
      ]),
    );
    await snap(page, "craft-2.png", false);
    await page.mouse.up();
  });

  test("craft-3 finish", async ({ page }) => {
    await openPreparedBench(page, commissionAt("rosalind", BENCH_PLAN, "finish"));
    await expect(page.getByRole("heading", { name: "Finish and extras" })).toBeVisible();
    await dismissCoach(page);
    await page.getByTestId("finish-chalk-paint").click();
    await page.getByRole("radiogroup", { name: "Paint colour" }).getByRole("radio", { name: "Sage" }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await settledForShot(page);
    const canvas = await page.getByTestId("finish-canvas").boundingBox();
    if (canvas === null) throw new Error("No piece to decorate");
    await drag(
      page,
      await centreOf(page.getByTestId("extra-star-stencil")),
      [canvas.x + canvas.width * 0.32, canvas.y + canvas.height * 0.53],
      20,
    );
    await expect(page.getByTestId("placed-star-stencil")).toHaveCount(1);
    await settledForShot(page);
    const from = await centreOf(page.getByTestId("extra-leaf-carving"));
    await holdAlong(page, [
      from,
      [from[0] + 10, from[1] + 6],
      [canvas.x + canvas.width * 0.6, canvas.y + canvas.height * 0.55],
    ]);
    await snap(page, "craft-3.png", false);
    await page.mouse.up();
  });

  test("showcase", async ({ page }) => {
    test.setTimeout(180_000);
    await openShowroomSave(page, fairDayShowroom());
    await page.getByTestId("go-to-fair").click();
    await page.getByTestId("fair-board-next").click();
    await expect(page.getByTestId("fair-planner")).toBeVisible();
    await page.getByTestId("backdrop-bunting").click();
    await page.getByTestId("music-fiddle-folk").click();
    await page.clock.install();
    await holdShowTime(page);
    await page.getByTestId("open-booth").click();
    await expect(page.getByTestId("booth-reveal")).toBeVisible();
    await playToScene(page, "booth-reveal", "finale");
    await page.clock.runFor(1500);
    await restPointer(page);
    await snap(page, "showcase.png", false);
    await releaseShowTime(page);
  });

  test("results", async ({ page }) => {
    await openPreparedBench(page, commissionAt("rosalind", BENCH_PLAN, "review"));
    await expect(page.getByRole("heading", { name: "Ready to deliver" })).toBeVisible();
    await page.getByTestId("deliver").click();
    await expect(page.getByTestId("results")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "results.png");
  });

  test("career2-hub", async ({ page }) => {
    await openShowroomSave(page, reduce(twoSetsOnFloor(), { type: "setBenchTour", on: false }));
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "career2-hub.png");
  });
});
