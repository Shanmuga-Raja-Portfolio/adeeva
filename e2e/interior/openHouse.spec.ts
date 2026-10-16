import { expect, test, type Page } from "@playwright/test";
import { finishInteriorStories, watchOutsideRequests } from "../fixtures/interiorStudio";
import { openHouseReady, openPreparedHome } from "../fixtures/preparedLarkspur";

async function planWithKeys(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Plan the Open House" })).toBeVisible();
  await page.getByTestId("tour-list").getByRole("button", { name: /later/ }).first().focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("music-choice").getByRole("radio").first().focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("music-choice").getByRole("radio", { name: /Beach Pop/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByTestId("time-choice").getByRole("radio").first().focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("time-choice").getByRole("radio", { name: /Evening/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByTestId("set-plan").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("doors-card")).toBeVisible();
}

test("the planner works by keyboard and the Open House plays, skips and hangs its key", async ({ page }) => {
  test.setTimeout(180_000);
  const outside = watchOutsideRequests(page);
  await openPreparedHome(page, openHouseReady());
  await planWithKeys(page);
  await page.getByTestId("open-doors").focus();
  await page.keyboard.press("Enter");
  const show = page.getByTestId("open-house-show");
  await expect(show).toBeVisible();
  await expect(page.getByTestId("skip-show")).toHaveCount(0);
  await expect(show).toHaveAttribute("data-scene", "walk-2", { timeout: 30_000 });
  await expect(page.getByTestId("story-bubble")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("skip-show")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("open-house-results")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  for (const id of ["flow", "light", "comfort", "story"])
    await expect(page.getByTestId(`panel-${id}`)).toBeVisible();
  await page.getByTestId("replay-show").click();
  await expect(show).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("open-house-results")).toBeVisible();
  await page.getByTestId("results-exit").click();
  await finishInteriorStories(page);
  await expect(page.getByTestId("hook-garden-flat")).not.toContainText("Waiting");
  expect(outside).toEqual([]);
});

test("with reduced motion the Open House shows calm stills with the same Skip", async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPreparedHome(page, openHouseReady());
  await page.getByTestId("achebe-plan").click();
  await page.getByTestId("set-plan").click();
  await page.getByTestId("open-doors").click();
  const show = page.getByTestId("open-house-show");
  await expect(show).toBeVisible();
  await expect(show).toHaveAttribute("data-scene", "walk-1", { timeout: 15_000 });
  await expect(page.getByTestId("home-strip")).toBeVisible();
  await expect(show).toHaveAttribute("data-scene", "finale", { timeout: 20_000 });
  await page.getByTestId("skip-show").click();
  await expect(page.getByTestId("open-house-results")).toBeVisible();
  await expect(page.getByTestId("open-house-prize")).toContainText("second half");
});
