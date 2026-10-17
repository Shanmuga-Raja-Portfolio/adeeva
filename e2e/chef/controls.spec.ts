import { expect, test, type Page } from "@playwright/test";
import {
  advance,
  finishChefStories,
  freshChef,
  newChef,
  sizzleByHand,
  svgToScreen,
  tasteByHand,
} from "../fixtures/chefKitchen";
import { chopClockAtLeast, holdChopBoard } from "../fixtures/chopBoardClock";

test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });

async function focusedTestId(page: Page): Promise<string> {
  return page.evaluate(() => document.activeElement?.getAttribute("data-testid") ?? "");
}

test("keyboard and touch players get fair, steady controls through a whole lesson", async ({ page }) => {
  test.setTimeout(240_000);
  await freshChef(page);
  await newChef(page, "Cookery Student", "Standard");
  await page.getByTestId("start-lesson").click();
  await expect(page.locator(".ck-story")).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByTestId("adult-badge")).toHaveText("Cook with an adult");
  await advance(page);

  const tiles = page.locator("[data-testid^='tile-']");
  const total = await tiles.count();
  await tiles.first().dblclick();
  await expect(tiles).toHaveCount(total - 1);
  await tiles.first().focus();
  for (let left = total - 1; left > 1; left -= 1) {
    await page.keyboard.press("Enter");
    await expect(tiles).toHaveCount(left - 1);
    expect(await focusedTestId(page)).toMatch(/^tile-/);
  }
  await page.keyboard.press("Enter");
  await expect(tiles).toHaveCount(0);
  await advance(page);

  await expect(page.getByTestId("coach-bubble")).toHaveCount(0);
  await expect(page.getByTestId("station-instruction")).toHaveText(
    "Tap Start chopping, then hold the board for the green stretch.",
  );
  const board = page.getByTestId("chop-board");
  const held = await holdChopBoard(page);
  const stretch = JSON.parse((await board.getAttribute("data-stretch")) ?? "null") as [number, number] | null;
  if (stretch === null) throw new Error("The first chop should be a mince");
  await page.getByTestId("chop-start").click();
  expect(await focusedTestId(page)).toBe("chop-surface");
  await chopClockAtLeast(page, held, stretch[0] - 15);
  await page.keyboard.down(" ");
  await chopClockAtLeast(page, held, stretch[1] - 15);
  await page.keyboard.up(" ");
  await expect(page.getByRole("button", { name: "Resume" })).toHaveCount(0);
  await expect(page.locator(".ck-step-scores")).toContainText(/Chop [1-9]\d*%/, { timeout: 10_000 });

  const pot = page.getByTestId("simmer-pot");
  const target = Number(await pot.getAttribute("data-target"));
  await pot.locator("svg.ck-pot").focus();
  await page.keyboard.down(" ");
  await page.waitForFunction(
    (line) =>
      Number(document.querySelector("[data-testid='simmer-pot']")?.getAttribute("data-level")) <= line,
    target + 0.01,
    { polling: "raf" },
  );
  await page.keyboard.up(" ");
  await page.getByTestId("off-the-heat").click();
  const simmer = await page.locator(".ck-step-scores li", { hasText: "Simmer" }).innerText();
  expect(Number(simmer.replace(/[^0-9]/g, ""))).toBeGreaterThan(80);

  await sizzleByHand(page);
  await tasteByHand(page);
  await finishChefStories(page);
  await advance(page);

  await page.locator("[data-testid^='tray-']").nth(1).focus();
  await page.keyboard.press("Enter");
  const placed = page.locator("[data-testid^='placed-']").first();
  const start = await placed.boundingBox();
  if (start === null) throw new Error("Nothing on the plate");
  const cdp = await page.context().newCDPSession(page);
  const x = start.x + start.width / 2;
  const y = start.y + start.height / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 20, y: y + 20 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  const cancelled = await placed.boundingBox();
  const [empty] = await svgToScreen(page.getByTestId("plate-canvas"), [[60, 200]]);
  if (empty === undefined || cancelled === null) throw new Error("No plate");
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: empty[0], y: empty[1] }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: empty[0] + 15, y: empty[1] + 5 }],
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const after = await placed.boundingBox();
  if (after === null) throw new Error("The piece left the plate");
  expect(Math.abs(after.x - cancelled.x)).toBeLessThan(8);
  expect(Math.abs(after.y - cancelled.y)).toBeLessThan(8);
});
