import { expect, test, type Page } from "@playwright/test";
import { finishJewelleryStories } from "../fixtures/jewelleryBench";
import { endLoftDay } from "../fixtures/loftBench";
import { isOutsideRequest } from "../fixtures/outsideRequest";
import { lanternNight, openPreparedJewellery } from "../fixtures/preparedJewellery";
import { holdShowTime, playToScene, playWithinScene, releaseShowTime } from "../fixtures/showTime";

async function planTheLaunch(page: Page): Promise<void> {
  await page.getByTestId("open-launch").click();
  await expect(page.getByTestId("launch-board")).toBeVisible();
  await expect(page.getByTestId("launch-piece-0")).toBeVisible();
  await page.getByTestId("to-planner").click();
  await expect(page.getByTestId("stage-launch")).toBeDisabled();
  await page.getByTestId("lantern-amber").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("lantern-rose")).toHaveAttribute("aria-checked", "true");
  await page.getByTestId("music-beach-pop").click();
  await page.getByTestId("story-card-0").click();
  await page
    .getByRole("button", { name: /^Show .* earlier$/ })
    .last()
    .click();
  await page.clock.install();
  await holdShowTime(page);
  await page.getByTestId("stage-launch").click();
}

async function slideDuringReveal(page: Page, reveal: string): Promise<void> {
  const slide = page.getByTestId("lantern-slide");
  await playWithinScene(page, "lantern-launch", reveal, () => slide.isVisible());
  await expect(page.getByTestId("lantern-launch")).toHaveAttribute("data-scene", reveal);
  await expect(slide).toBeVisible();
}

test("Lantern Night in motion: keyboard lids, one advance for a double tap, skip, results, the Pop-up and a copy request", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const outside: string[] = [];
  page.on("request", (request) => {
    if (isOutsideRequest(request.url())) outside.push(request.url());
  });
  await openPreparedJewellery(page, lanternNight());
  await expect(page.getByTestId("day-note")).toContainText("Lantern Night");
  await planTheLaunch(page);

  const show = page.getByTestId("lantern-launch");
  await expect(show).toHaveAttribute("data-scene", "title");
  await expect(page.getByTestId("skip-launch")).toHaveCount(0);
  await playToScene(page, "lantern-launch", "wait-1");
  await expect(page.getByTestId("open-lid")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(show).toHaveAttribute("data-scene", "reveal-1");
  await slideDuringReveal(page, "reveal-1");
  await playToScene(page, "lantern-launch", "wait-2");
  await page.evaluate(() => {
    const lid = document.querySelector<HTMLButtonElement>("[data-testid='open-lid']");
    const box = document.querySelector<HTMLButtonElement>("[data-testid='music-box']");
    lid?.click();
    box?.click();
  });
  await expect(show).toHaveAttribute("data-scene", "reveal-2");
  await expect(page.getByTestId("skip-launch")).toBeVisible();
  await page.keyboard.press("Escape");

  const results = page.getByTestId("launch-results");
  await expect(results).toBeVisible();
  await releaseShowTime(page);
  await expect(results.getByTestId("panel-craft")).toBeVisible();
  await expect(results.getByTestId("panel-story")).toBeVisible();
  await expect(page.getByTestId("launch-totals")).toContainText("rep");
  await page.getByTestId("launch-exit").click();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("step-launch")).toContainText("Launched");
  await expect(page.getByTestId("garland-card")).toContainText("1 of 8 lit");

  await endLoftDay(page);
  await expect(page.getByTestId("day-note")).toContainText("Pop-up Day");
  await page.getByTestId("open-popup").click();
  await expect(page.getByTestId("popup-window")).toBeVisible();
  await page.getByTestId("plinth-1").click();
  await expect(page.getByTestId("plinth-1")).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("plinth-1")).toHaveAttribute("aria-checked", "false");
  await page.getByTestId("plinth-1").click();
  await expect(page.getByTestId("plinth-1")).toHaveAttribute("aria-checked", "true");
  const hearts = Number((await page.getByTestId("hearts-1").innerText()).replace(/\D/g, ""));
  expect(hearts).toBeGreaterThanOrEqual(2);
  for (let slot = 0; slot < 3; slot += 1) await page.getByTestId(`tag-${slot}-gentle`).click();
  await expect(page.getByTestId("sells-0")).toHaveText("sells");
  await page.getByTestId("tag-1-special").click();
  await page.getByTestId("open-window").click();
  await expect(page.getByTestId("popup-stroll")).toBeVisible();
  await page.getByTestId("skip-stroll").click();
  await expect(page.getByTestId("popup-results")).toBeVisible();
  await expect(page.getByTestId("copy-requests")).toBeVisible();
  const visitor = (
    (await page.getByTestId("copy-requests").locator("li").first().innerText()).split(" would")[0] ?? ""
  ).trim();
  await page.getByTestId("popup-exit").click();
  await finishJewelleryStories(page);

  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("step-popup")).toContainText("found homes");
  await endLoftDay(page);
  await expect(page.locator(".jb-cork")).toContainText(visitor);
  expect(outside).toEqual([]);
});

test("Lantern Night in reduced motion shows every beat as stills with the same taps", async ({ page }) => {
  test.setTimeout(240_000);
  await openPreparedJewellery(page, lanternNight({ seed: 43 }));
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("switch", { name: "Reduce motion" }).click();
  await page.getByRole("button", { name: "Done" }).click();
  await planTheLaunch(page);
  const show = page.getByTestId("lantern-launch");
  await expect(show).toHaveClass(/jb-launch-reveal--still/);
  for (let piece = 1; piece <= 3; piece += 1) {
    await playToScene(page, "lantern-launch", `wait-${piece}`);
    await page.getByTestId("open-lid").press("Space");
    await expect(show).toHaveAttribute("data-scene", `reveal-${piece}`);
    await slideDuringReveal(page, `reveal-${piece}`);
  }
  await playToScene(page, "lantern-launch", "finale");
  await expect(page.getByTestId("light-thread")).toBeVisible();
  await expect(page.locator(".jb-launch-reveal__award")).toContainText("lantern glows");
  await playToScene(page, "lantern-launch", "panels");
  await releaseShowTime(page);
  await expect(page.getByTestId("launch-results")).toBeVisible({ timeout: 20_000 });
});

test("End Day on Lantern Night asks to stage the Launch first", async ({ page }) => {
  test.setTimeout(180_000);
  await openPreparedJewellery(page, lanternNight());
  await expect(page.getByTestId("day-note")).toContainText("Lantern Night");
  await page.getByTestId("end-day").click();
  const dialog = page.getByRole("dialog", { name: "The lanterns are lit tonight!" });
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("night-stage-first")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("day-note")).toContainText("Lantern Night");
  await page.getByTestId("end-day").click();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("launch-board")).toBeVisible();
  await page.getByTestId("loft-exit").click();
  await page.getByTestId("end-day").click();
  await page.getByTestId("night-end-anyway").click();
  await page.locator(".jb-night").getByRole("button", { name: "Open the bench" }).click();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("day-note")).toContainText("Pop-up Day");
  await expect(page.getByRole("dialog", { name: "The lanterns are lit tonight!" })).toBeHidden();
});
