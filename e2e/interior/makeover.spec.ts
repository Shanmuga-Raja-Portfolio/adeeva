import { expect, test } from "@playwright/test";
import {
  advance,
  coins,
  dragOnto,
  dragPath,
  edgeByHand,
  finishInteriorStories,
  freshInterior,
  layFloorByHand,
  newDesigner,
  revealBySlider,
  rollByHand,
  watchOutsideRequests,
} from "../fixtures/interiorStudio";
import { stillBox } from "../fixtures/settle";

test("a new designer makes Nana Pearl's reading nook by hand, reveals it, then saves and continues", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const outside = watchOutsideRequests(page);
  await freshInterior(page);
  await newDesigner(page);
  await expect(page.getByTestId("coach-bubble")).toContainText("Nana Pearl");
  const startCoins = await coins(page);
  expect(startCoins).toBe(110);

  await page.getByRole("button", { name: "Accept Nana Pearl" }).click();
  await page.getByTestId("order-card").getByRole("button", { name: "Start the makeover" }).click();
  await expect(page.getByRole("heading", { name: "The client's letter" })).toBeVisible();
  await advance(page);

  await expect(page.getByRole("heading", { name: "Pick and place" })).toBeVisible();
  const grid = page.locator(".is-plan__grid");
  await dragOnto(page, page.getByTestId("tray-armchair"), grid, [60, 60]);
  await expect(page.getByTestId("placed-armchair")).toBeVisible();
  await page.getByTestId("tray-bookcase").click();
  await expect(page.getByTestId("placed-bookcase")).toBeVisible();
  await page.getByRole("radio", { name: /^Chalk White/ }).click();
  await page.getByRole("radio", { name: /^Cork Tiles/ }).click();
  await page.getByRole("button", { name: /Add Arc Floor Lamp/ }).click();
  await page.getByRole("button", { name: /Add Paper Pendant/ }).click();
  await expect(page.getByTestId("plan-total")).toContainText("36");
  await advance(page);

  await expect(page.getByRole("heading", { name: "Marigold Warehouse" })).toBeVisible();
  await page.getByTestId("buy-plan").click();
  await expect(page.getByText("You have everything on your plan.")).toBeVisible();
  expect(Number((await page.getByTestId("makeover-coins").innerText()).replace(/\D/g, ""))).toBe(74);
  await advance(page);

  await expect(page.getByRole("heading", { name: "Paint the walls" })).toBeVisible();
  await edgeByHand(page, "back-ceiling");
  await expect(page.getByTestId("edge-back-ceiling")).toContainText("Crisp edge!");
  await edgeByHand(page, "back-frame");
  await expect(page.getByTestId("edge-back-frame")).toContainText("Crisp edge!");
  await rollByHand(page, "back");
  await expect(page.getByRole("radio", { name: /Back wall ✓/ })).toBeVisible();
  await page.getByRole("radio", { name: /Side wall/ }).click();
  await edgeByHand(page, "side-ceiling");
  await edgeByHand(page, "side-skirting");
  await rollByHand(page, "side");
  await advance(page);

  await expect(page.getByRole("heading", { name: "Lay the floor" })).toBeVisible();
  await layFloorByHand(page, 6);
  await advance(page);

  await expect(page.getByRole("heading", { name: "Light it up" })).toBeVisible();
  await dragOnto(page, page.getByTestId("tray-light-1"), page.locator(".is-light__grid"), [150, 90]);
  await expect(page.getByTestId("placed-light-1")).toBeVisible();
  await page.getByTestId("tray-light-0").click();
  await expect(page.getByTestId("placed-light-0")).toBeVisible();
  await advance(page);

  await expect(page.getByRole("heading", { name: "Style the room" })).toBeVisible();
  await page.getByTestId("buy-cushion-pile").click();
  await dragOnto(page, page.getByTestId("stock-cushion-pile"), page.locator(".is-style__room"), [300, 330]);
  await expect(page.getByTestId("placed-cushion-pile")).toBeVisible();
  await page.getByRole("button", { name: "Bigger" }).click();
  await advance(page);

  await expect(page.getByTestId("reveal-stage")).toBeVisible();
  await revealBySlider(page);
  await page.getByTestId("reveal-button").click();
  await expect(page.getByTestId("results")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: /Nana Pearl/ })).toBeVisible();
  await expect(page.getByTestId("reward-totals")).toContainText("rep");
  await page.getByTestId("results-exit").click();
  await finishInteriorStories(page);
  await expect(page.getByTestId("loft-hub")).toBeVisible();
  const afterCoins = await coins(page);
  expect(afterCoins).not.toBe(startCoins);
  expect(afterCoins).toBeGreaterThan(74);
  expect(Number((await page.getByTestId("stat-reputation").innerText()).replace(/\D/g, ""))).toBeGreaterThan(
    0,
  );

  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishInteriorStories(page);
  await expect(page.getByTestId("loft-hub")).toBeVisible();
  expect(await coins(page)).toBe(afterCoins);
  await expect(page.locator(".is-hub__last-room")).toBeVisible();
  expect(outside).toEqual([]);
});

test("the plan refuses a piece on the door swing and explains why", async ({ page }) => {
  await freshInterior(page);
  await newDesigner(page, "Relaxed");
  await page.getByRole("button", { name: "Accept Nana Pearl" }).click();
  await page.getByTestId("order-card").getByRole("button", { name: "Start the makeover" }).click();
  await advance(page);
  await dragOnto(page, page.getByTestId("tray-desk"), page.locator(".is-plan__grid"), [240, 210]);
  await expect(page.getByText("Keep the door clear so it can open.")).toBeVisible();
  await expect(page.getByTestId("placed-desk")).toHaveCount(0);
  await page.getByTestId("tray-desk").click();
  const placed = page.getByTestId("placed-desk");
  await expect(placed).toBeVisible();
  const box = await stillBox(placed);
  await dragPath(page, [
    [box.x + box.width / 2, box.y + box.height / 2],
    [box.x + box.width / 2 + 30, box.y - 40],
    [10, 10],
  ]);
  await expect(page.getByTestId("placed-desk")).toHaveCount(0);
});
