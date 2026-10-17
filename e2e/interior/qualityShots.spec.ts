import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { reduce, serialize, type GameState, type RunStage } from "../../src/games/interior/core";
import {
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  recipeFor,
  settleStories,
  withOrder,
} from "../../src/games/interior/core/testPlaythrough";
import { endDays, playHomeRoom } from "../../src/games/interior/core/larkspurPlaythrough";
import { afterNextFrame } from "../fixtures/frames";
import {
  edgeByHand,
  finishInteriorStories,
  INTERIOR_URL,
  revealBySlider,
  toScreen,
} from "../fixtures/interiorStudio";
import { nookAt, openPreparedRoom, showHomeAt } from "../fixtures/preparedInterior";
import { openHouseReady, openPreparedHome, plannedHome } from "../fixtures/preparedLarkspur";
import { settle, settledForShot } from "../fixtures/settle";
import { holdShowTime, playToScene, releaseShowTime } from "../fixtures/showTime";

type Pair = readonly [number, number];

const folder = process.env["QUALITY_SHOTS_DIR"];

function seasonedDesigner(): GameState {
  const first = withOrder(settleStories(newTestGame({ name: "Mira" })), "nana-pearl");
  const served = settleStories(playOrder(first, lastGigId(first), recipeFor("nana-pearl")));
  return withOrder(endDays(served, 1), "castellanos");
}

function hallAt(stage: RunStage): GameState {
  const ordered = withOrder(settleStories(newTestGame({ name: "Mira" })), "castellanos");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, recipeFor("castellanos"), stage);
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

async function openLoft(page: Page, state: GameState): Promise<void> {
  await page.goto(INTERIOR_URL);
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("interior.save.1", json);
    window.localStorage.setItem("interior.lastSlot", "1");
  }, serialize(state));
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishInteriorStories(page);
  await expect(page.getByTestId("loft-hub")).toBeVisible();
}

async function holdAlong(page: Page, route: readonly Pair[]): Promise<void> {
  const first = route[0];
  if (first === undefined) return;
  await page.mouse.move(first[0], first[1]);
  await page.mouse.down();
  for (const [x, y] of route.slice(1)) await page.mouse.move(x, y, { steps: 2 });
  await afterNextFrame(page);
}

async function rollRows(page: Page, roll: Locator, rows: number): Promise<void> {
  const svg = roll.locator("svg").first();
  for (let row = 0; row < rows; row += 1) {
    await page.getByTestId("dip-roller").click();
    const y = row * 64 + 32;
    const line: Pair[] = Array.from({ length: 13 }, (_, step): Pair => [12 + step * 40.6, y]);
    const route = await toScreen(svg, line);
    await holdAlong(page, route);
    await page.mouse.up();
  }
}

async function holdOver(page: Page, from: Locator, svg: Locator, point: Pair): Promise<void> {
  await from.scrollIntoViewIfNeeded();
  const [to] = await toScreen(svg, [point]);
  const start = await from.boundingBox();
  if (start === null || to === undefined) throw new Error("Nothing to drag");
  const sx = start.x + start.width / 2;
  const sy = start.y + start.height / 2;
  await holdAlong(page, [[sx, sy], [sx + 14, sy + 10], [(sx + to[0]) / 2, (sy + to[1]) / 2], to]);
}

test.describe("quality screenshots", () => {
  test.skip(!process.env["QUALITY_SHOTS_DIR"], "Set QUALITY_SHOTS_DIR to capture quality screenshots");
  test.use({ viewport: { width: 1280, height: 800 } });

  test("title", async ({ page }) => {
    await page.goto(INTERIOR_URL);
    await page.evaluate((json) => {
      window.localStorage.clear();
      window.localStorage.setItem("interior.save.1", json);
      window.localStorage.setItem("interior.lastSlot", "1");
    }, serialize(seasonedDesigner()));
    await page.reload();
    await expect(page.getByRole("button", { name: /^Continue/ })).toBeVisible();
    await restPointer(page);
    await snap(page, "title.png");
  });

  test("hub", async ({ page }) => {
    await openLoft(page, seasonedDesigner());
    await restPointer(page);
    await snap(page, "hub.png");
  });

  test("craft-1 paint", async ({ page }) => {
    test.setTimeout(180_000);
    await openPreparedRoom(page, hallAt("paint"));
    await expect(page.getByRole("heading", { name: "Paint the walls" })).toBeVisible();
    const edges = await page
      .locator("[data-testid^='edge-back-']")
      .evaluateAll((list) =>
        list.map((element) => (element.getAttribute("data-testid") ?? "").replace("edge-", "")),
      );
    for (const pathId of edges) await edgeByHand(page, pathId);
    const roll = page.getByTestId("roll-back");
    await page.locator(".is-paint__rolling").evaluate((element) => {
      window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 90);
    });
    await settle(page);
    await rollRows(page, roll, 3);
    await page.getByTestId("dip-roller").click();
    const line: Pair[] = Array.from({ length: 7 }, (_, step): Pair => [12 + step * 40.6, 3 * 64 + 32]);
    await holdAlong(page, await toScreen(roll.locator("svg").first(), line));
    await snap(page, "craft-1.png", false);
    await page.mouse.up();
  });

  test("craft-2 floor", async ({ page }) => {
    test.setTimeout(180_000);
    await openPreparedRoom(page, nookAt("floor"));
    await expect(page.getByRole("heading", { name: "Lay the floor" })).toBeVisible();
    const area = page.getByTestId("floor-area");
    for (let piece = 0; piece < 4; piece += 1) {
      await page
        .locator(".is-floor__work")
        .evaluate((element) => element.scrollIntoView({ block: "center" }));
      await settle(page);
      const [tx, ty] = ((await area.getAttribute("data-target")) ?? "0,0").split(",").map(Number);
      const right = page.locator("[data-testid^='floor-candidate-'][data-right='true']");
      const key = ((await right.getAttribute("data-testid")) ?? "").replace("floor-candidate-", "");
      const [w, h] = key.split("-")[0]?.split("x").map(Number) ?? [30, 30];
      const lift = piece === 3 ? 14 : 0;
      await holdOver(page, right, area, [(tx ?? 0) + (w ?? 30) / 2 + lift, (ty ?? 0) + (h ?? 30) / 2 + lift]);
      if (piece === 3) break;
      await page.mouse.up();
      await expect(page.getByTestId("floor-pending")).toBeVisible();
      await page.getByTestId("press-floor").click();
      await expect(area).toHaveAttribute("aria-label", new RegExp(`${piece + 1} of 6 pieces laid`));
    }
    await snap(page, "craft-2.png", false);
    await page.mouse.up();
  });

  test("craft-3 style", async ({ page }) => {
    await openPreparedRoom(page, showHomeAt("style"));
    await expect(page.getByRole("heading", { name: "Style the room" })).toBeVisible();
    for (const decorId of ["framed-print", "potted-fern"]) {
      await page.getByTestId(`stock-${decorId}`).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId(`placed-${decorId}`)).toBeVisible();
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page);
    await holdOver(page, page.getByTestId("stock-wall-clock"), page.locator(".is-style__room"), [430, 150]);
    await snap(page, "craft-3.png", false);
    await page.mouse.up();
  });

  test("showcase", async ({ page }) => {
    test.setTimeout(180_000);
    await openPreparedHome(page, openHouseReady());
    await page.getByTestId("achebe-plan").click();
    await page.getByTestId("set-plan").click();
    await page.clock.install();
    await holdShowTime(page);
    await page.getByTestId("open-doors").click();
    await expect(page.getByTestId("open-house-show")).toBeVisible();
    await playToScene(page, "open-house-show", "walk-2");
    await page.clock.runFor(2400);
    await restPointer(page);
    await snap(page, "showcase.png", false);
    await releaseShowTime(page);
  });

  test("results", async ({ page }) => {
    await openPreparedRoom(page, nookAt("reveal"));
    await expect(page.getByTestId("reveal-stage")).toBeVisible();
    await revealBySlider(page);
    await page.getByTestId("reveal-button").click();
    await expect(page.getByTestId("results")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "results.png");
  });

  test("career2-hub", async ({ page }) => {
    await openPreparedHome(page, playHomeRoom(plannedHome(), 0));
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "career2-hub.png");
  });
});
