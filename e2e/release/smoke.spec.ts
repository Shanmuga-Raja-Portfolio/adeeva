import { expect, test, type Page } from "@playwright/test";

async function fitsTheScreen(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

test("the studio opens, a game starts, and the family pages read well on this screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Welcome to Maker Studio" })).toBeVisible();
  await expect(page.locator("a[data-testid^='tile-']")).toHaveCount(7);
  expect(await fitsTheScreen(page)).toBe(true);

  await page.getByRole("link", { name: /Play ADEEVA/ }).click();
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByTestId("studio-home")).toBeVisible();

  await page.getByRole("link", { name: "About and privacy" }).click();
  const about = page.getByTestId("about-page");
  await expect(about.getByRole("heading", { level: 1 })).toHaveText("About Maker Studio and your privacy");
  await expect(about.locator("details[data-testid^='install-']")).toHaveCount(5);
  expect(await fitsTheScreen(page)).toBe(true);

  await page.getByRole("link", { name: "Back to the studio" }).click();
  await page.getByRole("link", { name: "Parent page" }).click();
  await expect(page.getByTestId("parent-page")).toBeVisible();
  expect(await fitsTheScreen(page)).toBe(true);
});
