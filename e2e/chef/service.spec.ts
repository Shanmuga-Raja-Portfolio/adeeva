import { expect, test } from "@playwright/test";
import { finishChefStories, freshChef, newChef, stat, watchOutside } from "../fixtures/chefKitchen";

const MENU = [
  "dal-tadka",
  "jollof-rice",
  "kelewele",
  "spaghetti-al-pomodoro",
  "elote",
  "omelette-aux-fines-herbes",
];

test("a head chef writes the menu, pauses a service and lets the team finish kindly", async ({ page }) => {
  test.setTimeout(120_000);
  const outside = watchOutside(page);
  await freshChef(page);
  await newChef(page, "Head Chef", "Relaxed");
  await expect(page.getByRole("heading", { level: 1, name: "Head Chef" })).toBeVisible();

  await page.getByTestId("write-menu").click();
  for (const id of MENU) await page.getByTestId(`dish-${id}`).click();
  await page.getByTestId("confirm-dishes").click();
  await finishChefStories(page);

  await page.getByTestId("pick-shift").click();
  await expect(page.getByTestId("start-service")).toBeDisabled();
  await page.locator(".ck-helper").nth(0).click();
  await page.locator(".ck-helper").nth(2).click();
  const coins = await stat(page, "stat-coins");
  await page.getByTestId("start-service").click();
  await expect(page.getByTestId("service-rush")).toBeVisible();
  await expect(page.locator(".ck-story")).toBeVisible();
  await finishChefStories(page);

  await expect(page.getByTestId("ticket-rail").locator(".ck-slip")).toHaveCount(4);
  await page.getByTestId("service-pause").click();
  await expect(page.getByTestId("paused")).toBeVisible();
  await page.getByTestId("service-pause").click();
  await expect(page.getByTestId("paused")).toHaveCount(0);

  await page.getByTestId("team-finish").click();
  await expect(page.getByTestId("service-results")).toBeVisible();
  await expect(page.getByTestId("service-results")).toContainText("The team carried tonight");
  await expect(page.getByTestId("service-results")).toContainText("Wage for the shift");
  await finishChefStories(page);
  await page.getByTestId("service-exit").click();
  await finishChefStories(page);
  await expect(page.getByTestId("kitchen-hub")).toBeVisible();
  expect(await stat(page, "stat-coins")).toBeGreaterThan(coins);
  expect(outside).toEqual([]);
});
