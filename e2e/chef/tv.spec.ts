import { expect, test } from "@playwright/test";
import { serialize } from "../../src/games/chef/core";
import {
  advance,
  chopByHand,
  chopMarksByHand,
  dragOnto,
  finishChefStories,
  plateByHand,
  sizzleByHand,
  stat,
  tasteByHand,
  watchOutside,
} from "../fixtures/chefKitchen";
import { chooseDoor, openChefSave, readyHeadChef } from "../fixtures/chefPaths";

test("Spoon & Story: cue cards in order, kind tips, a live segment cooked by hand and a letter", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const outside = watchOutside(page);
  await openChefSave(page, serialize(readyHeadChef("relaxed")));
  await chooseDoor(page, "tv");
  await expect(page.getByRole("heading", { level: 1, name: "Spoon & Story" })).toBeVisible();

  await page.getByTestId("prepare-segment").click();
  await page.getByTestId("dish-kelewele").click();
  await page.getByTestId("confirm-dishes").click();
  await expect(page.getByTestId("go-live")).toBeDisabled();
  for (const cue of ["ready", "chop"]) {
    await page.getByTestId(`cue-${cue}`).click();
    await expect(page.locator(".ck-cue__deck button:focus:not(:disabled)")).toHaveCount(1);
  }
  await page.getByTestId("cue-taste").click();
  await expect(page.locator(".ck-cue__tips input").first()).toBeFocused();
  for (const [cue, tip] of [
    ["ready", 0],
    ["chop", 1],
    ["taste", 1],
  ] as const)
    await page.getByTestId(`tip-${cue}-${tip}`).check();
  const coins = await stat(page, "stat-coins");
  await page.getByTestId("go-live").click();

  await expect(page.getByRole("heading", { level: 1, name: "Kelewele" })).toBeVisible();
  await expect(page.locator(".ck-host")).toContainText("Spoon & Story is live: cook it with your cue cards.");
  await advance(page);
  const tiles = page.locator("[data-testid^='tile-']");
  while ((await tiles.count()) > 0) await dragOnto(page, tiles.first(), page.getByTestId("mise-bowls"));
  await advance(page);
  await expect(page.getByRole("heading", { name: "The Board" })).toBeVisible();
  await chopMarksByHand(page);
  await expect(page.getByTestId("chop-start")).toBeVisible();
  await chopByHand(page);
  await expect(page.getByRole("heading", { name: "The Hob" })).toBeVisible();
  await sizzleByHand(page);
  await expect(page.getByRole("heading", { name: "The Spice Shelf" })).toBeVisible();
  await tasteByHand(page);
  await finishChefStories(page);
  await advance(page);
  await plateByHand(page);
  await advance(page);
  await page.getByTestId("pass-bell").click();
  await expect(page.getByTestId("segment-summary")).toContainText("Kind, clear tips");
  await expect(page.getByTestId("segment-summary")).toContainText("3 of 3");
  await expect(page.getByTestId("segment-kinder-tips")).toHaveCount(0);
  await expect(page.getByTestId("segment-letter")).toBeVisible();
  await finishChefStories(page);
  await page.getByTestId("results-exit").click();
  await finishChefStories(page);
  await expect(page.getByTestId("letters-wall")).toContainText("Pip, age 8");
  const after = await stat(page, "stat-coins");
  expect(after).toBeGreaterThan(coins);

  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishChefStories(page);
  await expect(page.getByTestId("letters-wall")).toContainText("Pip, age 8");
  expect(await stat(page, "stat-coins")).toBe(after);
  expect(outside).toEqual([]);
});
