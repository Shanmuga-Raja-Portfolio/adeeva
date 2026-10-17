import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { bakeByHand, pourByHand, pourWithHelper, stirByHand, traceByHand } from "../fixtures/bakeBench";
import { coins, dragBetween, finishBakeryStories, PATISSERIE_URL } from "../fixtures/patisseriePage";
import { recordScenes } from "../fixtures/sceneLog";
import { holdShowTime, playToScene, releaseShowTime } from "../fixtures/showTime";
import { isOutsideRequest } from "../fixtures/outsideRequest";

const THRESHOLD_V1 = readFileSync(
  new URL("../../src/games/patisserie/core/v1Saves/threshold.json", import.meta.url),
  "utf8",
);

async function dayNumber(page: Page): Promise<number> {
  const text = await page.getByTestId("stat-day").innerText();
  return Number(/Day (\d+)/.exec(text)?.[1] ?? "0");
}

async function endDayTo(page: Page, day: number): Promise<void> {
  for (let guard = 0; guard < 20 && (await dayNumber(page)) < day; guard += 1) {
    await page.getByTestId("end-day").click();
    await page.getByRole("button", { name: "Open the shop" }).click();
    await finishBakeryStories(page);
  }
  expect(await dayNumber(page)).toBe(day);
}

async function advance(page: Page, heading: string): Promise<void> {
  await page.getByTestId("advance-stage").click();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
}

test("a Corner Baker at the threshold opens the Comet Room and takes a showpiece to the Fair", async ({
  page,
}) => {
  test.setTimeout(420_000);
  const outside: string[] = [];
  page.on("request", (request) => {
    if (isOutsideRequest(request.url())) outside.push(request.url());
  });
  await page.goto("/");
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("patisserie.save.1", json);
    window.localStorage.setItem("patisserie.lastSlot", "1");
  }, THRESHOLD_V1);
  await page.goto(PATISSERIE_URL);
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  expect(await dayNumber(page)).toBe(13);

  await page.getByRole("button", { name: "Back to the bench" }).first().click();
  await page.getByTestId("deliver").click();
  await expect(page.getByRole("heading", { name: "Pip loved it!" })).toBeVisible();
  await page.getByTestId("results-exit").click();
  const story = page.locator(".pa-story");
  await expect(story.getByRole("heading", { name: "The Parlour Key" })).toBeVisible();
  for (
    let step = 0;
    step < 4 && (await story.getByRole("button", { name: "Not yet" }).count()) === 0;
    step += 1
  )
    await story.locator(".pa-story__footer button").first().click();
  await story.getByRole("button", { name: "Open the Comet Room" }).click();
  await expect(page.locator(".pa-story").getByRole("heading", { name: "The Comet Room" })).toBeVisible();
  await finishBakeryStories(page);
  await expect(page.getByTestId("season-panel")).toContainText("Fair Season 1 opens on day 15");

  await endDayTo(page, 15);
  await expect(page.getByTestId("choose-theme")).toBeVisible();
  await page.getByRole("radio", { name: /Blossom Lane/ }).click();
  await page.getByTestId("choose-theme").click();
  await page.getByTestId("confirm-menu").click();
  await expect(page.getByTestId("salon-tier-top")).toBeVisible();
  await expect(page.getByTestId("start-showpiece")).toBeDisabled();

  await endDayTo(page, 17);
  await page.getByTestId("start-showpiece").click();
  await finishBakeryStories(page);
  await expect(page.getByRole("heading", { name: "The Fair card" })).toBeVisible();
  await expect(page.getByTestId("fair-brief")).toContainText("Blossom Lane");
  await advance(page, "Design the bake");

  await page.getByRole("radio", { name: "Two-Layer Cake" }).click();
  await page.getByRole("radio", { name: /Vanilla Cloud/ }).click();
  await page.getByRole("radio", { name: /Strawberry Cream/ }).click();
  await page.getByRole("button", { name: /^Blush/ }).click();
  await page.getByRole("button", { name: /^Lavender/ }).click();
  await page.getByTestId("touch-plaque-lettering").click();
  await page.getByRole("radio", { name: "JOY" }).click();
  await advance(page, "The pantry");
  await page.getByTestId("buy-pantry").click();
  await expect(page.getByText("You have everything for this bake.")).toBeVisible();
  await advance(page, "Scoop & Weigh");

  await pourByHand(page, 195);
  await page.getByTestId("keep-weigh").click();
  await page.getByRole("switch", { name: "Scale helper" }).click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "caster-sugar");
  await pourWithHelper(page);
  await page.getByTestId("keep-weigh").click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "butter");
  for (let slice = 0; slice < 7; slice += 1) await page.getByTestId("piece-pad").click();
  await page.getByTestId("keep-weigh").click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "milk");
  await pourWithHelper(page);
  await page.getByTestId("keep-weigh").click();
  for (let egg = 0; egg < 3; egg += 1)
    await page.getByRole("button", { name: "Tap to crack an egg" }).first().click();
  await page.getByTestId("commit-batch").click();
  await expect(page.getByText("In the bowl!")).toBeVisible();
  await advance(page, "Stir the bowl");

  await stirByHand(page, 3);
  await advance(page, "The oven");
  await page.getByRole("radio", { name: "3 heat dots" }).click();
  await bakeByHand(page);
  await expect(page.locator(".pa-oven-bench__result")).toBeVisible();
  await advance(page, "Stack and fill");

  await dragBetween(page, page.getByTestId("piece-base-layer"), page.getByTestId("slot-stand"));
  await dragBetween(page, page.getByTestId("piece-dome-layer"), page.getByTestId("slot-on-top"));
  await page.getByTestId("fill").click();
  await advance(page, "Pipe the icing");
  for (let path = 0; path < 5; path += 1) await traceByHand(page);
  await expect(page.getByText("Every line is piped. Beautiful!")).toBeVisible();
  await advance(page, "Toppings");

  const cake = page.locator(".pa-decorate__cake");
  await dragBetween(page, page.getByTestId("topping-sugar-daisy"), cake);
  await dragBetween(page, page.getByTestId("topping-sugar-daisy"), cake);
  await expect(page.locator(".pa-decorate__hit")).toHaveCount(2);
  await advance(page, "Ready for the Fair");
  await page.getByTestId("deliver").click();
  await expect(page.getByRole("heading", { name: "Ready for the Fair!" })).toBeVisible();
  await page.getByTestId("results-exit").click();
  await finishBakeryStories(page);

  await endDayTo(page, 27);
  const before = await coins(page);
  await page.getByTestId("go-to-fair").click();
  await expect(page.getByTestId("fair-board")).toBeVisible();
  await page.getByTestId("fair-board-next").click();
  await expect(page.getByTestId("fair-planner")).toBeVisible();
  await page.clock.install();
  await holdShowTime(page);
  await page.getByTestId("start-showcase").click();
  const showcase = page.getByTestId("fair-showcase");
  await expect(showcase).toBeVisible();
  for (let plate = 1; plate <= 3; plate += 1) {
    await playToScene(page, "fair-showcase", `wait-${plate}`);
    await page.getByTestId(plate === 2 ? "cloche-art" : "lift-cloche").click();
    await expect(showcase).toHaveAttribute("data-scene", `reveal-${plate}`);
  }
  await playToScene(page, "fair-showcase", "finale");
  await playToScene(page, "fair-showcase", "panels");
  await expect(page.getByTestId("flip-bench")).toBeVisible();
  await releaseShowTime(page);
  await expect(page.getByTestId("fair-results")).toBeVisible({ timeout: 15_000 });
  const ribbon = await page.getByTestId("fair-ribbon").innerText();
  expect(ribbon).toMatch(/Ribbon|Rosette/);
  await expect(page.locator("main h1")).toBeFocused();
  const replayed = await recordScenes(page, "fair-showcase");
  await page.getByTestId("replay-showcase").click();
  await expect(showcase).toBeVisible();
  await expect.poll(async () => (await replayed())[0]).toBe("title");
  await expect(page.getByTestId("skip-showcase")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("fair-results")).toBeVisible();
  await page.getByTestId("fair-done").click();
  await finishBakeryStories(page);
  const after = await coins(page);
  expect(after).toBeGreaterThan(before);
  await expect(page.getByTestId("ribbon-wall")).toContainText("Blossom Lane");
  await expect(page.getByTestId("ribbon-wall").getByRole("img", { name: /for Blossom Lane/ })).toBeVisible();

  await page.getByRole("button", { name: "Save & exit" }).click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  expect(await coins(page)).toBe(after);
  await expect(page.getByTestId("season-panel")).toContainText("Comet Room");
  await page.getByRole("button", { name: "Open the Bake Book" }).click();
  await expect(page.getByTestId("book-ribbon").first()).toBeVisible();
  expect(outside).toEqual([]);
});
