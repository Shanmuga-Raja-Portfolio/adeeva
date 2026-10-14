import { expect, test, type Page } from "@playwright/test";
import { shooter } from "../fixtures/screens";
import { reduce, seamLineAt } from "../../src/games/workshop/core";
import { BIRDHOUSE_PLAN } from "../../src/games/workshop/core/testPlaythrough";
import {
  BENCH_PLAN,
  commissionAt,
  openPreparedBench,
  openPreparedWorkshop,
} from "../fixtures/preparedWorkshop";
import {
  advance,
  centreOf,
  drag,
  finishWorkshopStories,
  svgToScreen,
  type ScreenPoint,
} from "../fixtures/workshopPage";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 820, height: 1180 },
] as const;

async function sewAlongTheLine(page: Page) {
  const strip = page.getByTestId("cushion-seam");
  await strip.scrollIntoViewIfNeeded();
  const yFor = (offset: number) => 60 + (offset / 0.32) * 48;
  const [start] = await svgToScreen(strip, [[120, yFor(seamLineAt(0))]]);
  if (start === undefined) throw new Error("No seam strip");
  await page.mouse.move(start[0], start[1]);
  await page.mouse.down();
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const progress = Number(await strip.getAttribute("data-progress"));
    if (progress >= 1) break;
    const [point] = await svgToScreen(strip, [[120, yFor(seamLineAt(Math.min(1, progress + 0.012)))]]);
    if (point !== undefined) await page.mouse.move(point[0], point[1], { steps: 2 });
    await page.waitForTimeout(25);
  }
  await page.mouse.up();
  await expect(page.getByText("The cushion seam is sewn. So cosy!")).toBeVisible();
}

for (const viewport of VIEWPORTS) {
  test.describe(`workbench close-ups on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test(`a window bench gets a hand-sewn cushion and goes to the café (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(240_000);
      const shot = shooter(page, testInfo, viewport.name);
      const nextMorning = reduce(commissionAt("rosalind", BENCH_PLAN, "finish"), { type: "endDay" });
      await openPreparedWorkshop(page, nextMorning);
      await shot("20-hub-on-bench");
      await page.getByRole("button", { name: "Back to the workbench" }).first().click();
      await expect(page.getByRole("heading", { name: "Finish and extras" })).toBeVisible();
      await page.getByTestId("finish-beeswax").click();
      await page.getByRole("radio", { name: "Blush Floral" }).click();
      await sewAlongTheLine(page);
      await shot("21-cushion");
      await advance(page);
      await expect(page.getByRole("heading", { name: "Ready to deliver" })).toBeVisible();
      await expect(page.getByTestId("bench-hours")).toContainText("8 h");
      await page.getByTestId("deliver").click();
      await expect(page.getByTestId("results")).toBeVisible();
      await page.waitForTimeout(2600);
      await shot("22-results-cafe");
      await page.getByTestId("results-exit").click();
      await finishWorkshopStories(page);
      await page.getByTestId("end-day").click();
      await expect(page.getByRole("heading", { name: /Good morning! Day/ })).toBeVisible();
      await shot("23-day-transition");
      await page.getByRole("button", { name: "Open the garage" }).click();
      await finishWorkshopStories(page);
      await page.getByRole("button", { name: "Settings" }).click();
      await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
      await shot("24-settings");
    });

    test(`a knot turns a part away, and close-ups show sawdust, dust and the joint shadow (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(240_000);
      const shot = shooter(page, testInfo, viewport.name);
      const laying = commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "layout");
      const board = laying.boards[0];
      if (board === undefined) throw new Error("No board");
      await openPreparedBench(page, { ...laying, boards: [{ ...board, knots: [{ x: 12, y: 8, r: 3 }] }] });
      const canvas = page.getByTestId("layout-canvas");
      const [onKnot] = await svgToScreen(canvas, [[3 + 9, 3 + 7]]);
      if (onKnot === undefined) throw new Error("No board");
      await drag(page, await centreOf(page.getByTestId("tray-roof-1")), onKnot, 20);
      await expect(page.getByText("That spot has a knot. Try somewhere else.")).toBeVisible();
      await expect(canvas.locator('[data-part-id="roof-1"]')).toHaveCount(0);
      await shot("30-layout-knot");

      await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "saw"));
      const bench = page.getByTestId("saw-bench");
      await bench.scrollIntoViewIfNeeded();
      const cut = JSON.parse((await bench.getAttribute("data-cut")) ?? "[]") as [number, number][];
      const screen = await svgToScreen(bench, cut);
      const [first, second] = screen;
      if (first === undefined || second === undefined) throw new Error("No pencil line");
      await page.mouse.move(first[0], first[1]);
      await page.mouse.down();
      const middle: ScreenPoint = [(first[0] + second[0]) / 2, (first[1] + second[1]) / 2];
      await page.mouse.move(middle[0], middle[1], { steps: 30 });
      await shot("31-saw-stroke");
      await page.mouse.up();
      await expect(page.getByText("Keep sawing to the end.")).toBeVisible();

      await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "join"));
      await expect(page.getByTestId("join-bench")).toBeVisible();
      await page.getByTestId("mallet").click();
      await expect(page.getByText("Nudge it a little closer.")).toBeVisible();
      await shot("32-join-start");

      await openPreparedBench(page, commissionAt("grandpa-teodor", BIRDHOUSE_PLAN, "sand"));
      const sand = page.getByTestId("sand-bench");
      await sand.scrollIntoViewIfNeeded();
      const [left, right] = await svgToScreen(sand, [
        [10, 30],
        [300, 30],
      ]);
      if (left === undefined || right === undefined) throw new Error("No surface");
      await drag(page, left, right, 16);
      await expect.poll(async () => Number(await sand.getAttribute("data-strokes"))).toBeGreaterThan(0);
      await shot("33-sand-dusty");
    });
  });
}
