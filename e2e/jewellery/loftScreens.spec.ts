import { expect, test } from "@playwright/test";
import { depthShooter } from "../fixtures/depthShots";
import { finishJewelleryStories, freshJewellery } from "../fixtures/jewelleryBench";
import {
  boardedLoft,
  lanternNight,
  madeLine,
  openPreparedJewellery,
  openRawJewellery,
  popupDay,
  themedLoft,
  v1Save,
} from "../fixtures/preparedJewellery";
import { countUpsShown } from "../fixtures/settle";
import { holdShowTime, playFor, playToScene, playWithinScene, releaseShowTime } from "../fixtures/showTime";

const VIEWPORTS = [
  { width: 1280, height: 800 },
  { width: 820, height: 1180 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`loft screens at ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    test("start here as a Collection Designer with a line name", async ({ page }, info) => {
      const shot = depthShooter(page, info, `jb-${viewport.width}`);
      await freshJewellery(page);
      await page.getByRole("button", { name: "New Game" }).click();
      await page.getByLabel("Name").fill("Noor");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Dreamer" }).click();
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Your Own Collection" }).click();
      await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
      await page.getByRole("radio", { name: "Velvet Comet" }).click();
      await shot("01-career-step", true);
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Standard" }).click();
      await page.getByRole("button", { name: "Open the Lantern Loft" }).click();
      await expect(page.getByRole("heading", { name: "Lanterns Up High" })).toBeVisible();
      await shot("02-intro-loft");
      await finishJewelleryStories(page);
      await expect(page.getByTestId("season-ribbon")).toContainText("Season 1");
      await expect(page.getByTestId("theme-card")).toBeVisible();
      await shot("03-loft-hub", true);
      await page.getByTestId("bench-tour-yes").click();
      await expect(page.getByTestId("bench-tour-yes")).toHaveCount(0);
    });

    test("the Collection Board, the Gem Market and a line piece's bench", async ({ page }, info) => {
      const shot = depthShooter(page, info, `jb-${viewport.width}`);
      await openPreparedJewellery(page, themedLoft());
      await page.getByTestId("open-board").click();
      await expect(page.getByTestId("collection-board")).toBeVisible();
      await page.getByTestId("board-product-stone-pendant").click();
      await page.getByTestId("board-product-drop-pair").click();
      await page.getByTestId("board-product-bangle").click();
      await page.getByRole("radio", { name: "Leaf" }).click();
      await page.getByRole("radio", { name: /^Silver/ }).click();
      await page.getByRole("radio", { name: /^High Shine/ }).click();
      await page.getByRole("radiogroup", { name: "Hero stone" }).getByRole("radio").first().click();
      await shot("04-collection-board", true);
      await page.getByTestId("confirm-board").click();
      await finishJewelleryStories(page);
      await page.getByTestId("open-gems").click();
      await expect(page.getByTestId("gem-market")).toBeVisible();
      await shot("05-gem-market", true);
    });

    test("the hub tray, the Lookbook and its album", async ({ page }, info) => {
      const shot = depthShooter(page, info, `jb-${viewport.width}`);
      await openPreparedJewellery(page, madeLine());
      await expect(page.getByTestId("line-card")).toBeVisible();
      await shot("06-line-tray", true);
      await page.getByTestId("open-lookbook").click();
      await expect(page.getByTestId("lookbook")).toBeVisible();
      await page.getByTestId("prop-sea-shell").click();
      await page.getByTestId("prop-pressed-flower").click();
      await shot("07-lookbook", true);
      const lamp = page.getByTestId("lamp-knob");
      for (let page_ = 0; page_ < 3; page_ += 1) {
        await page.getByTestId(`page-tab-${page_}`).click();
        await lamp.focus();
        for (let step = 0; step < 6; step += 1) await page.keyboard.press("ArrowRight");
        await page.getByTestId("snap-page").click();
      }
      await page.getByTestId("close-lookbook").click();
      await finishJewelleryStories(page);
      await expect(page.getByTestId("lookbook-album")).toBeVisible();
      await shot("07b-lookbook-album", true);
    });

    test("the loft offer and its card", async ({ page }, info) => {
      const shot = depthShooter(page, info, `jb-${viewport.width}`);
      await openRawJewellery(page, v1Save("threshold"));
      await finishJewelleryStories(page);
      await page.getByTestId("end-day").click();
      await page.locator(".jb-night").getByRole("button", { name: "Open the bench" }).click();
      const story = page.locator(".jb-story");
      for (let step = 0; step < 40 && (await page.getByTestId("story-choice-later").count()) === 0; step += 1)
        await story.locator(".jb-story__footer button").first().click();
      await story.getByTestId("line-name-moon-and-thimble").click();
      await expect(story.getByTestId("story-rent-note")).toHaveText(
        /Bench and loft rent: \d+ coins a week \(bench only: \d+\)\./,
      );
      await shot("17-loft-offer");
      await page.getByTestId("story-choice-later").click();
      await finishJewelleryStories(page);
      await expect(page.getByTestId("loft-offer-card")).toBeVisible();
      await expect(page.getByTestId("loft-rent-note")).toContainText("coins a week (bench only:");
      await page.getByTestId("loft-offer-card").scrollIntoViewIfNeeded();
      await shot("18-loft-offer-card");
    });

    test("Lantern Night: board, planner, reveal, results", async ({ page }, info) => {
      const shot = depthShooter(page, info, `jb-${viewport.width}`);
      await openPreparedJewellery(page, lanternNight());
      await shot("08-lantern-night-hub", true);
      await page.getByTestId("open-launch").click();
      await expect(page.getByTestId("launch-board")).toBeVisible();
      await shot("09-launch-board", true);
      await page.getByTestId("to-planner").click();
      await page.getByTestId("lantern-rose").click();
      await page.getByTestId("music-beach-pop").click();
      await page.getByTestId("story-card-0").click();
      await shot("10-launch-planner", true);
      await page.clock.install();
      await holdShowTime(page);
      await page.getByTestId("stage-launch").click();
      const show = page.getByTestId("lantern-launch");
      await playToScene(page, "lantern-launch", "wait-1");
      await shot("11-launch-wait");
      await page.getByTestId("open-lid").click();
      await expect(show).toHaveAttribute("data-scene", "reveal-1");
      await playFor(page, 900);
      await expect(show).toHaveAttribute("data-scene", "reveal-1");
      await shot("12-launch-reveal");
      await playToScene(page, "lantern-launch", "finale");
      await expect(page.locator(".jb-launch-reveal__paper-lantern").first()).toHaveCSS(
        "position",
        "absolute",
      );
      await playFor(page, 2600);
      await expect(show).toHaveAttribute("data-scene", "finale");
      await shot("12b-launch-finale");
      await playToScene(page, "lantern-launch", "panels");
      await playWithinScene(page, "lantern-launch", "panels", () => countUpsShown(page));
      await expect(show).toHaveAttribute("data-scene", "panels");
      await shot("12c-launch-panels");
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("launch-results")).toBeVisible();
      await releaseShowTime(page);
      await expect(page.locator("#jb-launch-results-title")).toBeFocused();
      await shot("13-launch-results", true);
    });

    test("the Pop-up Window", async ({ page }, info) => {
      const shot = depthShooter(page, info, `jb-${viewport.width}`);
      await openPreparedJewellery(page, popupDay());
      await page.getByTestId("open-popup").click();
      await expect(page.getByTestId("popup-window")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Pop-up Window" })).toBeFocused();
      await shot("14-popup-window", true);
      await page.clock.install();
      await holdShowTime(page);
      await page.getByTestId("open-window").click();
      await expect(page.getByTestId("popup-stroll")).toBeVisible();
      await expect(page.getByTestId("skip-stroll")).toBeFocused();
      await playFor(page, 1500);
      await shot("15-popup-stroll");
      await expect(page.getByTestId("skip-stroll")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("popup-results")).toBeVisible();
      await releaseShowTime(page);
      await expect(page.locator("#jb-popup-results-title")).toBeFocused();
      await shot("16-popup-results", true);
      await page.getByTestId("popup-exit").click();
      await finishJewelleryStories(page);
      await expect(page.getByText("The window is open!")).toHaveCount(0);
      await expect(page.getByTestId("step-pieces")).toContainText("3 of 3 made for the Launch");
      await expect(page.getByTestId("step-pieces")).toHaveClass(/jb-line-step--done/);
      for (let slot = 0; slot < 3; slot += 1)
        await expect(page.getByTestId(`line-slot-${slot}`)).toContainText(/Found a home|In the Line Drawer/);
      await expect(page.getByTestId("line-card")).not.toContainText("next season");
    });

    test("closing the Lookbook with unsnapped pages asks first", async ({ page }) => {
      await openPreparedJewellery(page, madeLine());
      await page.getByTestId("open-lookbook").click();
      await expect(page.getByTestId("lookbook")).toBeVisible();
      await page.getByTestId("lamp-knob").focus();
      for (let step = 0; step < 4; step += 1) await page.keyboard.press("ArrowRight");
      await page.getByTestId("snap-page").click();
      await expect(page.getByTestId("unsnapped-note")).toHaveText("2 pages aren't snapped yet.");
      await page.getByTestId("close-lookbook").click();
      const dialog = page.getByRole("dialog", { name: "Close the Lookbook now?" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Keep snapping" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(dialog).toBeHidden();
      await expect(page.getByTestId("lookbook")).toBeVisible();
      await page.getByTestId("close-lookbook").click();
      await page.getByTestId("confirm-close-lookbook").click();
      await finishJewelleryStories(page);
      await expect(page.getByTestId("lookbook-album")).toBeVisible();
      await expect(page.getByTestId("lookbook-album")).toContainText("A missing page");
    });

    test("a confirmed line's gem tray", async ({ page }) => {
      await openPreparedJewellery(page, boardedLoft());
      await page.getByTestId("open-gems").click();
      await expect(page.getByTestId("gem-tray").getByRole("button")).toHaveCount(16);
    });
  });
}
