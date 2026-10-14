import { expect, test } from "@playwright/test";
import { finishChefStories, stat, watchOutside } from "../fixtures/chefKitchen";
import { endDays, openChefSave, readyHeadChef, savedChef, versionOneSave } from "../fixtures/chefPaths";

test("an older head-chef save reaches the Crossroads, peeks once and runs a week at its own restaurant", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const outside = watchOutside(page);
  await openChefSave(page, versionOneSave(readyHeadChef("relaxed")));
  await expect(page.getByTestId("crossroads-card")).toContainText("holding the doors open");
  await page.getByTestId("end-day").click();
  await page.getByRole("button", { name: "Into the kitchen" }).click();
  await expect(page.getByRole("heading", { name: "Three Doors" })).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByTestId("kitchen-hub")).toBeVisible();

  await page.getByTestId("visit-crossroads").click();
  await expect(page.getByTestId("crossroads")).toBeVisible();
  await page.getByTestId("peek-restaurant").click();
  await expect(page.getByTestId("peek-banner")).toContainText("Your own dining room");
  await expect(page.locator(".ck-hub__content")).toHaveAttribute("inert", "");
  await page.getByTestId("peek-back").click();
  await expect(page.getByTestId("peek-restaurant")).toBeDisabled();
  await expect(page.getByTestId("peek-restaurant")).toHaveText("Peeked");

  await page.getByTestId("choose-restaurant").click();
  await expect(page.getByTestId("confirm-path")).toBeDisabled();
  await page.getByTestId("name-harbour-table").click();
  await page.getByTestId("confirm-path").click();
  await expect(page.getByRole("heading", { name: "Your Name Over the Door" })).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByRole("heading", { level: 1, name: "The Harbour Table" })).toBeVisible();
  expect(await stat(page, "stat-coins")).toBe(1500 - 450);

  await page.getByTestId("open-menu").click();
  await page.getByTestId("ask-hollis-menu").click();
  const firstPrice = page.locator("[data-testid^='price-']").first();
  await expect(firstPrice).toBeVisible();
  const before = await firstPrice.locator(".ck-price-row__amount").innerText();
  await firstPrice.getByRole("button", { name: /Raise the price/ }).click();
  await expect(firstPrice.locator(".ck-price-row__amount")).not.toHaveText(before);
  await page.getByTestId("menu-done").click();

  await page.getByTestId("open-team").click();
  await page.getByTestId("ask-hollis-team").click();
  const firstShift = page.locator("[data-testid^='shift-']").first();
  const pressed = await firstShift.getAttribute("aria-pressed");
  await firstShift.click();
  await expect(firstShift).not.toHaveAttribute("aria-pressed", pressed ?? "");
  await firstShift.click();
  await expect(firstShift).toHaveAttribute("aria-pressed", pressed ?? "");
  await page.getByTestId("team-done").click();

  await endDays(page, 1);
  await page.getByTestId("open-ready").click();
  await page.getByTestId("ask-hollis-ready").click();
  await page.getByTestId("ready-done").click();
  const beforeNight = await stat(page, "stat-coins");
  await page.getByTestId("open-night").click();
  await expect(page.getByTestId("service-rush")).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByTestId("ticket-rail").locator(".ck-slip")).toHaveCount(4);
  await page.getByTestId("team-finish").click();
  await expect(page.getByTestId("night-report")).toContainText("guests came in");
  await expect(page.getByTestId("night-report")).toContainText("Plates sold");
  await finishChefStories(page);
  await page.getByTestId("service-exit").click();
  await finishChefStories(page);
  await expect(page.getByTestId("path-hub")).toBeVisible();
  expect(await stat(page, "stat-coins")).not.toBe(beforeNight);
  await expect(page.getByTestId("reviews-wall")).toContainText("Kind guest notes");

  await endDays(page, 6);
  await expect(page.getByTestId("week-money").nth(1)).toContainText("Plates sold");
  const coins = await stat(page, "stat-coins");
  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishChefStories(page);
  await expect(page.getByRole("heading", { level: 1, name: "The Harbour Table" })).toBeVisible();
  expect(await stat(page, "stat-coins")).toBe(coins);
  expect(await savedChef(page, (state) => [state.schemaVersion, state.path?.kind])).toEqual([
    2,
    "restaurant",
  ]);
  expect(outside).toEqual([]);
});
