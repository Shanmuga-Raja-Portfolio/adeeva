import { expect, test } from "@playwright/test";
import {
  advance,
  chopByHand,
  dragOnto,
  finishChefStories,
  freshChef,
  newChef,
  plateByHand,
  simmerByHand,
  sizzleByHand,
  stat,
  tasteByHand,
  watchOutside,
} from "../fixtures/chefKitchen";

test("a new student cooks Chef Arjun's dal through every station by hand, then saves and continues", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const outside = watchOutside(page);
  await freshChef(page);
  await newChef(page, "Cookery Student", "Standard");
  await expect(page.getByTestId("coach-bubble")).toContainText("class board");
  const startCoins = await stat(page, "stat-coins");
  expect(startCoins).toBe(60);

  await page.getByTestId("start-lesson").click();
  await expect(page.locator(".ck-story")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your First Ticket" })).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByRole("heading", { level: 1, name: "Dal tadka" })).toBeVisible();
  await advance(page);

  await expect(page.getByRole("heading", { name: "Mise en place" })).toBeVisible();
  const tiles = page.locator("[data-testid^='tile-']");
  while ((await tiles.count()) > 0) await dragOnto(page, tiles.first(), page.getByTestId("mise-bowls"));
  await advance(page);

  await expect(page.getByRole("heading", { name: "The Board" })).toBeVisible();
  await chopByHand(page);

  await expect(page.getByRole("heading", { name: "The Pot" })).toBeVisible();
  await simmerByHand(page);

  await expect(page.getByRole("heading", { name: "The Hob" })).toBeVisible();
  await sizzleByHand(page);

  await expect(page.getByRole("heading", { name: "The Spice Shelf" })).toBeVisible();
  await tasteByHand(page);
  await finishChefStories(page);

  await expect(page.getByRole("heading", { name: "Everything's cooked!" })).toBeVisible();
  await advance(page);
  await expect(page.getByRole("heading", { name: "Plate It" })).toBeVisible();
  await plateByHand(page);
  await advance(page);

  await expect(page.getByRole("heading", { name: "The pass" })).toBeVisible();
  await page.getByTestId("pass-bell").click();
  await expect(page.getByTestId("results")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: /Chef Arjun Mehra/ })).toBeVisible();
  await expect(page.getByTestId("reward-totals")).toContainText("rep");
  await page.getByTestId("results-exit").click();
  await finishChefStories(page);
  await expect(page.getByTestId("kitchen-hub")).toBeVisible();
  const afterCoins = await stat(page, "stat-coins");
  expect(afterCoins).toBeGreaterThan(startCoins);
  expect(await stat(page, "stat-reputation")).toBeGreaterThan(0);

  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishChefStories(page);
  await expect(page.getByTestId("kitchen-hub")).toBeVisible();
  expect(await stat(page, "stat-coins")).toBe(afterCoins);
  await page.getByTestId("open-diary").click();
  await expect(page.getByTestId("dish-diary")).toContainText("Dal tadka");
  expect(outside).toEqual([]);
});
