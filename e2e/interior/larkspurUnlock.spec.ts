import { expect, test, type Page } from "@playwright/test";
import {
  advance,
  coins,
  edgeByHand,
  finishInteriorStories,
  layFloorByHand,
  revealBySlider,
  rollByHand,
  rollTwoToneByHand,
  watchOutsideRequests,
} from "../fixtures/interiorStudio";
import { loadSave, v1ThresholdSave } from "../fixtures/preparedLarkspur";
import { settle } from "../fixtures/settle";
import { holdShowTime, playToScene, playUntilVisible, releaseShowTime } from "../fixtures/showTime";

async function endHomeDay(page: Page, button = "home-end-day"): Promise<void> {
  await page.getByTestId(button).click();
  await page.getByTestId("day-done").click();
  await finishInteriorStories(page);
}

async function dragElement(page: Page, from: string, to: string): Promise<void> {
  const start = await page.getByTestId(from).boundingBox();
  const end = await page.getByTestId(to).boundingBox();
  if (start === null || end === null) throw new Error("Nothing to drag");
  const sx = start.x + start.width / 2;
  const sy = start.y + start.height / 2;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 20, sy + 12, { steps: 3 });
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
  await page.mouse.up();
}

async function placeStoryPiece(page: Page): Promise<void> {
  const item = page.locator(".is-bin__item", { has: page.locator(".is-tray__must--story") }).first();
  const buy = item.getByRole("button");
  const decorId = ((await buy.getAttribute("data-testid")) ?? "").replace("buy-", "");
  await buy.click();
  await page.getByTestId(`stock-${decorId}`).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId(`placed-${decorId}`)).toBeVisible();
  await expect(page.getByTestId("story-status")).toContainText("tells the family's story");
}

async function heroRoomByHand(page: Page): Promise<void> {
  await page.getByTestId("open-room-0").click();
  await finishInteriorStories(page);
  await expect(page.getByRole("heading", { name: "The client's letter" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Little Bedroom" })).toBeVisible();
  await advance(page);
  await page.getByTestId("tray-single-bed").click();
  await expect(page.getByTestId("placed-single-bed")).toBeVisible();
  await page.getByTestId("tray-toy-box").click();
  await expect(page.getByTestId("placed-toy-box")).toBeVisible();
  await expect(page.getByTestId("through-door")).toBeVisible();
  await page.getByRole("radiogroup", { name: "Wall paint" }).getByRole("radio").first().click();
  await page.getByRole("radiogroup", { name: "Two-tone lower paint" }).getByRole("radio").nth(1).click();
  await page.getByRole("radio", { name: /^Oak Boards/ }).click();
  await page.getByRole("button", { name: /Add Paper Pendant/ }).click();
  await page.getByRole("button", { name: /Add Paper Lantern Pendant/ }).click();
  await advance(page);
  await expect(page.getByRole("heading", { name: "Larkspur Supply Yard" })).toBeVisible();
  const purse = Number(await page.getByTestId("purse-left").innerText());
  const wallet = await page.getByTestId("makeover-coins").innerText();
  await page.getByTestId("buy-plan").click();
  await expect(page.getByText("You have everything on your plan.")).toBeVisible();
  expect(Number(await page.getByTestId("purse-left").innerText())).toBeLessThan(purse);
  expect(await page.getByTestId("makeover-coins").innerText()).toBe(wallet);
  await advance(page);
  await expect(page.getByRole("heading", { name: "Paint the walls" })).toBeVisible();
  for (const path of ["back-ceiling", "back-frame", "back-mid"]) await edgeByHand(page, path);
  await rollTwoToneByHand(page);
  await page.getByRole("radio", { name: /Side wall/ }).click();
  await edgeByHand(page, "side-ceiling");
  await edgeByHand(page, "side-skirting");
  await rollByHand(page, "side");
  await advance(page);
  await expect(page.getByRole("heading", { name: "Lay the floor" })).toBeVisible();
  await layFloorByHand(page, 6);
  await advance(page);
  await expect(page.getByRole("heading", { name: "Light it up" })).toBeVisible();
  await page.getByTestId("tray-light-0").click();
  await page.getByTestId("tray-light-1").click();
  await expect(page.getByTestId("glow-path")).toBeVisible();
  await advance(page);
  await placeStoryPiece(page);
  await advance(page);
  await expect(page.getByTestId("ready-stage")).toBeVisible();
  await page.getByTestId("ready-done").click();
  await expect(page.getByTestId("room-card-0")).toContainText("Ready for visitors");
}

async function secondRoomWithCrew(page: Page): Promise<void> {
  await page.getByTestId("open-room-1").click();
  await advance(page);
  await page.getByTestId("tray-sofa").click();
  await page.getByTestId("tray-armchair").click();
  await page.getByRole("radiogroup", { name: "Wall paint" }).getByRole("radio").first().click();
  await page.getByRole("radio", { name: /^Oak Boards/ }).click();
  await page.getByRole("button", { name: /Add Paper Pendant/ }).click();
  await page.getByRole("button", { name: /Add Paper Lantern Pendant/ }).click();
  await advance(page);
  await page.getByTestId("buy-plan").click();
  await advance(page);
  await expect(page.getByRole("heading", { name: "Paint the walls" })).toBeVisible();
  await page.getByTestId("makeover-back").click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await page.getByTestId("hire-rosa").click();
  await finishInteriorStories(page);
  await page.getByTestId("hire-tobi").click();
  for (let step = 0; step < 4; step += 1)
    await page.getByRole("button", { name: /Top up the purse/ }).click();
  await page.getByTestId("assign-rosa-1").click();
  await expect(page.getByTestId("crew-job-1")).toContainText("Rosa paints tonight");
  await endHomeDay(page);
  await page.getByTestId("coach-light").click();
  await page.getByTestId("coach-cell-1-1").click();
  await page.getByTestId("coach-light-done").click();
  await finishInteriorStories(page);
  await expect(page.getByTestId("coach-light")).toContainText("100%");
  await page.getByTestId("assign-tobi-1").click();
  await endHomeDay(page);
  await page.getByTestId("assign-rosa-1").click();
  await endHomeDay(page);
  await page.getByTestId("open-room-1").click();
  await expect(page.getByRole("heading", { name: "Style the room" })).toBeVisible();
  await placeStoryPiece(page);
  await advance(page);
  await page.getByTestId("ready-done").click();
}

async function planByKeyboard(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Plan the Open House" })).toBeVisible();
  await page.getByTestId("music-choice").getByRole("radio").first().focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  await page.getByTestId("time-choice").getByRole("radio").first().focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("time-choice").getByRole("radio", { checked: true })).toHaveCount(1);
  await page.getByTestId("set-plan").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("doors-card")).toBeVisible();
}

test("a v1 save at the threshold takes the keys and plays a whole home through its Open House", async ({
  page,
}) => {
  test.setTimeout(600_000);
  page.setDefaultTimeout(30_000);
  const outside = watchOutsideRequests(page);
  await loadSave(page, v1ThresholdSave());
  await finishInteriorStories(page);
  await page.getByRole("button", { name: "Back to the room" }).first().click();
  await expect(page.getByRole("heading", { name: "Style the room" })).toBeVisible();
  for (const decorId of ["framed-print", "potted-fern", "wall-clock"]) {
    await page.getByTestId(`stock-${decorId}`).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId(`placed-${decorId}`)).toBeVisible();
  }
  await advance(page);
  await revealBySlider(page);
  await page.getByTestId("reveal-button").click();
  await expect(page.getByTestId("open-house")).toBeVisible();
  await page.getByTestId("results-exit").click();
  await expect(page.getByRole("heading", { name: "Six Front Doors" })).toBeVisible();
  const take = page.getByTestId("story-choice-take-keys");
  for (let step = 0; step < 5 && !(await take.isVisible()); step += 1)
    await page.getByRole("button", { name: /Tap to continue/ }).click();
  await expect(page.getByTestId("story-choice-not-yet")).toBeVisible();
  await take.click();
  await finishInteriorStories(page);
  await expect(page.getByTestId("larkspur-panel")).toBeVisible();
  const before = await coins(page);
  await page.locator("[data-testid^='start-']").first().click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await finishInteriorStories(page);
  expect(await page.getByTestId("home-screen").getAttribute("data-stage")).toBe("map");

  await dragElement(page, "purpose-kids", "space-0");
  await expect(page.getByTestId("space-0")).toContainText("Little Bedroom");
  await page.getByTestId("purpose-living").focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("space-0").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("space-1")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("space-1")).toContainText("Living Room");
  await page.getByTestId("confirm-map").click();
  await page.getByTestId("achebe-palette").click();
  await expect(page.getByTestId("palette-count")).toContainText("3 of 3");
  await page.getByTestId("confirm-palette").click();
  await endHomeDay(page);
  expect(Number((await page.getByTestId("home-coins").innerText()).replace(/\D/g, ""))).toBeGreaterThan(
    before,
  );

  await heroRoomByHand(page);
  await secondRoomWithCrew(page);
  await planByKeyboard(page);
  for (let day = 0; day < 8 && (await page.getByTestId("open-doors").isDisabled()); day += 1)
    await endHomeDay(page, "planner-end-day");
  await page.clock.install();
  await holdShowTime(page);
  await page.getByTestId("open-doors").click();
  await expect(page.getByTestId("open-house-show")).toBeVisible();
  await expect(page.getByTestId("show-title")).toBeVisible();
  await playToScene(page, "open-house-show", "walk-1");
  await expect(page.getByTestId("home-strip")).toBeVisible();
  await playUntilVisible(page, "the skip button", page.getByTestId("skip-show"));
  await page.getByTestId("skip-show").click();
  await expect(page.getByTestId("open-house-results")).toBeVisible();
  await releaseShowTime(page);
  await expect(page.getByTestId("panel-flow")).toBeVisible();
  await expect(page.getByTestId("panel-story")).toBeVisible();
  await expect(page.getByTestId("open-house-tip")).toContainText("Next time, try");
  await page.getByTestId("results-exit").click();
  await finishInteriorStories(page);
  const hook = page.getByTestId("hook-garden-flat");
  await expect(hook).not.toContainText("Waiting");
  const afterShow = await coins(page);

  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishInteriorStories(page);
  await settle(page);
  expect(await coins(page)).toBe(afterShow);
  await expect(page.getByTestId("hook-garden-flat")).not.toContainText("Waiting");
  await expect(page.getByTestId("open-house-notes")).toBeVisible();
  expect(outside).toEqual([]);
});
