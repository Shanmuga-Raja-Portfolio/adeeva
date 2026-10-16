import { expect, test, type Page } from "@playwright/test";
import { reduce } from "../../src/games/workshop/core/reduce";
import { READING_PLAN } from "../../src/games/workshop/core/setPlaythrough";
import { dispatchAll, runOf, sawActions } from "../../src/games/workshop/core/testPlaythrough";
import { depthShooter } from "../fixtures/depthShots";
import { isOutsideRequest } from "../fixtures/outsideRequest";
import {
  fairDayShowroom,
  openRawSave,
  openShowroomSave,
  setAt,
  themedShowroom,
  thresholdV1,
  twoSetsOnFloor,
} from "../fixtures/showroomSaves";
import { finishWorkshopStories, scrollToTop } from "../fixtures/workshopPage";
import type { GameState } from "../../src/games/workshop/core";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 820, height: 1180 },
] as const;

async function toBench(page: Page, state: GameState) {
  await openShowroomSave(page, state);
  await page.getByRole("button", { name: "Back to the workbench" }).first().click();
  await expect(page.locator("main.ww-build")).toBeVisible();
}

function twinReady(): GameState {
  const atSaw = setAt("saw");
  const firstChair = sawActions(atSaw, "trace").filter(
    (action) => action.type === "sawCut" && action.partId.startsWith("1:"),
  );
  return dispatchAll(atSaw, firstChair);
}

for (const viewport of VIEWPORTS) {
  test.describe(`showroom screens on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test(`career step, showroom hub and the set bench (${viewport.name})`, async ({ page }, testInfo) => {
      test.setTimeout(240_000);
      const shot = depthShooter(page, testInfo, viewport.name);
      const outside: string[] = [];
      page.on("request", (request) => {
        if (isOutsideRequest(request.url())) outside.push(request.url());
      });
      await page.goto("/#/workshop");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await page.getByRole("button", { name: "New Game" }).click();
      await page.getByLabel("Name").fill("Ada");
      await page.getByRole("radio", { name: "Braids" }).click();
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Dreamer" }).click();
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: /Furniture Showroom/ }).click();
      await shot("01-career-step");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Standard" }).click();
      await page.getByRole("button", { name: "Open the showroom" }).click();
      await expect(page.getByRole("heading", { name: "Two Keys on Larkspur Road" })).toBeVisible();
      await shot("02-intro-story");
      await finishWorkshopStories(page);
      await expect(page.getByRole("heading", { name: "Want a quick bench tour?" })).toBeVisible();
      await page.getByTestId("bench-tour-yes").click();
      await shot("03-showroom-start", true);

      await openShowroomSave(page, twoSetsOnFloor());
      await expect(page.getByTestId("showroom-floor")).toContainText("2 of 2 bays filled");
      await shot("04-hub-floor", true);
      await page.getByTestId("arrange-floor").click();
      await expect(page.getByTestId("floor-arrange")).toBeVisible();
      const piece = page.getByTestId("floor-piece-set-1-0");
      await piece.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await shot("05-floor-arrange");
      await page.getByTestId("floor-exit").click();

      await toBench(page, setAt("design"));
      await shot("06-set-design", true);
      await toBench(page, setAt("layout"));
      await page.getByTestId("plan-the-rest").click();
      await expect(page.getByTestId("matched-faces")).toBeVisible();
      await scrollToTop(page);
      await shot("07-set-layout", true);

      await toBench(page, twinReady());
      await page.getByRole("button", { name: /Dining Chair 2: Seat/ }).click();
      await expect(page.getByTestId("saw-like-first")).toBeVisible();
      await shot("08-set-saw-twin");
      await page.getByTestId("saw-like-first").click();
      await expect(page.locator(".ww-saw__message")).toContainText("just like your first");

      await toBench(page, setAt("join", READING_PLAN));
      await page.getByTestId("ren-pegs").click();
      await expect(page.getByText(/Ren tapped it home/).first()).toBeVisible();
      await shot("09-set-join", true);
      await toBench(page, setAt("sand"));
      await expect(page.getByTestId("shine-bar")).toBeVisible();
      await shot("10-set-sand", true);
      await toBench(page, setAt("finish"));
      await page.getByTestId("piece-2").click();
      await shot("11-set-finish", true);
      await toBench(page, setAt("review"));
      await shot("12-set-review", true);
      expect(outside).toEqual([]);
    });

    test(`the showroom offer, Hattie's set card and the set on the floor (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(180_000);
      const shot = depthShooter(page, testInfo, viewport.name);
      await openRawSave(page, thresholdV1());
      await finishWorkshopStories(page);
      await page.getByTestId("end-day").click();
      await page.getByRole("button", { name: "Open the garage" }).click();
      const story = page.locator(".ww-story");
      for (let step = 0; step < 40 && (await page.getByTestId("story-choice-later").count()) === 0; step += 1)
        await story.locator(".ww-story__footer button").first().click();
      await shot("00-showroom-offer");
      await page.getByTestId("story-choice-later").click();
      await finishWorkshopStories(page);
      await expect(page.getByTestId("open-showroom")).toBeVisible();
      await page.getByTestId("open-showroom").scrollIntoViewIfNeeded();
      await shot("00b-bram-old-shop");

      await toBench(page, reduce(themedShowroom(), { type: "startSet", templateId: "guest-room" }));
      await expect(page.getByRole("heading", { name: "Hattie's set card" })).toBeVisible();
      await shot("05b-set-card", true);
      await toBench(page, setAt("review"));
      await page.getByTestId("finish-set").click();
      await expect(page.getByTestId("set-results")).toBeVisible();
      await expect(page.getByTestId("set-results")).toContainText("Dining Chair 2:");
      await shot("12b-set-results", true);
    });

    test(`the Craft Fair in reduced motion, by keyboard (${viewport.name})`, async ({ page }, testInfo) => {
      test.setTimeout(240_000);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const shot = depthShooter(page, testInfo, viewport.name);
      await openShowroomSave(page, fairDayShowroom());
      await expect(page.getByTestId("season-ribbon")).toContainText("Fair Day is today!");
      await page.getByTestId("go-to-fair").click();
      await expect(page.getByTestId("fair-board")).toBeVisible();
      await shot("13-fair-board", true);
      await page.getByTestId("fair-board-next").click();
      await expect(page.getByTestId("fair-planner")).toBeVisible();
      await page.getByTestId("music-fiddle-folk").focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByTestId("music-acoustic-guitar")).toHaveAttribute("aria-checked", "true");
      await page.keyboard.press("ArrowLeft");
      await shot("14-fair-planner", true);
      await page.getByTestId("open-booth").click();
      const reveal = page.getByTestId("booth-reveal");
      await expect(reveal).toHaveClass(/ww-reveal--still/);
      for (let lift = 0; lift < 2; lift += 1) {
        await expect(page.getByTestId("lift-sheet")).toBeFocused({ timeout: 15_000 });
        if (lift === 0) await shot("15-reveal-still");
        await page.keyboard.press(lift === 0 ? "Enter" : " ");
        await expect(reveal).toHaveAttribute("data-scene", `lift-${lift + 1}`);
      }
      await expect(reveal).toHaveAttribute("data-scene", "panels", { timeout: 15_000 });
      await expect(page.locator(".ww-flip")).toHaveCount(4);
      await shot("16-reveal-panels");
      await page.getByTestId("skip-reveal").click();
      await expect(page.getByTestId("fair-results-screen")).toBeVisible();
      await shot("17-fair-results", true);
      await page.getByTestId("fair-exit").click();
      await finishWorkshopStories(page);
      await expect(page.getByTestId("rosette-rail")).toBeVisible();
      await page.getByTestId("rosette-rail").scrollIntoViewIfNeeded();
      await shot("18-rosette-rail");
    });
  });
}

test("a set on the floor survives a reload untouched", async ({ page }) => {
  const state = reduce(twoSetsOnFloor(), { type: "pickOpenHouse", setId: "set-2" });
  await openShowroomSave(page, state);
  await expect(page.getByTestId("floor-set-2")).toContainText("Goes home at Open House");
  expect(runOf(state).stage).toBe("done");
});
