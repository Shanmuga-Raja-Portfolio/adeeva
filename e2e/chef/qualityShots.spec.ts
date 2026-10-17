import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  currentCookStep,
  serialize,
  type Action,
  type GameState,
  type RunStage,
} from "../../src/games/chef/core";
import {
  cookDish,
  cookUntil,
  crossroadsReady,
  dispatchAll,
  must,
  newTestGame,
  playWholeService,
  settleStories,
} from "../../src/games/chef/core/testPlaythrough";
import { CHEF_URL, finishChefStories, svgToScreen } from "../fixtures/chefKitchen";
import { openChefSave } from "../fixtures/chefPaths";
import { settledForShot } from "../fixtures/settle";
import { holdShowTime, playUntil, releaseShowTime } from "../fixtures/showTime";

const folder = process.env["QUALITY_SHOTS_DIR"];

const CHEF = { seed: 21, name: "Tomi", trait: "charmer" } as const;

const RING_PEAK_MS = 150;

const MENU = ["dal-tadka", "jollof-rice", "kelewele", "spaghetti-al-pomodoro", "elote", "miso-soup"];

function student(): GameState {
  return settleStories(newTestGame(CHEF));
}

function lesson(): GameState {
  return settleStories(must(student(), { type: "startLesson" }));
}

function practice(dishId: string): GameState {
  return cookUntil(must(seasonedStudent(), { type: "startPractice", dishId }), (run) => run.stage === "cook");
}

function lessonAtStage(stage: RunStage): GameState {
  return cookUntil(lesson(), (run) => run.stage === stage);
}

function seasonedStudent(): GameState {
  return settleStories(must(settleStories(cookDish(lesson())), { type: "endDay" }));
}

function restaurantNight(): GameState {
  const chosen = settleStories(
    must(crossroadsReady(CHEF), { type: "choosePath", path: "restaurant", nameCard: "harbour-table" }),
  );
  const team: Action[] = [
    { type: "setPathMenu", dishIds: MENU },
    { type: "hireStaff", staffId: "tavi" },
    { type: "hireStaff", staffId: "lin" },
    { type: "hireStaff", staffId: "bruno" },
    ...[2, 3, 4, 5].map((night): Action => ({ type: "toggleShift", staffId: "tavi", night })),
    ...[3, 4, 5, 6].map((night): Action => ({ type: "toggleShift", staffId: "lin", night })),
    ...[2, 3, 4, 5].map((night): Action => ({ type: "toggleShift", staffId: "bruno", night })),
  ];
  return settleStories(must(dispatchAll(chosen, team), { type: "endDay" }));
}

function servedRestaurant(): GameState {
  return settleStories(playWholeService(settleStories(must(restaurantNight(), { type: "openNight" }))));
}

interface ShotOptions {
  readonly settled: boolean;
  readonly animations: "disabled" | "allow";
}

const SETTLED: ShotOptions = { settled: true, animations: "disabled" };

const LIVE: ShotOptions = { settled: false, animations: "disabled" };

async function snap(page: Page, name: string, options: ShotOptions = SETTLED): Promise<void> {
  if (folder === undefined) throw new Error("QUALITY_SHOTS_DIR is not set");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  if (options.settled) await settledForShot(page);
  mkdirSync(folder, { recursive: true });
  await page.screenshot({ path: join(folder, name), animations: options.animations, caret: "hide" });
}

async function restPointer(page: Page): Promise<void> {
  await page.mouse.move(1279, 719);
}

async function dragTo(page: Page, from: Locator, to: readonly [number, number]): Promise<void> {
  const box = await from.boundingBox();
  if (box === null) throw new Error("Nothing to drag");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(to[0], to[1], { steps: 10 });
  await page.mouse.up();
}

async function tapPiece(page: Page, piece: Locator): Promise<void> {
  const box = await piece.boundingBox();
  if (box === null) throw new Error("No piece in the pan");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function openKitchen(page: Page, state: GameState): Promise<void> {
  await openChefSave(page, serialize(state));
  await finishChefStories(page);
}

async function openDish(page: Page, state: GameState): Promise<void> {
  await openKitchen(page, state);
  await page.getByTestId("back-to-dish").click();
  await finishChefStories(page);
}

test.describe("quality screenshots", () => {
  test.skip(!process.env["QUALITY_SHOTS_DIR"], "Set QUALITY_SHOTS_DIR to capture quality screenshots");
  test.use({ viewport: { width: 1280, height: 720 } });

  test("title", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((json) => {
      window.localStorage.clear();
      window.localStorage.setItem("chef.sound", "off");
      window.localStorage.setItem("chef.save.1", json);
      window.localStorage.setItem("chef.lastSlot", "1");
    }, serialize(seasonedStudent()));
    await page.goto(CHEF_URL);
    await page.reload();
    await expect(page.getByRole("button", { name: /^Continue/ })).toBeVisible();
    await restPointer(page);
    await snap(page, "title.png");
  });

  test("hub", async ({ page }) => {
    await openKitchen(page, seasonedStudent());
    await expect(page.getByTestId("kitchen-hub")).toBeVisible();
    await restPointer(page);
    await snap(page, "hub.png");
  });

  test("craft-1 chop", async ({ page }) => {
    await page.clock.install();
    await openDish(page, practice("kelewele"));
    const board = page.getByTestId("chop-board");
    await expect(board).toBeVisible();
    await holdShowTime(page);
    const marks = JSON.parse((await board.getAttribute("data-marks")) ?? "[]") as number[];
    await page.getByTestId("chop-start").click();
    const surface = await page.getByTestId("chop-surface").boundingBox();
    if (surface === null) throw new Error("No board");
    for (const mark of marks.slice(0, 2)) {
      await playUntil(
        page,
        `mark ${mark}`,
        async () => Number(await board.getAttribute("data-clock")) >= mark,
      );
      await page.mouse.click(surface.x + surface.width / 2, surface.y + surface.height / 2);
    }
    await page.clock.runFor(200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "craft-1.png", LIVE);
    await releaseShowTime(page);
  });

  test("craft-2 sizzle", async ({ page }) => {
    await page.clock.install();
    await openDish(
      page,
      cookUntil(practice("kelewele"), (run, dish) => currentCookStep(run, dish) === "sizzle"),
    );
    await page.getByRole("radio", { name: /^4 dots/ }).click();
    await holdShowTime(page);
    await page.getByTestId("pan-start").click();
    const pan = page.getByTestId("sizzle-pan");
    const cooks = async () => JSON.parse((await pan.getAttribute("data-cooks")) ?? "[]") as number[];
    await playUntil(page, "a golden side", async () => ((await cooks())[0] ?? 0) >= 0.97);
    await tapPiece(page, pan.locator("[data-testid='piece-0'] > circle"));
    await playUntil(page, "a second golden side", async () => ((await cooks())[1] ?? 0) >= 0.97);
    await tapPiece(page, pan.locator("[data-testid='piece-1'] > circle"));
    await page.clock.runFor(1200);
    await pan.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().bottom - 710));
    await restPointer(page);
    await snap(page, "craft-2.png", LIVE);
    await releaseShowTime(page);
  });

  test("craft-3 plate", async ({ page }) => {
    await openDish(page, lessonAtStage("plate"));
    const canvas = page.getByTestId("plate-canvas");
    await expect(canvas).toBeVisible();
    await page.getByTestId("tray-golden-broth-bowl").click();
    const [spot] = await svgToScreen(canvas, [[200, 196]]);
    if (spot === undefined) throw new Error("No plate");
    await dragTo(page, page.getByTestId("tray-dal-swirl"), spot);
    await page.getByTestId("tray-coriander-sprig").click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "craft-3.png");
  });

  test("showcase", async ({ page }) => {
    await page.clock.install();
    await openDish(page, lessonAtStage("pass"));
    await expect(page.getByTestId("pass-bell")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await settledForShot(page);
    await holdShowTime(page);
    await page.getByTestId("pass-bell").click();
    await page.evaluate((at) => {
      for (const animation of document.getAnimations()) {
        const target = (animation.effect as KeyframeEffect | null)?.target ?? null;
        if (target === null || target.closest(".ck-pass") === null) continue;
        animation.pause();
        animation.currentTime = at;
      }
    }, RING_PEAK_MS);
    await restPointer(page);
    await snap(page, "showcase.png", { settled: false, animations: "allow" });
    await releaseShowTime(page);
  });

  test("results", async ({ page }) => {
    await openDish(page, lessonAtStage("pass"));
    await page.getByTestId("pass-bell").click();
    await expect(page.getByTestId("results")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await restPointer(page);
    await snap(page, "results.png");
  });

  test("career2-hub", async ({ page }) => {
    await openKitchen(page, servedRestaurant());
    await expect(page.getByTestId("path-hub")).toBeVisible();
    await restPointer(page);
    await snap(page, "career2-hub.png");
  });
});
