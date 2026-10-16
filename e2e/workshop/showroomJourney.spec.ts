import { expect, test, type Page } from "@playwright/test";
import { depthShooter } from "../fixtures/depthShots";
import { isOutsideRequest } from "../fixtures/outsideRequest";
import {
  joinRestWithMagnet,
  placeOnePartByHand,
  sawOneLineByHand,
  sawRestOnRail,
} from "../fixtures/setBench";
import { endShopDay, openRawSave, thresholdV1 } from "../fixtures/showroomSaves";
import {
  advance,
  centreOf,
  coinsOf,
  drag,
  finishWorkshopStories,
  scrollToTop,
} from "../fixtures/workshopPage";

async function storiesUntil(page: Page, title: string) {
  const story = page.locator(".ww-story");
  for (let step = 0; step < 40; step += 1) {
    if ((await page.getByRole("heading", { name: title }).count()) > 0) break;
    await expect(story).toBeVisible();
    await story.locator(".ww-story__footer button").first().click();
  }
  for (let step = 0; step < 10; step += 1) {
    if ((await page.getByTestId("story-choice-later").count()) > 0) return;
    await story.getByRole("button", { name: /Tap to continue/ }).click();
  }
}

async function dayOf(page: Page): Promise<number> {
  return Number(
    (await page.getByTestId("stat-day").innerText())
      .replace(/[^0-9]/g, " ")
      .trim()
      .split(/\s+/)[0],
  );
}

async function endDaysUntil(page: Page, day: number) {
  for (let guard = 0; guard < 30 && (await dayOf(page)) < day; guard += 1) await endShopDay(page);
  expect(await dayOf(page)).toBe(day);
}

test.describe("the showroom journey", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("from the unlock threshold to a Fair rosette, saved and continued", async ({ page }, testInfo) => {
    test.setTimeout(420_000);
    const shot = depthShooter(page, testInfo, "journey");
    const outside: string[] = [];
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });
    page.on("request", (request) => {
      if (isOutsideRequest(request.url())) outside.push(request.url());
    });

    await openRawSave(page, thresholdV1());
    await finishWorkshopStories(page);
    await expect(page.getByTestId("workshop-hub")).toBeVisible();
    expect(await dayOf(page)).toBe(15);
    await page.getByTestId("end-day").click();
    await page.getByRole("button", { name: "Open the garage" }).click();
    await storiesUntil(page, "A Second Key");
    await expect(page.getByTestId("story-choice-later")).toBeVisible();
    await shot("01-offer");
    await page.getByTestId("story-choice-open").click();
    await finishWorkshopStories(page);
    await expect(page.getByTestId("season-ribbon")).toContainText("Season 1 starts on day 22");
    await shot("02-showroom-opened");

    await endDaysUntil(page, 22);
    await page.getByRole("button", { name: "Choose Orchard Picnic" }).click();
    await page.getByTestId("take-ren-on").click();
    await expect(page.getByTestId("ren-card")).toContainText("jobs left today");
    await shot("03-season-one", true);

    await page.getByTestId("start-set-reading-corner").click();
    await expect(page.getByRole("heading", { name: "Hattie's set card" })).toBeVisible();
    await shot("04-set-card");
    await advance(page);
    await page.getByRole("radio", { name: /Rounded corners/ }).click();
    await page.getByRole("radio", { name: /Straight legs/ }).click();
    await page.getByRole("radio", { name: /Heart cut-out/ }).click();
    await page.getByTestId("wood-pine").click();
    await page.getByTestId("set-joint-peg").click();
    await scrollToTop(page);
    await shot("05-set-design");
    await advance(page);

    await page.getByTestId("buy-plan").click();
    await expect(page.getByText(/On your rack: \d+ boards of Pine/)).toBeVisible();
    await advance(page);

    await placeOnePartByHand(page, "0:side-1");
    await page.getByTestId("plan-the-rest").click();
    await expect(page.getByText("The tray is empty. Every part is on a board!")).toBeVisible();
    await scrollToTop(page);
    await shot("06-set-layout");
    await advance(page);

    await sawOneLineByHand(page);
    await shot("07-set-saw");
    await sawRestOnRail(page);
    await advance(page);

    await page.getByTestId("ren-pegs").click();
    await expect(page.getByTestId("ren-scene")).toBeVisible();
    await expect(page.getByText(/Ren tapped it home/).first()).toBeVisible();
    await shot("08-set-join-ren");
    await joinRestWithMagnet(page, 3);
    await advance(page);

    await page.getByTestId("ren-sand").click();
    await expect(page.getByTestId("shine-bar")).toBeVisible();
    await expect(page.getByText(/Ren sanded/)).toBeVisible();
    await shot("09-set-sand");
    await advance(page);

    await page.getByTestId("finish-clear-oil").click();
    await scrollToTop(page);
    const canvasBox = await page.getByTestId("finish-canvas").boundingBox();
    if (canvasBox === null) throw new Error("No piece to decorate");
    await drag(
      page,
      await centreOf(page.getByTestId("extra-wood-knob")),
      [canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height * 0.5],
      20,
    );
    await expect(page.getByTestId("placed-wood-knob")).toHaveCount(1);
    await page.getByTestId("piece-1").click();
    await page.getByTestId("extra-wood-knob").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("placed-wood-knob")).toHaveCount(1);
    await shot("10-set-finish");
    await advance(page);

    await expect(page.getByRole("heading", { name: "Ready for the floor" })).toBeVisible();
    await shot("11-set-review");
    await page.getByTestId("finish-set").click();
    await expect(page.getByTestId("set-results")).toBeVisible();
    await shot("12-set-results");
    await page.getByTestId("results-exit").click();
    await finishWorkshopStories(page);
    await expect(page.getByTestId("floor-set-1")).toBeVisible();
    await page.getByTestId("floor-set-1").getByRole("radio", { name: "Keep on show" }).click();

    await endDaysUntil(page, 34);
    await expect(page.getByTestId("floor-set-1")).toBeVisible();
    await expect(page.getByTestId("season-ribbon")).toContainText("Fair Day is today!");
    const before = await coinsOf(page, "stat-coins");
    await page.getByTestId("go-to-fair").click();
    await expect(page.getByTestId("fair-board")).toBeVisible();
    await expect(page.getByText("Bram's pick")).toBeVisible();
    await shot("13-fair-board");
    await page.getByTestId("fair-board-next").click();
    await expect(page.getByTestId("fair-planner")).toBeVisible();
    await page.getByTestId("backdrop-bunting").click();
    await page.getByTestId("music-fiddle-folk").click();
    await page
      .getByRole("button", { name: /Show .* earlier/ })
      .last()
      .click();
    await shot("14-fair-planner");
    await page.getByTestId("open-booth").click();

    await expect(page.getByTestId("booth-reveal")).toBeVisible();
    const lift = page.getByTestId("lift-sheet");
    await expect(lift).toBeVisible({ timeout: 15_000 });
    await shot("15-reveal-sheet");
    await lift.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("booth-reveal")).toHaveAttribute("data-scene", "lift-1");
    await expect(page.getByTestId("dust-sheet")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("dust-sheet").click();
    await expect(page.getByTestId("booth-reveal")).toHaveAttribute("data-scene", /finale|panels/, {
      timeout: 15_000,
    });
    await shot("16-reveal-finale");
    await page.getByTestId("skip-reveal").click();

    await expect(page.getByTestId("fair-results-screen")).toBeVisible();
    await expect(page.locator(".ad-jury")).toHaveCount(4);
    await expect(page.getByRole("heading", { level: 1, name: /Rosette!|Ribbon/ })).toBeVisible();
    await shot("17-fair-results", true);
    await page.getByTestId("fair-exit").click();
    await finishWorkshopStories(page);
    await expect(page.getByTestId("workshop-hub")).toBeVisible();
    const after = await coinsOf(page, "stat-coins");
    expect(after).toBeGreaterThan(before);
    await expect(page.locator(".ww-rail-hooks__hook--won")).toHaveCount(1);

    await page.getByRole("button", { name: "Save & exit" }).click();
    await page.reload();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await finishWorkshopStories(page);
    await expect(page.getByTestId("workshop-hub")).toBeVisible();
    expect(await coinsOf(page, "stat-coins")).toBe(after);
    await expect(page.locator(".ww-rail-hooks__hook--won")).toHaveCount(1);
    await expect(page.getByTestId("season-card")).toBeVisible();
    await shot("18-hub-after", true);
    expect(problems).toEqual([]);
    expect(outside).toEqual([]);
  });
});
