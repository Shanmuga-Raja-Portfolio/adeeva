import { expect, test, type Page } from "@playwright/test";
import { shooter } from "../fixtures/screens";
import { tapMalletOnce } from "../fixtures/mallet";
import {
  advance,
  centreOf,
  coinsOf,
  drag,
  finishWorkshopStories,
  scrollToTop,
  svgToScreen,
  tracePath,
  type ScreenPoint,
} from "../fixtures/workshopPage";
import { isOutsideRequest } from "../fixtures/outsideRequest";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 820, height: 1180 },
] as const;

function densify(points: readonly ScreenPoint[], spacing: number): ScreenPoint[] {
  return points.flatMap((point, index) => {
    const next = points[index + 1];
    if (next === undefined) return [point];
    const steps = Math.max(1, Math.ceil(Math.hypot(next[0] - point[0], next[1] - point[1]) / spacing));
    return Array.from({ length: steps }, (_, step): ScreenPoint => [
      point[0] + ((next[0] - point[0]) * step) / steps,
      point[1] + ((next[1] - point[1]) * step) / steps,
    ]);
  });
}

async function layOutBoards(page: Page) {
  const canvas = page.getByTestId("layout-canvas");
  await canvas.scrollIntoViewIfNeeded();
  const [target] = await svgToScreen(canvas, [[3 + 9, 3 + 7]]);
  if (target === undefined) throw new Error("No board on the bench");
  await drag(page, await centreOf(page.getByTestId("tray-roof-1")), target, 24);
  await expect(canvas.locator('[data-part-id="roof-1"]')).toHaveCount(1);
  const showMe = page.getByTestId("show-me");
  for (let part = 0; part < 6; part += 1) await showMe.click();
  await expect(page.getByText("Every part fits. Lovely plan!")).toBeVisible();
}

async function sawFirstLineByHand(page: Page) {
  const bench = page.getByTestId("saw-bench");
  await bench.scrollIntoViewIfNeeded();
  const cut = JSON.parse((await bench.getAttribute("data-cut")) ?? "[]") as [number, number][];
  const screen = densify(await svgToScreen(bench, cut), 3);
  await tracePath(page, screen);
  await expect(page.locator(".ww-saw__chip--done")).toHaveCount(1);
}

async function sawRestOnRail(page: Page) {
  await page.getByRole("switch", { name: "Guide rail" }).click();
  for (let part = 0; part < 10; part += 1) {
    const rail = page.getByTestId("saw-rail");
    if ((await rail.count()) === 0) break;
    await rail.click();
    await expect(rail)
      .toBeEnabled({ timeout: 5000 })
      .catch(() => undefined);
  }
  await expect(page.getByText("Every part is cut out.")).toBeVisible();
}

async function tapMallet(page: Page, taps: number) {
  for (let tap = 0; tap < taps; tap += 1) await tapMalletOnce(page, () => page.getByTestId("mallet").click());
}

async function joinFirstByHand(page: Page) {
  const bench = page.getByTestId("join-bench");
  await bench.scrollIntoViewIfNeeded();
  for (let turn = 0; turn < 40; turn += 1) {
    const angle = Number(await bench.getAttribute("data-angle"));
    if (Math.abs(angle) <= 0.6) break;
    await page.getByTestId(angle > 0 ? "turn-left" : "turn-right").click();
  }
  await drag(
    page,
    await centreOf(page.getByTestId("joint-anchor")),
    await centreOf(page.getByTestId("joint-ghost-anchor")),
    20,
  );
  await expect.poll(async () => Number(await bench.getAttribute("data-gate"))).toBeLessThanOrEqual(1);
  await tapMallet(page, 2);
  await expect(page.locator(".ww-join__chip--done")).toHaveCount(1);
}

async function joinRestWithMagnet(page: Page) {
  await page.getByRole("switch", { name: "Magnet helper" }).click();
  for (let joint = 0; joint < 3; joint += 1) await tapMallet(page, 2);
  await expect(page.getByText("Every joint is tapped home.")).toBeVisible();
}

async function sandByHand(page: Page) {
  const bench = page.getByTestId("sand-bench");
  await bench.scrollIntoViewIfNeeded();
  for (let pass = 0; pass < 2; pass += 1)
    for (const row of [20, 60, 100, 140]) {
      const [left, right] = await svgToScreen(bench, [
        [8, row],
        [312, row],
      ]);
      if (left === undefined || right === undefined) throw new Error("No surface");
      await tracePath(page, [left, right, left, right]);
    }
  await expect(page.getByText(/is smooth!/)).toBeVisible();
}

for (const viewport of VIEWPORTS) {
  test.describe(`one commission on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test(`new game, the birdhouse through every step by hand, results, save and continue (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(300_000);
      const shot = shooter(page, testInfo, viewport.name);
      const outside: string[] = [];
      const problems: string[] = [];
      page.on("pageerror", (error) => problems.push(String(error)));
      page.on("console", (message) => {
        if (message.type() === "error") problems.push(message.text());
      });
      page.on("request", (request) => {
        if (isOutsideRequest(request.url())) outside.push(request.url());
      });
      await page.goto("/");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await expect(page.getByTestId("tile-workshop")).not.toContainText("In the workshop");
      await page.getByRole("link", { name: /Play Workshop & Wood/ }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Workshop & Wood" })).toBeVisible({
        timeout: 30_000,
      });
      await shot("01-title");

      await page.getByRole("button", { name: "New Game" }).click();
      await page.getByLabel("Name").fill("Juno");
      await page.getByRole("radio", { name: "Ponytail" }).click();
      await shot("02-new-game-you");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Perfectionist" }).click();
      await shot("03-new-game-trait");
      await page.getByRole("button", { name: "Next" }).click();
      await expect(page.getByRole("radio", { name: /Garage Workshop/ })).toHaveAttribute(
        "aria-checked",
        "true",
      );
      await shot("03b-new-game-career");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Relaxed" }).click();
      await shot("04-new-game-difficulty");
      await page.getByRole("button", { name: "Open the garage" }).click();
      await expect(page.getByRole("heading", { name: "Sawdust and Sunlight" })).toBeVisible();
      await shot("05-story");
      await finishWorkshopStories(page);

      await expect(page.getByTestId("workshop-hub")).toBeVisible();
      await shot("06-hub");
      const startCoins = await coinsOf(page, "stat-coins");
      expect(startCoins).toBe(100);
      await expect(page.getByTestId("offer-note")).toHaveAttribute("data-client", "grandpa-teodor");
      await page.getByRole("button", { name: "Accept Grandpa Teodor" }).click();
      await page.getByTestId("job-card").getByRole("button", { name: "Start building" }).click();

      await expect(page.getByRole("heading", { name: "The pinned note" })).toBeVisible();
      await shot("07-brief");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Design the piece" })).toBeVisible();
      await page.getByRole("radio", { name: /Garden Birdhouse/ }).click();
      await page.getByRole("radio", { name: /Rounded corners/ }).click();
      await page.getByRole("radio", { name: /Star cut-out/ }).click();
      await page.getByTestId("wood-pine").click();
      await shot("08-design");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Pell's Timber Yard" })).toBeVisible();
      await page.getByTestId("buy-plan").click();
      await expect(page.getByText(/On your rack: 1 board of Pine/)).toBeVisible();
      await scrollToTop(page);
      await shot("09-timber");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Plan your boards" })).toBeVisible();
      await layOutBoards(page);
      await scrollToTop(page);
      await shot("10-layout");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Saw the parts" })).toBeVisible();
      await sawFirstLineByHand(page);
      await shot("11-saw");
      await sawRestOnRail(page);
      await advance(page);

      await expect(page.getByRole("heading", { name: "Join it together" })).toBeVisible();
      await joinFirstByHand(page);
      await shot("12-join");
      await joinRestWithMagnet(page);
      await advance(page);

      await expect(page.getByRole("heading", { name: "Sand it smooth" })).toBeVisible();
      await sandByHand(page);
      await shot("13-sand");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Finish and extras" })).toBeVisible();
      await page.getByTestId("finish-chalk-paint").click();
      await scrollToTop(page);
      const canvasBox = await page.getByTestId("finish-canvas").boundingBox();
      if (canvasBox === null) throw new Error("No piece to decorate");
      const onPiece: ScreenPoint = [canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height * 0.45];
      await drag(page, await centreOf(page.getByTestId("extra-star-stencil")), onPiece, 20);
      await expect(page.getByTestId("placed-star-stencil")).toHaveCount(1);
      await scrollToTop(page);
      await shot("14-finish");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Ready to deliver" })).toBeVisible();
      await shot("15-review");
      await page.getByTestId("deliver").click();
      await expect(page.getByTestId("results")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Grandpa Teodor loves it!" })).toBeVisible();
      await expect(page.getByTestId("reward-totals")).toContainText("rep");
      await shot("16-results");
      await page.getByTestId("results-exit").click();
      await finishWorkshopStories(page);
      await expect(page.getByTestId("workshop-hub")).toBeVisible();
      const afterCoins = await coinsOf(page, "stat-coins");
      expect(afterCoins).not.toBe(startCoins);
      expect(afterCoins).toBeGreaterThan(startCoins);
      await shot("17-hub-after");

      await page.getByRole("button", { name: "Save & exit" }).click();
      await page.reload();
      await page.getByRole("button", { name: /^Continue/ }).click();
      await finishWorkshopStories(page);
      await expect(page.getByTestId("workshop-hub")).toBeVisible();
      expect(await coinsOf(page, "stat-coins")).toBe(afterCoins);
      expect(problems).toEqual([]);
      expect(outside).toEqual([]);
    });
  });
}

test("the studio opens Workshop & Wood and comes back home", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByRole("link", { name: /Play Workshop & Wood/ }).click();
  await expect(page).toHaveURL(/#\/workshop$/);
  await expect(page.getByRole("heading", { level: 1, name: "Workshop & Wood" })).toBeVisible();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);
});
