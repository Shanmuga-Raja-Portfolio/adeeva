import { expect, test } from "@playwright/test";
import {
  advance,
  edgeByHand,
  finishInteriorStories,
  layFloorByHand,
  watchOutsideRequests,
} from "../fixtures/interiorStudio";
import { serialize } from "../../src/games/interior/core";
import {
  loadSave,
  openPreparedHome,
  plannedHome,
  showHomeStart,
  thresholdRoomAtFloor,
} from "../fixtures/preparedLarkspur";

test("where floors meet: the hall floor comes first and a wrong-floor pick is explained", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const outside = watchOutsideRequests(page);
  await openPreparedHome(page, thresholdRoomAtFloor());
  await page.getByTestId("open-room-1").click();
  await expect(page.getByRole("heading", { name: "Lay the floor" })).toBeVisible();
  await expect(page.locator(".is-floor__hint")).toContainText("Hall floor first, then the room's floor.");
  await page.locator("[data-testid^='floor-candidate-']:not([data-testid$='-hall'])").first().click();
  await expect(page.locator(".is-floor__hint")).toContainText("That piece belongs to the other floor.");
  await layFloorByHand(page, 6);
  await advance(page);
  await expect(page.getByRole("heading", { name: "Light it up" })).toBeVisible();
  expect(outside).toEqual([]);
});

test("the map refuses a room that is too big for a space, and the crew copies a demo", async ({ page }) => {
  test.setTimeout(180_000);
  await loadSave(page, serialize(showHomeStart()));
  await finishInteriorStories(page);
  await page.locator("[data-testid^='start-']").first().click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await finishInteriorStories(page);
  await page.getByTestId("purpose-living").click();
  await page.getByTestId("space-0").click();
  await expect(page.getByTestId("map-hint")).toContainText("That space is too small for a Living Room.");
  await expect(page.getByTestId("space-0")).toContainText("Drop a room here");

  await openPreparedHome(page, plannedHome());
  await page.getByTestId("coach-paint").click();
  await expect(page.getByTestId("coach-dialog-paint")).toBeVisible();
  await edgeByHand(page, "coach-tape");
  await finishInteriorStories(page);
  await expect(page.getByTestId("coach-paint")).toContainText("✓");
  await page.getByTestId("coach-floor").click();
  for (let piece = 0; piece < 3; piece += 1) {
    await page.getByTestId("coach-floor-piece").focus();
    for (const step of ["ArrowLeft", "ArrowLeft", "ArrowLeft", "ArrowLeft", "ArrowLeft", "ArrowLeft"])
      await page.keyboard.press(step);
    for (const step of ["ArrowUp", "ArrowUp", "ArrowUp"]) await page.keyboard.press(step);
    await page.keyboard.press("Enter");
  }
  await page.getByTestId("coach-floor-done").click();
  await expect(page.getByTestId("coach-floor")).toContainText("✓");
});
