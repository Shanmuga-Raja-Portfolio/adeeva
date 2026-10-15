import { expect, test, type Page } from "@playwright/test";
import { serialize, type GameState } from "../../src/games/patisserie/core";
import { bakeByHand, pourWithHelper, stirByHand, traceByHand } from "../fixtures/bakeBench";
import {
  coins,
  dragBetween,
  finishBakeryStories,
  freshPatisserie,
  PATISSERIE_URL,
} from "../fixtures/patisseriePage";
import { salonDay } from "../fixtures/salonStates";

async function openSalonDay(page: Page, state: GameState): Promise<void> {
  await page.goto("/");
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("patisserie.save.1", json);
    window.localStorage.setItem("patisserie.lastSlot", "1");
  }, serialize(state));
  await page.goto(PATISSERIE_URL);
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
}

async function bookedColour(page: Page, tier: string): Promise<string> {
  const label = (await page.getByTestId(`stand-slot-${tier}`).getAttribute("aria-label")) ?? "";
  return (/booked (\w+)/.exec(label)?.[1] ?? "").toLowerCase();
}

test("a Salon Pâtissier starts here, sets the menu and bakes a salon tray by hand with a split", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await freshPatisserie(page);
  await page.getByRole("button", { name: "New Game" }).click();
  await page.getByLabel("Name").fill("Noor");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Perfectionist" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Salon Pâtissier" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Standard" }).click();
  await page.getByRole("button", { name: "Open the Comet Room" }).click();
  await expect(page.locator(".pa-story").getByRole("heading", { name: "Two Rooms, One Oven" })).toBeVisible();
  await finishBakeryStories(page);
  expect(await coins(page)).toBe(400);
  await page.getByTestId("choose-theme").click();
  await page.getByTestId("confirm-menu").click();
  await expect(page.getByTestId("salon-tier-bottom")).toBeVisible();

  await page.getByTestId("bake-salon-bottom").click();
  await expect(page.getByTestId("split-tally")).toBeVisible();
  await page.getByTestId("split-4").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("split-3")).toHaveAttribute("aria-checked", "true");
  await page.getByTestId("advance-stage").click();
  await expect(page.getByRole("heading", { name: "The pantry" })).toBeVisible();
  await page.getByTestId("buy-pantry").click();
  await page.getByTestId("advance-stage").click();
  await expect(page.getByRole("heading", { name: "Scoop & Weigh" })).toBeVisible();
  await page.getByRole("switch", { name: "Scale helper" }).click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "flour");
  await pourWithHelper(page);
  await page.getByTestId("keep-weigh").click();
  for (let slice = 0; slice < 8; slice += 1) await page.getByTestId("piece-pad").click();
  await page.getByTestId("keep-weigh").click();
  await pourWithHelper(page);
  await page.getByTestId("keep-weigh").click();
  for (let drop = 0; drop < 4; drop += 1) await page.getByTestId("piece-pad").click();
  await page.getByTestId("keep-weigh").click();
  await page.getByRole("button", { name: "Tap to crack an egg" }).first().click();
  await page.getByTestId("commit-batch").click();
  await page.getByTestId("advance-stage").click();
  await stirByHand(page, 2);
  await page.getByTestId("advance-stage").click();
  await page.getByRole("radio", { name: "2 heat dots" }).click();
  await bakeByHand(page);
  await page.getByTestId("advance-stage").click();
  await expect(page.getByRole("heading", { name: "Pipe the icing" })).toBeVisible();
  await traceByHand(page);
  await page.getByTestId("advance-stage").click();
  await expect(page.getByRole("heading", { name: "Ready for the shelf" })).toBeVisible();
  await page.getByTestId("deliver").click();
  await expect(page.getByRole("heading", { name: "On the Salon shelf!" })).toBeVisible();
  await page.getByTestId("results-exit").click();
  await finishBakeryStories(page);
  await expect(page.getByTestId("salon-tier-bottom")).toContainText("On the shelf");
  await expect(page.getByTestId("salon-tier-bottom")).toContainText("3 on the shelf");
});

test("Table Service plates by drag and keyboard, pours tea by hand and serves", async ({ page }) => {
  test.setTimeout(180_000);
  await openSalonDay(page, salonDay());
  const before = await coins(page);
  await page.getByTestId("open-tables").click();
  await expect(page.getByTestId("table-service")).toBeVisible();

  const top = await bookedColour(page, "top");
  await dragBetween(page, page.getByTestId(`shelf-top-${top}`), page.getByTestId("stand-slot-top"));
  await expect(page.getByTestId("stand-slot-top")).toHaveClass(/pa-stand__slot--full/);

  const middle = await bookedColour(page, "middle");
  await page.getByTestId(`shelf-middle-${middle}`).focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("stand-slot-top").focus();
  await page.getByTestId("stand-slot-bottom").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("salon-notice")).toContainText("sit on the middle tier");
  await page.getByTestId("stand-slot-middle").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("stand-slot-middle")).toHaveClass(/pa-stand__slot--full/);

  const bottom = await bookedColour(page, "bottom");
  await page.getByTestId(`shelf-bottom-${bottom}`).click();
  await page.getByTestId("stand-slot-bottom").click();
  await expect(page.getByTestId("stand-slot-bottom")).toHaveClass(/pa-stand__slot--full/);

  await expect(page.getByTestId("serve-table")).toBeDisabled();
  const pad = page.getByTestId("tea-pad");
  await pad.focus();
  await page.keyboard.down("Space");
  await expect(page.getByTestId("keep-tea")).toHaveText(/^Keep [1-9]\d* ml$/);
  await page.keyboard.up("Space");
  await expect(page.getByTestId("keep-tea")).toBeEnabled({ timeout: 10_000 });
  await page.getByTestId("keep-tea").click();
  await expect(page.getByTestId("keep-tea")).toHaveText("Cup kept");
  await page.getByTestId("serve-table").click();
  await expect(page.getByTestId("table-tab-0")).toHaveClass(/pa-table-tab--served/);
  await expect(page.getByTestId("table-tab-1")).toBeFocused();
  expect(Number((await page.getByTestId("salon-coins").innerText()).replace(/[^0-9]/g, ""))).toBeGreaterThan(
    29,
  );

  await page.getByTestId("close-salon").click();
  await expect(page.getByRole("dialog")).toContainText("still waiting");
  await page.getByTestId("keep-serving").click();
  await expect(page.getByTestId("table-service")).toBeVisible();
  await page.getByTestId("close-salon").click();
  await page.getByTestId("confirm-close-salon").click();
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  const after = await coins(page);
  expect(after).toBeGreaterThan(before + 29);
  await page.getByRole("button", { name: "Save & exit" }).click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishBakeryStories(page);
  expect(await coins(page)).toBe(after);
  await expect(page.locator(".pa-trays")).toContainText("left");
});
