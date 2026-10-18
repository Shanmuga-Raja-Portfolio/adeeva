import { expect, test } from "@playwright/test";
import { serialize } from "../../src/games/patisserie/core";
import {
  GOOD_PLAN,
  newTestGame,
  playTray,
  settleStories,
} from "../../src/games/patisserie/core/testPlaythrough";
import { coins, dragBetween, finishBakeryStories, PATISSERIE_URL } from "../fixtures/patisseriePage";
import { holdShowTime, playFor, releaseShowTime } from "../fixtures/showTime";

test("two counter trays sell in boxes on Counter Day and the rest go to the neighbours", async ({ page }) => {
  let state = settleStories(newTestGame({ trait: "charmer" }));
  state = playTray(state, {
    ...GOOD_PLAN,
    productId: "cupcake-tray",
    mixIds: ["lemon-sponge"],
    fillingId: null,
    colours: ["sky"],
  });
  state = playTray(state, {
    ...GOOD_PLAN,
    productId: "iced-biscuits",
    mixIds: ["biscuit-dough"],
    fillingId: null,
    colours: ["mustard"],
  });
  const counterDay = settleStories({ ...state, calendar: { day: 7, hoursLeft: 10 } });
  await page.goto(PATISSERIE_URL);
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("patisserie.save.1", json);
    window.localStorage.setItem("patisserie.lastSlot", "1");
  }, serialize(counterDay));
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishBakeryStories(page);
  const before = await coins(page);
  await page.getByRole("button", { name: "Open the counter" }).click();
  await expect(page.getByTestId("counter-day")).toBeVisible();

  const card = page.getByTestId("order-box-0");
  const wants = ((await card.getAttribute("data-wants")) ?? "").split(",");
  for (const want of wants) {
    const tray = want.startsWith("cupcake-tray") ? "tray-1" : "tray-2";
    await dragBetween(page, page.getByTestId(`treat-${tray}`).first(), card.locator(".pa-card__box"));
  }
  await expect(card).toContainText("Sold!");
  await expect(page.getByTestId("counter-coins")).not.toHaveText("+0");

  const others = await page
    .locator("[data-wants]")
    .evaluateAll((cards) => cards.map((element) => element.getAttribute("data-wants") ?? ""));
  const lacking = others.findIndex((entry, index) => index > 0 && !entry.includes("iced-biscuits"));
  const missingKind = lacking === -1 ? "cupcake-tray" : "iced-biscuits";
  const target =
    lacking === -1
      ? others.findIndex((entry, index) => index > 0 && !entry.includes("cupcake-tray"))
      : lacking;
  expect(target).toBeGreaterThan(0);
  await page
    .getByTestId(`treat-${missingKind === "cupcake-tray" ? "tray-1" : "tray-2"}`)
    .first()
    .click();
  await page.clock.install();
  await holdShowTime(page);
  await page.getByTestId(`order-box-${target}`).locator(".pa-card__box").click();
  const nudge = page.locator(".ad-toast").filter({ hasText: "That box needs something else." });
  await expect(nudge).toBeVisible();
  await playFor(page, 3100);
  await expect(nudge).toBeVisible();
  await playFor(page, 200);
  await expect(nudge).toHaveCount(0);
  await releaseShowTime(page);

  await page.getByTestId("close-shop").click();
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  expect(await coins(page)).toBeGreaterThan(before);
  await expect(page.getByText(/treats shared with the neighbours/)).toBeVisible();
});
