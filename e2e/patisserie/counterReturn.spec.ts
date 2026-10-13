import { expect, test } from "@playwright/test";
import type { GameState } from "../../src/games/patisserie/core";
import {
  GOOD_PLAN,
  newTestGame,
  playTray,
  settleStories,
} from "../../src/games/patisserie/core/testPlaythrough";
import { openPreparedBakery } from "../fixtures/preparedBakery";

function counterDayWithTray(): GameState {
  const stocked = playTray(settleStories(newTestGame()), {
    ...GOOD_PLAN,
    productId: "cupcake-tray",
    mixIds: ["lemon-sponge"],
    fillingId: null,
    colours: ["sky"],
  });
  return settleStories({ ...stocked, calendar: { day: 7, hoursLeft: 10 } });
}

test("a baker who leaves Counter Day early can walk back to the counter", async ({ page }) => {
  await openPreparedBakery(page, counterDayWithTray());
  await page.getByRole("button", { name: "Open the counter" }).click();
  await expect(page.getByTestId("counter-day")).toBeVisible();
  await page.waitForTimeout(600);
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  await page.getByTestId("back-to-counter").click();
  await expect(page.getByTestId("counter-day")).toBeVisible();
});

test("the sun warns before closing time and sums up the day", async ({ page }) => {
  await page.clock.install();
  await openPreparedBakery(page, counterDayWithTray());
  await page.getByRole("button", { name: "Open the counter" }).click();
  await expect(page.getByTestId("counter-day")).toBeVisible();
  await expect(page.getByText("the shop closes when the sun sets")).toBeVisible();
  await page.clock.runFor(135_000);
  await expect(page.getByTestId("closing-soon")).toHaveText("The sun is setting. Almost closing time!");
  await page.clock.runFor(20_000);
  await expect(page.getByRole("heading", { name: "The sun has set!" })).toBeVisible();
  await expect(page.getByTestId("counter-day")).toBeVisible();
  await page.getByTestId("sunset-close").click();
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  await expect(page.getByText(/treats shared with the neighbours/)).toBeVisible();
});
