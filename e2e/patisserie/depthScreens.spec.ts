import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { serialize, type GameState } from "../../src/games/patisserie/core";
import { showcaseSteps } from "../../src/games/patisserie/ui/screens/fair/showcaseSteps";
import { dragBetween, finishBakeryStories, PATISSERIE_URL } from "../fixtures/patisseriePage";
import { recordScenes } from "../fixtures/sceneLog";
import { holdShowTime, playToScene, releaseShowTime } from "../fixtures/showTime";
import { settledForShot } from "../fixtures/settle";
import { widestSidewaysScroll } from "../fixtures/sidewaysScroll";

import {
  fairDay,
  grandShowpieceAt,
  salonDay,
  salonStart,
  salonTrayAt,
  seasonReady,
  showpieceAt,
  coveredWeigh,
  NEW_BAKE_COUNT,
  newBakeAt,
  showpieceDesigned,
  stockedSalon,
} from "../fixtures/salonStates";

const VIEWPORTS = [
  { width: 1280, height: 800 },
  { width: 820, height: 1180 },
] as const;

async function shot(page: Page, info: TestInfo, name: string): Promise<void> {
  expect(await widestSidewaysScroll(page), `${name} scrolls sideways`).toBe(0);
  await settledForShot(page);
  const size = page.viewportSize();
  await page.screenshot({ path: info.outputPath(`${name}-${size?.width ?? 0}x${size?.height ?? 0}.png`) });
}

async function openSaved(page: Page, state: GameState): Promise<void> {
  await page.goto("about:blank");
  await page.goto("/");
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("patisserie.save.1", json);
    window.localStorage.setItem("patisserie.lastSlot", "1");
  }, serialize(state));
  await page.goto(PATISSERIE_URL);
  await page.getByRole("button", { name: /^Continue/ }).click();
}

async function openPreparedBakery(page: Page, state: GameState): Promise<void> {
  await openSaved(page, state);
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
}

async function openPreparedBench(page: Page, state: GameState): Promise<void> {
  await openPreparedBakery(page, state);
  await page
    .getByRole("button", { name: /^Back to the (bench|showpiece)$/ })
    .first()
    .click();
  await expect(page.locator("main.pa-bake")).toBeVisible();
}

for (const viewport of VIEWPORTS) {
  test.describe(`depth screens at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("career step, parlour key and Comet Room card", async ({ page }, info) => {
      await page.goto("/");
      await page.evaluate(() => window.localStorage.clear());
      await page.goto(PATISSERIE_URL);
      await page.getByRole("button", { name: "New Game" }).click();
      await page.getByLabel("Name").fill("Mira");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Charmer" }).click();
      await page.getByRole("button", { name: "Next" }).click();
      await expect(page.getByRole("radio", { name: "Salon Pâtissier" })).toBeVisible();
      await page.getByRole("radio", { name: "Salon Pâtissier" }).click();
      await shot(page, info, "new-game-career");

      const veteran = {
        ...salonStart(),
        career: "bakery" as const,
        salon: null,
        fair: null,
        reputation: 31,
        ordersDelivered: 12,
      };
      await openSaved(page, { ...veteran, story: { ...veteran.story, queue: ["pa-salon-offer"] } });
      const story = page.locator(".pa-story");
      for (
        let step = 0;
        step < 4 && (await story.getByRole("button", { name: "Not yet" }).count()) === 0;
        step += 1
      )
        await story.locator(".pa-story__footer button").first().click();
      await expect(story.getByRole("button", { name: "Open the Comet Room" })).toBeVisible();
      await shot(page, info, "salon-offer-story");
      await story.getByRole("button", { name: "Not yet" }).click();
      await finishBakeryStories(page);
      await page.getByTestId("comet-room-card").scrollIntoViewIfNeeded();
      await shot(page, info, "comet-room-card");
    });

    test("season start, menu board and salon plan", async ({ page }, info) => {
      await openPreparedBakery(page, salonStart());
      await page.getByTestId("season-panel").scrollIntoViewIfNeeded();
      await shot(page, info, "season-theme-picker");
      await page.getByTestId("choose-theme").click();
      await expect(page.getByTestId("confirm-menu")).toBeVisible();
      await page.getByTestId("season-panel").scrollIntoViewIfNeeded();
      await shot(page, info, "season-menu-board");
      await openPreparedBakery(page, stockedSalon());
      await page.getByTestId("season-panel").scrollIntoViewIfNeeded();
      await shot(page, info, "season-salon-plan");
      await page.getByTestId("ribbon-wall").scrollIntoViewIfNeeded();
      await shot(page, info, "ribbon-wall");
    });

    test("salon tray split and showpiece touches", async ({ page }, info) => {
      await openPreparedBench(page, salonTrayAt("design"));
      await expect(page.getByTestId("split-tally")).toBeVisible();
      await shot(page, info, "salon-tray-split");
      await openPreparedBench(page, showpieceAt("brief"));
      await expect(page.getByTestId("fair-brief")).toBeVisible();
      await shot(page, info, "showpiece-brief");
      await openPreparedBench(page, showpieceDesigned());
      await page.getByTestId("touch-plaque-lettering").scrollIntoViewIfNeeded();
      await shot(page, info, "showpiece-touches");
    });

    test("Table Service on Salon Day", async ({ page }, info) => {
      await openPreparedBakery(page, salonDay());
      await page.getByTestId("open-tables").click();
      await expect(page.getByTestId("table-service")).toBeVisible();
      await shot(page, info, "table-service");
      await page.getByTestId("shelf-top-" + (await firstShelfColour(page, "top"))).click();
      await page.getByTestId("stand-slot-middle").click();
      await expect(page.getByTestId("salon-notice")).toContainText("sit on the top tier");
      await page.getByTestId("stand-slot-top").click();
      await shot(page, info, "table-plating");
    });

    test("Fair Board, Planner, Showcase and ribbons", async ({ page }, info) => {
      await openPreparedBakery(page, fairDay());
      await page.getByTestId("go-to-fair").click();
      await expect(page.getByTestId("fair-board")).toBeVisible();
      await shot(page, info, "fair-board");
      await page.getByTestId("fair-board-next").click();
      await expect(page.getByTestId("fair-planner")).toBeVisible();
      await shot(page, info, "fair-planner");
      const scenes = await recordScenes(page, "fair-showcase");
      await page.clock.install();
      await holdShowTime(page);
      await page.getByTestId("start-showcase").click();
      await playToScene(page, "fair-showcase", "title");
      await shot(page, info, "showcase-title");
      await playToScene(page, "fair-showcase", "wait-1");
      await expect(page.getByTestId("lift-cloche")).toBeVisible();
      await shot(page, info, "showcase-cloche");
      await page.getByTestId("lift-cloche").click();
      await expect(page.getByTestId("fair-showcase")).toHaveAttribute("data-scene", "reveal-1");
      await shot(page, info, "showcase-reveal");
      await playToScene(page, "fair-showcase", "finale");
      await shot(page, info, "showcase-finale");
      await playToScene(page, "fair-showcase", "panels");
      await releaseShowTime(page);
      await shot(page, info, "showcase-panels");
      const shown = await scenes();
      const seen = shown.slice(0, shown.indexOf("panels") + 1);
      const plates = seen.filter((scene) => scene.startsWith("reveal-")).length;
      expect(plates).toBeGreaterThan(0);
      expect(seen).toEqual(
        showcaseSteps(plates, false).map(
          (step) => `${step.kind}${step.plate >= 0 ? `-${step.plate + 1}` : ""}`,
        ),
      );
      await expect(page.getByTestId("fair-results")).toBeVisible({ timeout: 10_000 });
      await shot(page, info, "fair-results");
      await page.getByTestId("fair-done").click();
      await finishBakeryStories(page);
      await page.getByRole("button", { name: "Open the Bake Book" }).click();
      await expect(page.getByTestId("book-ribbon").first()).toBeVisible();
      await shot(page, info, "bake-book-ribbon");
    });

    test("extra touches at the bench", async ({ page }, info) => {
      await openPreparedBench(page, grandShowpieceAt("bake"));
      await expect(page.getByTestId("oven-pair")).toBeVisible();
      await shot(page, info, "oven-pair");
      await openPreparedBench(page, grandShowpieceAt("mix"));
      await page.getByRole("tab", { name: /Small tier/ }).click();
      await shot(page, info, "ribbon-stir");
      await openPreparedBench(page, coveredWeigh());
      await expect(page.getByTestId("weigh-station")).toBeVisible();
      await shot(page, info, "covered-scale");
      await openPreparedBench(page, grandShowpieceAt("review"));
      await shot(page, info, "three-tier-review");
    });
  });
}

for (const viewport of VIEWPORTS) {
  test(`new bakes from the depth catalogue at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    for (let index = 0; index < NEW_BAKE_COUNT; index += 1) {
      await openPreparedBench(page, newBakeAt(index, "review"));
      await expect(page.getByTestId("deliver")).toBeVisible();
      await shot(page, info, `new-bake-${index + 1}`);
    }
  });
}

for (const viewport of VIEWPORTS) {
  test(`stacking the grand cake and the wreath at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    await openPreparedBench(page, grandShowpieceAt("stack"));
    await dragBetween(page, page.getByTestId("piece-big-tier"), page.getByTestId("slot-stand"));
    await dragBetween(page, page.getByTestId("piece-middle-tier"), page.getByTestId("slot-on-big"));
    await dragBetween(page, page.getByTestId("piece-small-tier"), page.getByTestId("slot-on-middle"));
    await expect(page.getByTestId("level-it")).toBeVisible();
    await shot(page, info, "level-it");
    const rows = page.getByTestId("level-it").locator(".pa-level__row");
    await rows.nth(0).focus();
    for (let step = 0; step < 4; step += 1) await page.keyboard.press("ArrowLeft");
    await rows.nth(1).focus();
    for (let step = 0; step < 3; step += 1) await page.keyboard.press("ArrowRight");
    await expect(page.locator(".pa-stack__level")).toHaveCount(1);
    await page.getByTestId("fill").click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, info, "level-it-done");
    await openPreparedBench(page, newBakeAt(0, "stack"));
    await dragBetween(page, page.getByTestId("piece-first-six"), page.getByTestId("slot-ring-left"));
    await dragBetween(page, page.getByTestId("piece-second-six"), page.getByTestId("slot-ring-right"));
    await shot(page, info, "wreath-stack");
  });
}

async function firstShelfColour(page: Page, tier: string): Promise<string> {
  const id =
    (await page
      .locator(`[data-testid^="shelf-${tier}-"]:not([disabled])`)
      .first()
      .getAttribute("data-testid")) ?? "";
  return id.replace(`shelf-${tier}-`, "");
}

test.describe("depth screens in reduced motion", () => {
  test.use({ viewport: VIEWPORTS[0] });
  test("the showcase plays as stills", async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openPreparedBakery(page, seasonReady());
    expect(await widestSidewaysScroll(page)).toBe(0);
    await openPreparedBakery(page, fairDay());
    await page.getByTestId("go-to-fair").click();
    await page.getByTestId("fair-board-next").click();
    await page.clock.install();
    await holdShowTime(page);
    await page.getByTestId("start-showcase").click();
    await playToScene(page, "fair-showcase", "wait-1");
    await expect(page.getByTestId("lift-cloche")).toBeVisible();
    await shot(page, info, "showcase-still");
  });
});

test.describe("closing the Comet Room", () => {
  test.use({ viewport: VIEWPORTS[1] });
  test("asks before closing early and stops service at sunset", async ({ page }, info) => {
    await page.clock.install();
    await openPreparedBakery(page, salonDay());
    await page.getByTestId("open-tables").click();
    await expect(page.getByTestId("table-service")).toBeVisible();
    await page.getByTestId("close-salon").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("still waiting");
    await expect(dialog.locator(":focus")).toHaveCount(1);
    await expect(page.getByTestId("confirm-close-salon")).not.toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("table-service")).toBeVisible();
    await expect(page.getByTestId("open-tables")).toHaveCount(0);
    await page.clock.runFor(185_000);
    await expect(dialog).toContainText("The afternoon is over!");
    await expect(dialog).toContainText("their treats go to the counter");
    await expect(dialog.locator(":focus")).toHaveCount(1);
    await shot(page, info, "salon-sunset");
    await page.getByTestId("sunset-close-salon").click();
    await finishBakeryStories(page);
    await expect(page.getByTestId("bakery-hub")).toBeVisible();
  });
});
