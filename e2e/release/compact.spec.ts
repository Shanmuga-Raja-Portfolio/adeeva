import { expect, test, type Page } from "@playwright/test";
import { serialize as serializeChef } from "../../src/games/chef/core";
import { serialize as serializeThrift } from "../../src/games/thrift-flip/core";
import { openChefSave } from "../fixtures/chefPaths";
import { finishChefStories } from "../fixtures/chefKitchen";
import {
  adeevaAtMachine,
  adeevaLaidOut,
  adeevaStudent,
  bakeryAt,
  chefLessonAt,
  chefLessonAtCook,
  jewelleryAt,
  thriftFinish,
  thriftUnpick,
} from "../fixtures/compactStages";
import { openPreparedBakery, openPreparedBench as openBakeryBench } from "../fixtures/preparedBakery";
import { openPreparedGame } from "../fixtures/preparedGame";
import { nookAt, openPreparedRoom } from "../fixtures/preparedInterior";
import { openPreparedJewellery } from "../fixtures/preparedJewellery";
import {
  BENCH_PLAN,
  commissionAt,
  openPreparedBench as openWorkshopBench,
  openPreparedWorkshop,
} from "../fixtures/preparedWorkshop";
import { finishStories } from "../fixtures/story";
import { THRIFT_URL } from "../fixtures/thriftPage";
import { expectHubActionsAtTop, expectWorkTogether, isCompactScreen } from "../fixtures/workArea";
import { centreOf, drag } from "../fixtures/workshopPage";

test.skip(
  ({ viewport }) => !isCompactScreen(viewport),
  "Only short or narrow screens use the compact layout",
);

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function dismissCoach(page: Page): Promise<void> {
  const coach = page.getByTestId("coach-bubble");
  if ((await coach.count()) > 0) await coach.click();
  await expect(coach).toHaveCount(0);
}

test("Workshop: the boards sit beside the parts tray and a part drags onto a board", async ({
  page,
  browserName,
}) => {
  await openPreparedWorkshop(page, commissionAt("rosalind", BENCH_PLAN, "layout"));
  await expectHubActionsAtTop(page);
  await page.getByRole("button", { name: "Back to the workbench" }).first().click();
  await dismissCoach(page);
  const canvas = page.getByTestId("layout-canvas");
  const part = page.locator("[data-testid^='tray-']").nth(1);
  await expectWorkTogether(page, [canvas, part]);
  test.skip(browserName !== "chromium", "Playwright's WebKit phone has no finger to drag with");
  const before = await page.locator("[data-testid^='tray-']").count();
  const board = await canvas.boundingBox();
  if (board === null) throw new Error("No boards");
  await drag(page, await centreOf(part), [board.x + board.width * 0.45, board.y + board.height * 0.13]);
  await expect(page.locator("[data-testid^='tray-']")).toHaveCount(before - 1);
});

test("Workshop: the saw line and its controls fit together", async ({ page }) => {
  await openWorkshopBench(page, commissionAt("rosalind", BENCH_PLAN, "saw"));
  await dismissCoach(page);
  await expectWorkTogether(page, [page.getByTestId("saw-bench"), page.locator(".ww-saw__controls")]);
});

test("Patisserie: the scale and the pour pad, and the cake and its toppings, fit together", async ({
  page,
}) => {
  await openPreparedBakery(page, bakeryAt("weigh"));
  await expectHubActionsAtTop(page);
  await page.getByRole("button", { name: "Back to the bench" }).first().click();
  await expectWorkTogether(page, [page.locator(".pa-weigh-station__scale"), page.getByTestId("pour-pad")]);
  await openBakeryBench(page, bakeryAt("decorate"));
  await expectWorkTogether(page, [
    page.locator(".pa-decorate__cake"),
    page.locator("[data-testid^='topping-']").first(),
  ]);
});

test("Interior: the floor and its pieces fit together", async ({ page }) => {
  await openPreparedRoom(page, nookAt("floor"));
  await dismissCoach(page);
  await expectWorkTogether(page, [
    page.getByTestId("floor-area"),
    page.locator("[data-testid^='floor-candidate-']").first(),
  ]);
});

test("Jewellery: the lamp and the warm button, and the stone bench, fit together", async ({ page }) => {
  await openPreparedJewellery(page, jewelleryAt("join"));
  await expectHubActionsAtTop(page);
  await page.getByRole("button", { name: "Back to the bench" }).first().click();
  await dismissCoach(page);
  await expectWorkTogether(page, [page.getByTestId("lamp-bench"), page.getByTestId("warm-button")]);
  await openPreparedJewellery(page, jewelleryAt("set"));
  await page.getByRole("button", { name: "Back to the bench" }).first().click();
  await dismissCoach(page);
  await expectWorkTogether(page, [page.getByTestId("stone-bench"), page.getByTestId("press-claws")]);
});

test("Six Kitchens: the first station and the plate with its tray fit together", async ({ page }) => {
  for (const [state, parts] of [
    [
      chefLessonAtCook(),
      ["[data-testid=station-instruction]", "main.ck-dish section[aria-label$=' step'] svg"],
    ],
    [chefLessonAt("plate"), ["[data-testid=plate-canvas]", "[data-testid^='tray-']"]],
  ] as const) {
    await openChefSave(page, serializeChef(state));
    await finishChefStories(page);
    await expectHubActionsAtTop(page);
    await page.getByTestId("back-to-dish").click();
    await finishChefStories(page);
    await dismissCoach(page);
    await expectWorkTogether(
      page,
      parts.map((selector) => page.locator(selector).first()),
    );
  }
});

test("Thrift-Flip: the stitch bench, and the piece with its finishing drawer, fit together", async ({
  page,
}) => {
  for (const [state, parts] of [
    [thriftUnpick(), ["[data-testid=stitch-bench]"]],
    [thriftFinish(), [".tf-finish__svg", "[data-finish]"]],
  ] as const) {
    await page.goto(THRIFT_URL);
    await page.evaluate((json) => {
      window.localStorage.clear();
      window.localStorage.setItem("thrift-flip.save.1", json);
      window.localStorage.setItem("thrift-flip.lastSlot", "1");
    }, serializeThrift(state));
    await page.reload();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await finishStories(page);
    await expectHubActionsAtTop(page);
    await page
      .getByTestId("gig-card")
      .getByRole("button", { name: /^Continue/ })
      .click();
    await expectWorkTogether(
      page,
      parts.map((selector) => page.locator(selector).first()),
    );
  }
});

test("ADEEVA: the fabric and the pattern pieces, and the sewing bed, fit together", async ({ page }) => {
  await openPreparedGame(page, adeevaStudent());
  await expectHubActionsAtTop(page);
  for (const [state, parts] of [
    [adeevaLaidOut(), [".ad-layout-scroll", ".ad-piece-tray"]],
    [adeevaAtMachine(), ["[data-testid=sewing-bed]", ".ad-machine__hud"]],
  ] as const) {
    await openPreparedGame(page, state);
    await page
      .getByTestId("gig-card")
      .getByRole("button", { name: /^Continue/ })
      .click();
    await expectWorkTogether(
      page,
      parts.map((selector) => page.locator(selector).first()),
    );
  }
});
