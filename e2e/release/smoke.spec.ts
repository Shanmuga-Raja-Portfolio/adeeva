import { expect, test, type Page } from "@playwright/test";
import { finishStories } from "../fixtures/story";

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

test("a new game opens its hub at the top, and the hub and chef's steps fit this screen", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByTestId("tile-thrift-flip").click();
  await page.getByRole("button", { name: "New Game" }).click();
  await page.getByLabel("Name").fill("Juniper");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Dreamer" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Market Stall Remaker" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  await page.getByRole("button", { name: "Open the stall" }).click();
  await finishStories(page);
  await expect(page.getByTestId("stall-hub")).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await fitsTheScreen(page)).toBe(true);

  await page.getByTestId("save-exit").click();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await page.getByTestId("tile-chef").click();
  await page.getByRole("button", { name: "New Game" }).click();
  await expect(page.getByRole("heading", { name: "Who's joining the kitchen?" })).toBeVisible();
  expect(await fitsTheScreen(page)).toBe(true);
});
