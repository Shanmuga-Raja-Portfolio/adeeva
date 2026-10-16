import { expect, test, type Page } from "@playwright/test";
import type { GameState } from "../../src/games/workshop/core";
import { fairThemeById } from "../../src/games/workshop/core/catalog";
import { bramsPick } from "../../src/games/workshop/core/fairPick";
import { reduce } from "../../src/games/workshop/core/reduce";
import { showroomTestGame } from "../../src/games/workshop/core/setPlaythrough";
import { fairDayShowroom, openShowroomSave, setAt, twoSetsOnFloor } from "../fixtures/showroomSaves";

test.use({ viewport: { width: 1280, height: 800 } });

async function savedState(page: Page): Promise<GameState> {
  const raw = await page.evaluate(() => window.localStorage.getItem("workshop.save.1"));
  if (raw === null) throw new Error("No save");
  return JSON.parse(raw) as GameState;
}

async function toBench(page: Page, state: GameState) {
  await openShowroomSave(page, state);
  await page.getByRole("button", { name: "Back to the workbench" }).first().click();
  await expect(page.locator("main.ww-build")).toBeVisible();
}

async function plannerChoices(page: Page) {
  return {
    checked: await page.locator("[data-testid=fair-planner] [role=radio][aria-checked=true]").allInnerTexts(),
    order: await page.locator(".ww-reveal-row__name strong").allInnerTexts(),
  };
}

test("a double tap on Ren's buttons acts once", async ({ page }) => {
  const start = reduce(showroomTestGame({ name: "Juno", trait: "charmer" }), {
    type: "chooseFairTheme",
    themeId: "orchard-picnic",
  });
  await openShowroomSave(page, start);
  const card = page.getByTestId("ren-card");
  await page.getByTestId("take-ren-on").dblclick();
  await expect(card.getByRole("button", { name: "Give Ren the week off" })).toBeVisible();
  await expect.poll(async () => (await savedState(page)).apprentice?.hired).toBe(true);
  expect((await savedState(page)).coins).toBe(start.coins - 40);
  await expect(card).toContainText("2 jobs left today");
  await card.getByRole("button", { name: "Give Ren the week off" }).dblclick();
  await expect(page.getByTestId("take-ren-on")).toBeVisible();
  await expect.poll(async () => (await savedState(page)).apprentice?.hired).toBe(false);
});

test("Ren's sanding shows Ren's own evenness and counts one job", async ({ page }) => {
  const atSand = setAt("sand");
  const apprentice = atSand.apprentice;
  if (apprentice === null) throw new Error("No Ren");
  await toBench(page, { ...atSand, apprentice: { ...apprentice, jobsToday: 1 } });
  await expect(page.getByTestId("ren-sand")).toBeVisible();
  await expect(page.locator("main.ww-build")).toContainText("1 job left");
  await page.getByTestId("ren-sand").click();
  const message = page.locator(".ww-sand__message");
  await expect(message).toContainText("to 74%");
  await expect(message).toContainText("Ren is still learning");
  await expect(message).not.toContainText("Lovely and even");
});

test("the finish stage's pieces switch with the arrow keys", async ({ page }) => {
  await toBench(page, setAt("finish"));
  const first = page.getByTestId("piece-0");
  await expect(first).toHaveAttribute("aria-checked", "true");
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("piece-1")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("piece-1")).toBeFocused();
  await expect(first).toHaveAttribute("tabindex", "-1");
});

test("a floor piece turns with the Turn button", async ({ page }) => {
  await openShowroomSave(page, twoSetsOnFloor());
  await page.getByTestId("arrange-floor").click();
  await expect(page.getByTestId("floor-turn")).toBeDisabled();
  await page.getByTestId("floor-piece-set-1-0").click();
  await page.getByTestId("floor-turn").click();
  await expect
    .poll(async () => (await savedState(page)).showroom?.floor[0]?.pieces[0]?.spot.rotation)
    .toBe(90);
});

test("the Planner keeps choices and focus, and the results say how the set came home", async ({ page }) => {
  test.setTimeout(120_000);
  const state = fairDayShowroom();
  const pick = bramsPick(state, fairThemeById("orchard-picnic"));
  if (pick === null) throw new Error("No set for the Fair");
  await openShowroomSave(page, state);
  await page.getByTestId("go-to-fair").click();
  await page.getByTestId("fair-board-next").click();
  await expect(page.getByTestId("fair-planner")).toBeVisible();
  const suggested = await plannerChoices(page);
  await page.locator("[data-testid^=backdrop-]").nth(2).click();
  await page.locator("[data-testid^=music-]").nth(3).click();
  const later = page.getByTestId("reveal-0").getByRole("button", { name: /later$/ });
  const label = (await later.getAttribute("aria-label")) ?? "";
  await later.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(":focus")).toHaveAttribute("aria-label", label.replace(/later$/, "earlier"));
  await page.keyboard.press("Enter");
  await expect(page.locator(":focus")).toHaveAttribute("aria-label", label);
  await page.keyboard.press("Enter");
  const mine = await plannerChoices(page);
  expect(mine).not.toEqual(suggested);
  await page.getByRole("button", { name: "Back to the board" }).click();
  await page.getByTestId("fair-board-next").click();
  expect(await plannerChoices(page)).toEqual(mine);
  await page.getByTestId("open-booth").click();
  await expect(page.getByTestId("skip-reveal")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("skip-reveal").click();
  const results = page.getByTestId("fair-results-screen");
  await expect(results).toBeVisible();
  const after = (await savedState(page)).showroom?.floor.find((set) => set.setId === pick.setId);
  if (after === undefined) throw new Error("The set did not come home");
  await expect(results).toContainText(
    after.mode === "sale"
      ? `back on the showroom floor, for sale at ${after.price} coins.`
      : "back on the showroom floor, on show.",
  );
  await expect(results).not.toContainText("For sale");
  await page.getByRole("button", { name: "Watch the reveal again" }).click();
  await expect(page.getByTestId("skip-reveal")).toBeVisible({ timeout: 1_000 });
  await page.getByTestId("skip-reveal").click();
  await expect(results).toBeVisible();
});
