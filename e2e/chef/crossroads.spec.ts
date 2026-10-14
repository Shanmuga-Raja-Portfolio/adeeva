import { expect, test } from "@playwright/test";
import { serialize } from "../../src/games/chef/core";
import { finishChefStories, watchOutside } from "../fixtures/chefKitchen";
import { openChefSave, readyHeadChef, savedChef } from "../fixtures/chefPaths";

test("the Crossroads shows this difficulty's rent, keeps a peek until it ends, and works by keyboard", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const outside = watchOutside(page);
  await openChefSave(page, serialize(readyHeadChef("challenging")));
  await finishChefStories(page);
  await page.getByTestId("visit-crossroads").click();
  await expect(page.getByTestId("crossroads")).toBeVisible();
  await expect(page.getByTestId("door-restaurant")).toContainText("Rent 450 a week");
  await expect(page.getByTestId("door-truck")).toContainText("Parking 90 a week");
  await expect(page.getByTestId("door-tv")).toContainText("Rent 225 a week");

  await page.getByTestId("peek-tv").click();
  await expect(page.getByTestId("peek-back")).toBeFocused();
  expect(await savedChef(page, (state) => state.peeked)).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishChefStories(page);
  await page.getByTestId("visit-crossroads").click();
  await expect(page.getByTestId("peek-tv")).toBeEnabled();

  await page.getByTestId("peek-tv").click();
  await page.getByTestId("peek-back").click();
  await expect(page.getByTestId("peek-tv")).toBeDisabled();
  await expect(page.getByTestId("choose-tv")).toBeFocused();
  await expect.poll(() => savedChef(page, (state) => state.peeked)).toEqual(["tv"]);

  await page.getByTestId("choose-restaurant").click();
  const cards = page.locator(".ck-name-cards [role='radio']");
  await expect(page.locator(".ck-name-cards [tabindex='0']")).toHaveCount(1);
  await cards.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(cards.nth(1)).toHaveAttribute("aria-checked", "true");
  await expect(cards.nth(1)).toBeFocused();
  await expect(page.getByTestId("confirm-path")).toBeEnabled();
  await page.keyboard.press("ArrowLeft");
  await expect(cards.first()).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("confirm-path")).toHaveCount(0);
  expect(outside).toEqual([]);
});

test("Relaxed doors say there is no rent to pay", async ({ page }) => {
  await openChefSave(page, serialize(readyHeadChef("relaxed")));
  await finishChefStories(page);
  await page.getByTestId("visit-crossroads").click();
  await expect(page.getByTestId("door-restaurant")).toContainText("No rent to pay on this difficulty");
  await expect(page.getByTestId("door-truck")).toContainText("No parking to pay on this difficulty");
});
