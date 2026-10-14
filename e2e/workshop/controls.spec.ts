import { expect, test, type Page } from "@playwright/test";
import { BIRDHOUSE_PLAN } from "../../src/games/workshop/core/testPlaythrough";
import { commissionAt, openPreparedBench } from "../fixtures/preparedWorkshop";
import { svgToScreen, type ScreenPoint } from "../fixtures/workshopPage";

const DESKTOP = { width: 1280, height: 800 };
const TABLET = { width: 820, height: 1180 };

function focusedTestId(page: Page): Promise<string | null> {
  return page.evaluate(() => document.activeElement?.getAttribute("data-testid") ?? null);
}

function focusedPartId(page: Page): Promise<string | null> {
  return page.evaluate(() => document.activeElement?.getAttribute("data-part-id") ?? null);
}

function linePoints(from: ScreenPoint, to: ScreenPoint, steps: number): ScreenPoint[] {
  return Array.from({ length: steps + 1 }, (_, index): ScreenPoint => {
    const t = index / steps;
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  });
}

test.describe("workshop controls", () => {
  test("a double-click on Deliver still shows the results on desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "review"));
    const deliver = page.getByTestId("deliver");
    await deliver.scrollIntoViewIfNeeded();
    await deliver.dblclick();
    await expect(page.getByTestId("results")).toBeVisible();
    await page.waitForTimeout(900);
    await expect(page.getByTestId("results")).toBeVisible();
    await expect(page.getByTestId("workshop-hub")).toHaveCount(0);
    await expect(page.getByTestId("results-exit")).toBeEnabled();
  });

  test("a very long sanding rub keeps every stroke, and a held arrow key rubs once", async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize(DESKTOP);
    await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "sand"));
    const sand = page.getByTestId("sand-bench");
    await sand.scrollIntoViewIfNeeded();
    const [left, right] = await svgToScreen(sand, [
      [10, 20],
      [310, 20],
    ]);
    if (left === undefined || right === undefined) throw new Error("No surface");
    await page.mouse.move(left[0], left[1]);
    await page.mouse.down();
    let moves = 0;
    for (let lap = 0; moves < 4200; lap += 1) {
      for (let step = 1; step <= 50; step += 1) {
        const share = lap % 2 === 0 ? step / 50 : 1 - step / 50;
        await page.mouse.move(left[0] + (right[0] - left[0]) * share, left[1] + (lap % 8) * 12);
        moves += 1;
      }
    }
    await expect.poll(async () => Number(await sand.getAttribute("data-strokes"))).toBeGreaterThan(40);
    await page.mouse.up();
    const afterRub = Number(await sand.getAttribute("data-strokes"));
    expect(afterRub).toBeGreaterThan(40);

    await sand.focus();
    for (let press = 0; press < 6; press += 1) await page.keyboard.down("ArrowRight");
    await page.keyboard.up("ArrowRight");
    await expect.poll(async () => Number(await sand.getAttribute("data-strokes"))).toBe(afterRub + 1);
  });

  test("a slow, very long saw line still counts when it is finished", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize(DESKTOP);
    await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "saw"));
    const bench = page.getByTestId("saw-bench");
    await bench.scrollIntoViewIfNeeded();
    const cut = JSON.parse((await bench.getAttribute("data-cut")) ?? "[]") as [number, number][];
    const corners = await svgToScreen(bench, cut);
    const start = corners[0];
    if (start === undefined) throw new Error("No pencil line");
    await page.mouse.move(start[0], start[1]);
    await page.mouse.down();
    await bench.evaluate((element, [x, y]) => {
      for (let index = 0; index < 20_100; index += 1)
        element.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            pointerId: 1,
            isPrimary: true,
            clientX: x + (index % 2),
            clientY: y + (index % 3),
          }),
        );
    }, start);
    const along = corners
      .slice(1)
      .flatMap((corner, index) => linePoints(corners[index] ?? corner, corner, 40));
    for (const point of along) await page.mouse.move(point[0], point[1]);
    await page.mouse.up();
    await expect(page.locator(".ww-saw__message")).toHaveText(/Clean cut|is cut out/);
  });

  for (const viewport of [DESKTOP, TABLET])
    test(`the joint's turn handle is at least 44 px at ${viewport.width} wide`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "join"));
      const handle = page.getByTestId("joint-turn");
      await handle.scrollIntoViewIfNeeded();
      await expect
        .poll(async () =>
          Math.min((await handle.boundingBox())?.width ?? 0, (await handle.boundingBox())?.height ?? 0),
        )
        .toBeGreaterThanOrEqual(44);
    });

  test("keyboard focus follows a part onto the board and back to the tray", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "layout"));
    const tray = page.getByTestId("tray-roof-1");
    await tray.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => focusedPartId(page)).toBe("roof-1");
    await page.keyboard.press("Delete");
    await expect.poll(() => focusedTestId(page)).toBe("tray-roof-1");
  });

  test("keyboard focus moves on to the next joint once one is tapped home", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "join"));
    await page.getByRole("switch", { name: /Magnet helper/ }).click();
    const done = page.locator(".ww-join__chip--done");
    await expect(done).toHaveCount(0);
    await page.getByTestId("mallet").focus();
    for (let tap = 0; tap < 8 && (await done.count()) === 0; tap += 1) {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(150);
    }
    await expect(done).toHaveCount(1);
    await expect.poll(() => focusedTestId(page)).toBe("joint-part");
  });
});
