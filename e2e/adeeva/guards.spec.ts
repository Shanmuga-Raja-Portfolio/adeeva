import { expect, test, type Page } from "@playwright/test";
import { openAdeeva } from "../fixtures/adeevaPage";
import {
  isWeekEnd,
  reduce,
  requiredSeams,
  serialize,
  type Action,
  type GameState,
} from "../../src/games/adeeva/core";
import {
  assembleToSew,
  dispatchAll,
  layoutAndCut,
  newTestGame,
  SIMPLE_DESIGN,
  sketchAndShop,
  TEST_SEAM_TICKS,
  withActiveGig,
} from "../../src/games/adeeva/core/testPlaythrough";
import { openPreparedGame, savedState, settleStories } from "../fixtures/preparedGame";
import { finishStories } from "../fixtures/story";
import { recordToasts, toastsSeen, toastsShownAfterPaint } from "../fixtures/toastLog";

const CRAFT_FLOW_CHUNK = "**/assets/CraftFlow-*.js";

function settledStudent(name = "Ada"): GameState {
  return settleStories(newTestGame({ seed: 7, name }));
}

function gigOnTable(): GameState {
  const withGig = withActiveGig(settledStudent(), "mom");
  const gig = withGig.gigs.active[withGig.gigs.active.length - 1];
  if (gig === undefined) throw new Error("No gig was added");
  return reduce(withGig, { type: "startRun", gigId: gig.id });
}

function expectStage(state: GameState, stage: string): GameState {
  if (state.activeRun?.stage !== stage) throw new Error(`Expected ${stage}, got ${state.activeRun?.stage}`);
  return state;
}

function cutAndRested(): GameState {
  return dispatchAll(layoutAndCut(sketchAndShop(gigOnTable())), [{ type: "endDay" }]);
}

function sewn(): GameState {
  const atSew = expectStage(assembleToSew(cutAndRested()), "sew");
  const run = atSew.activeRun;
  if (run === null) throw new Error("No run at the machine");
  const seams = requiredSeams(run.design).map((entry): Action => ({
    type: "recordSeam",
    seamId: entry.seam.id,
    progress: 1,
    ticks: TEST_SEAM_TICKS,
    insideTicks: Math.round(0.9 * TEST_SEAM_TICKS),
    assisted: false,
  }));
  return dispatchAll(atSew, [
    ...seams,
    { type: "openShop" },
    { type: "buyTrim", trimId: "button", count: 1 },
    { type: "closeShop" },
  ]);
}

function shortOfFabric(): GameState {
  const categories = Object.keys(SIMPLE_DESIGN) as (keyof typeof SIMPLE_DESIGN)[];
  return expectStage(
    dispatchAll(gigOnTable(), [
      { type: "goToStage", stage: "sketch" },
      ...categories.map((category): Action => ({
        type: "chooseSketchPart",
        category,
        partId: SIMPLE_DESIGN[category],
      })),
      ...categories.map((category): Action => ({
        type: "chooseSketchFabric",
        category,
        fabricId: "ivory-cotton",
      })),
      { type: "goToStage", stage: "fabric" },
      { type: "openShop" },
      { type: "buyFabric", fabricId: "ivory-cotton", metres: 0.5 },
      { type: "closeShop" },
      { type: "goToStage", stage: "cut" },
    ]),
    "cut",
  );
}

async function openTable(page: Page, state: GameState) {
  await openPreparedGame(page, state);
  await page
    .getByTestId("gig-card")
    .getByRole("button", { name: /^Continue/ })
    .click();
}

test("a double click on the advance button moves exactly one step, even across stages", async ({ page }) => {
  await openTable(page, sewn());
  await expect(page.getByRole("heading", { name: "Sewing machine" })).toBeVisible();
  await page.getByTestId("advance-stage").dblclick();
  await expect(page.getByRole("heading", { name: "Finishing touches" })).toBeVisible();
  await expect.poll(() => savedState(page, (state) => state.activeRun?.stage)).toBe("decorate");
  await page.getByTestId("advance-stage").dblclick();
  await expect(page.getByRole("heading", { name: "Final fitting" })).toBeVisible();
  await expect(page.getByTestId("deliver")).toBeVisible();
  await expect.poll(() => savedState(page, (state) => state.activeRun?.stage)).toBe("review");
});

test("a double click on Let go leaves the assistant at home", async ({ page }) => {
  await openPreparedGame(page, settledStudent());
  await page.getByRole("button", { name: /^Hire/ }).click();
  await expect(page.getByRole("button", { name: "Let go" })).toBeVisible();
  await page.getByRole("button", { name: "Let go" }).dblclick();
  await expect(page.getByRole("button", { name: /^Hire/ })).toBeVisible();
  await expect.poll(() => savedState(page, (state) => state.studio.assistantHired)).toBe(false);
});

test("a dress can be set aside from the table and from a blocked gig", async ({ page }) => {
  await openTable(page, sewn());
  await page.getByTestId("set-aside").click();
  const dialog = page.getByRole("dialog", { name: "Set aside this dress?" });
  await expect(dialog.getByRole("button", { name: "Keep working" })).toBeFocused();
  await expect(dialog).toContainText("fabric you have already cut stays used");
  await expect(dialog).toContainText("The gig stays in your list");
  await dialog.getByTestId("confirm-set-aside").click();
  await expect(page.getByTestId("studio-hub")).toBeVisible();
  await expect.poll(() => savedState(page, (state) => state.activeRun)).toBeNull();
  await expect(page.getByTestId("gig-card").getByRole("button", { name: "Start sewing" })).toBeEnabled();

  const twoGigs = withActiveGig(gigOnTable(), "mom");
  await openPreparedGame(page, twoGigs);
  const blocked = page.getByTestId("gig-card").filter({ hasText: "Set aside the current dress" });
  await expect(blocked).toHaveCount(1);
  await blocked.getByRole("button", { name: "Set aside the current dress" }).click();
  await page.getByTestId("confirm-set-aside").click();
  await expect.poll(() => savedState(page, (state) => state.activeRun)).toBeNull();
  await expect(page.getByTestId("gig-card").getByRole("button", { name: "Start sewing" })).toHaveCount(2);
});

test("a bolt that is too short can be topped up from the cutting table", async ({ page }) => {
  await openTable(page, shortOfFabric());
  await expect(page.getByRole("heading", { name: "Cutting table" })).toBeVisible();
  await expect(page.locator(".ad-layout-toolbar__fabric")).toContainText("× 50 cm");
  await page.getByTestId("top-up").click();
  const dialog = page.getByRole("dialog", { name: "Top up fabric" });
  await dialog.getByTestId("open-shop").click();
  const cotton = dialog.locator('.ad-shop-card[data-fabric="ivory-cotton"]');
  await cotton.getByRole("button", { name: /^Buy .* metres of/ }).click();
  await expect(cotton).not.toContainText("You own 0.5 m");
  await dialog.getByRole("button", { name: "Back to the cutting table" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator(".ad-layout-toolbar__fabric")).not.toContainText("× 50 cm");
  await expect.poll(() => savedState(page, (state) => state.calendar.shopOpen)).toBe(false);
  await expect
    .poll(() => savedState(page, (state) => state.inventory.fabricMetres["ivory-cotton"] ?? 0))
    .toBeGreaterThan(0.5);
});

test("pattern pieces, panels and trims can be placed with the keyboard", async ({ page }) => {
  await openTable(page, expectStage(sketchAndShop(gigOnTable()), "cut"));
  const piece = page.locator('[data-tray-piece="a-line-front"]');
  await piece.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('.ad-layout-board__bolt [data-piece-id="a-line-front"]')).toHaveCount(1);

  await openTable(
    page,
    expectStage(reduce(cutAndRested(), { type: "goToStage", stage: "assemble" }), "assemble"),
  );
  const panel = page.locator('[data-panel="fitted-front"]');
  await panel.focus();
  await page.keyboard.press("Enter");
  await expect(panel).toHaveAttribute("aria-pressed", "true");
  await page.locator('[data-slot="bodice-front"]').focus();
  await page.keyboard.press("Enter");
  await expect(panel).toBeDisabled();

  await openTable(page, expectStage(reduce(sewn(), { type: "goToStage", stage: "decorate" }), "decorate"));
  await page.locator('.ad-trim-chip[data-trim="button"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".ad-decorate-stage__doll [data-decoration]")).toHaveCount(1);
});

test("the day summary comes before the story, and both keep the studio behind them", async ({ page }) => {
  let state = settledStudent();
  while (!isWeekEnd(state.calendar.day)) state = settleStories(reduce(state, { type: "endDay" }));
  await openPreparedGame(page, state);
  const hub = page.locator(".ad-hub__content");
  await page.getByRole("button", { name: "End day" }).click();
  const start = page.getByRole("button", { name: "Start the day" });
  await expect(start).toBeVisible();
  await expect(start).toBeFocused();
  await expect(page.locator(".ad-story")).toHaveCount(0);
  await expect(hub).toHaveAttribute("inert", "");
  await start.click();
  const story = page.locator(".ad-story");
  await expect(story).toBeVisible();
  await expect(story.locator(".ad-story__footer button").first()).toBeFocused();
  await expect(hub).toHaveAttribute("inert", "");
  await finishStories(page);
  await expect(hub).not.toHaveAttribute("inert", "");
});

test("a failed save warns once and asks before leaving", async ({ page }) => {
  await openPreparedGame(page, settledStudent());
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    const tries = window as { failedSaves?: number };
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith("adeeva.save")) {
        tries.failedSaves = (tries.failedSaves ?? 0) + 1;
        throw new DOMException("The disk is full", "QuotaExceededError");
      }
      original.call(this, key, value);
    };
  });
  const failedSaves = () => page.evaluate(() => (window as { failedSaves?: number }).failedSaves ?? 0);
  const toasts = await recordToasts(page);
  const offers = page.getByTestId("offer-card");
  await offers
    .first()
    .getByRole("button", { name: /^Accept/ })
    .click();
  await expect.poll(() => toastsSeen(toasts, "We couldn't save", "warning")).toBe(1);
  const failedBefore = await failedSaves();
  await page.getByRole("button", { name: /^Hire/ }).click();
  await expect.poll(failedSaves).toBeGreaterThan(failedBefore);
  expect(await toastsShownAfterPaint(page, toasts, "We couldn't save", "warning")).toBe(1);

  await page.getByRole("button", { name: "Save & exit" }).click();
  const dialog = page.getByRole("dialog", { name: "We couldn't save" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Stay" })).toBeFocused();
  await dialog.getByRole("button", { name: "Stay" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("studio-hub")).toBeVisible();
  await page.getByRole("button", { name: "Save & exit" }).click();
  await dialog.getByRole("button", { name: "Leave anyway" }).click();
  await expect(page.getByRole("button", { name: "New Game", exact: true })).toBeVisible();
});

test("a browser that blocks storage shows one clear note and still lets you play", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Storage is blocked", "SecurityError");
      },
    });
  });
  await openAdeeva(page);
  await expect(page.getByTestId("saving-off")).toContainText("Saving is turned off in this browser");
  await expect(page.getByText("This save can't be opened.")).toHaveCount(0);
  await page.getByRole("button", { name: "New Game" }).click();
  await expect(page.getByLabel("Name")).toBeVisible();
});

test("Continue picks the slot that was played last", async ({ page }) => {
  await openAdeeva(page);
  await page.evaluate(
    ([first, second]) => {
      window.localStorage.clear();
      window.localStorage.setItem("adeeva.save.1", first);
      window.localStorage.setItem("adeeva.save.2", second);
      window.localStorage.setItem("adeeva.lastSlot", "1");
    },
    [serialize(settledStudent("Ada")), serialize(settledStudent("Bea"))] as const,
  );
  await page.reload();
  await expect(page.getByRole("button", { name: /^Continue/ })).toContainText("Ada");
  await page.getByRole("button", { name: "Load slot 2" }).click();
  await finishStories(page);
  await expect(page.getByTestId("studio-hub")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /^Continue/ })).toContainText("Bea");
});

test.describe("with the offline worker held back so the chunk can be blocked", () => {
  test.use({ serviceWorkers: "block" });

  test("a studio view that fails to load offers a reload and keeps the save", async ({ page }) => {
    await page.route(CRAFT_FLOW_CHUNK, (route) => route.abort());
    await openPreparedGame(page, withActiveGig(settledStudent(), "mom"));
    const savedOnClick = await page
      .getByTestId("gig-card")
      .getByRole("button", { name: "Start sewing" })
      .evaluate((button) => {
        (button as HTMLButtonElement).click();
        return window.localStorage.getItem("adeeva.save.1");
      });
    expect((JSON.parse(savedOnClick ?? "{}") as GameState).activeRun?.stage).toBe("brief");
    const failed = page.getByTestId("view-load-failed");
    await expect(failed).toBeVisible();
    await expect(failed).toContainText("This part of the studio didn't load. Reload to continue");
    expect(await savedState(page, (state) => state.activeRun?.stage)).toBe("brief");
    await page.unroute(CRAFT_FLOW_CHUNK);
    await failed.getByRole("button", { name: "Reload" }).click();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await finishStories(page);
    await page
      .getByTestId("gig-card")
      .getByRole("button", { name: /^Continue/ })
      .click();
    await expect(page.getByRole("heading", { name: "Meet the brief" })).toBeVisible();
  });
});

test("turning Assist sew on mid-seam keeps the machine running and marks the seam assisted", async ({
  page,
}) => {
  await openTable(page, expectStage(assembleToSew(cutAndRested()), "sew"));
  await expect(page.getByRole("heading", { name: "Sewing machine" })).toBeVisible();
  const bed = page.getByTestId("sewing-bed");
  const seamId = await page.locator(".ad-seam-item[aria-pressed='true']").getAttribute("data-seam");
  const box = await bed.boundingBox();
  if (box === null || seamId === null) throw new Error("The machine is not on screen");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect.poll(async () => Number(await bed.getAttribute("data-progress"))).toBeGreaterThan(0.1);
  const assist = page.getByRole("switch", { name: /Assist sew/ });
  await assist.focus();
  await page.keyboard.press("Space");
  await expect(assist).toHaveAttribute("aria-checked", "true");
  const afterToggle = Number(await bed.getAttribute("data-progress"));
  await expect.poll(async () => Number(await bed.getAttribute("data-progress"))).toBeGreaterThan(afterToggle);
  await expect(bed).toHaveAttribute("data-done", "true", { timeout: 20_000 });
  await page.mouse.up();
  await expect
    .poll(() => savedState(page, (state) => state.activeRun?.seams[seamId]))
    .toMatchObject({ progress: 1, assisted: true });
});

test("the sewing bed sews from the keyboard and stops when the page is hidden", async ({ page }) => {
  await openTable(page, expectStage(assembleToSew(cutAndRested()), "sew"));
  const bed = page.getByRole("button", { name: /hold Space, steer with the arrow keys/ });
  const seamId = await page.locator(".ad-seam-item[aria-pressed='true']").getAttribute("data-seam");
  if (seamId === null) throw new Error("No seam is picked");
  await bed.focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.down("Space");
  await expect.poll(async () => Number(await bed.getAttribute("data-progress"))).toBeGreaterThan(0.1);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => savedState(page, (state) => state.activeRun?.seams[seamId]?.progress ?? 0))
    .toBeGreaterThan(0.1);
  const stopped = await bed.getAttribute("data-progress");
  await page.evaluate(async () => {
    for (let frame = 0; frame < 30; frame += 1) await new Promise((done) => requestAnimationFrame(done));
  });
  await expect(bed).toHaveAttribute("data-progress", stopped ?? "");
  await page.keyboard.up("Space");
});
