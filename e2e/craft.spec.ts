import { expect, test, type Locator, type Page } from "@playwright/test";
import { reduce, serialize, type GameState } from "../src/core";
import { newTestGame } from "../src/core/testPlaythrough";
import { finishStories } from "./fixtures/story";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 820, height: 1180 },
] as const;

const LAYOUT_TARGETS: Readonly<Record<string, readonly [number, number]>> = {
  "a-line-front": [34, 34],
  "a-line-back": [107, 34],
  "fitted-front": [24, 93],
  "fitted-back": [78, 93],
  "peter-pan": [121, 78],
};

const SLOTS: Readonly<Record<string, string>> = {
  "fitted-front": "bodice-front",
  "fitted-back": "bodice-back",
  "peter-pan": "neckline",
  "a-line-front": "skirt-front",
  "a-line-back": "skirt-back",
};

function seededGigSave(): GameState {
  for (let seed = 1; seed < 200; seed += 1) {
    const fresh = newTestGame({ seed });
    const offer = fresh.gigs.offers.find((entry) => entry.clientId === "mom");
    if (offer === undefined) continue;
    const seen = fresh.story.queue.reduce<GameState>(
      (state, beatId) => reduce(state, { type: "markBeatSeen", beatId }),
      fresh,
    );
    return reduce(seen, { type: "acceptOffer", offerId: offer.id });
  }
  throw new Error("No seed offered the birthday dinner gig");
}

async function svgToScreen(
  svg: Locator,
  points: readonly (readonly [number, number])[],
): Promise<[number, number][]> {
  return svg.evaluate((element, list) => {
    const matrix = (element as SVGSVGElement).getScreenCTM();
    if (matrix === null) return [];
    return list.map(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix);
      return [point.x, point.y] as [number, number];
    });
  }, points);
}

async function centreOf(locator: Locator): Promise<[number, number]> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("Element is not visible");
  return [box.x + box.width / 2, box.y + box.height / 2];
}

async function drag(page: Page, from: readonly [number, number], to: readonly [number, number]) {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move(from[0] + 12, from[1] + 6, { steps: 3 });
  await page.mouse.move(to[0], to[1], { steps: 14 });
  await page.mouse.up();
}

async function advance(page: Page) {
  const button = page.getByTestId("advance-stage");
  await expect(button).toBeEnabled();
  await button.click();
}

async function scrollToTop(locator: Locator) {
  await locator.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo(0, Math.max(0, top));
  });
}

for (const viewport of VIEWPORTS) {
  test.describe(`craft loop on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test(`a student gig goes from brief to delivery through every stage (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(240_000);
      const shot = async (name: string) => {
        await page.screenshot({
          path: testInfo.outputPath(`${viewport.name}-${name}.png`),
          animations: "disabled",
        });
      };
      const save = serialize(seededGigSave());
      await page.goto("/");
      await page.evaluate((json) => {
        window.localStorage.clear();
        window.localStorage.setItem("adeeva.save.1", json);
        window.localStorage.setItem("adeeva.lastSlot", "1");
        window.localStorage.setItem(
          "adeeva.settings",
          JSON.stringify({ reducedMotion: false, assistCut: false, assistSew: false }),
        );
      }, save);
      await page.reload();
      await page.getByRole("button", { name: /^Continue/ }).click();
      await finishStories(page);
      await page.getByTestId("gig-card").getByRole("button", { name: "Start sewing" }).click();

      await expect(page.getByRole("heading", { name: "Meet the brief" })).toBeVisible();
      await expect(page.locator(".ad-brief-card__name")).toHaveText("Mom");
      await shot("01-brief");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Sketch the dress" })).toBeVisible();
      for (const name of ["Fitted Bodice", "Peter Pan Collar", "Sleeveless", "A-line Skirt"])
        await page.locator(".ad-part-card", { hasText: name }).click();
      await page.locator('.ad-fabric-palette [data-fabric="ivory-cotton"]').click();
      await expect(page.locator(".ad-fabric-palette__target", { hasText: "Skirt" })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("02-sketch");
      await advance(page);

      await expect(page.getByRole("heading", { name: "The fabric shop" })).toBeVisible();
      await page.getByTestId("open-shop").click();
      const cotton = page.locator('.ad-shop-card[data-fabric="ivory-cotton"]');
      await expect(cotton).toContainText("design needs about 1.5 m");
      await cotton.getByRole("button", { name: /^Buy 1.5 metres/ }).click();
      await expect(cotton).toContainText("You own 1.5 m");
      const buttons = page.locator('.ad-trim-card[data-trim="button"]');
      await buttons.getByRole("button", { name: /^Buy 2 Covered Button/ }).click();
      await expect(buttons).toContainText("2 on hand");
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("03-fabric-shop");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Cutting table" })).toBeVisible();
      await page.getByRole("button", { name: "Zoom out" }).click();
      await page.getByRole("button", { name: "Zoom out" }).click();
      await scrollToTop(page.locator(".ad-layout-workspace"));
      const bolt = page.locator(".ad-layout-board__bolt");
      for (const [pieceId, target] of Object.entries(LAYOUT_TARGETS)) {
        const trayPiece = page.locator(`[data-tray-piece="${pieceId}"]`);
        await trayPiece.scrollIntoViewIfNeeded();
        const source = await centreOf(trayPiece);
        const [screen] = await svgToScreen(bolt, [target]);
        if (screen === undefined) throw new Error("Bolt is not on screen");
        await drag(page, source, screen);
        await expect(bolt.locator(`[data-piece-id="${pieceId}"]`)).toHaveCount(1);
      }
      await bolt.locator('[data-piece-id="a-line-front"] .ad-placed-piece__hit').click();
      await page.getByRole("button", { name: "Turn Skirt front right 45 degrees" }).click();
      await expect(page.locator(".ad-piece-inspector")).toContainText("On the bias");
      await scrollToTop(page.locator(".ad-layout-workspace"));
      await shot("04-cut-layout-bias");
      await page.getByRole("button", { name: "Turn Skirt front left 45 degrees" }).click();
      await expect(page.locator(".ad-piece-inspector")).toContainText("Straight grain");
      await scrollToTop(page.locator(".ad-layout-workspace"));
      await shot("05-cut-layout");
      await page.getByTestId("start-cutting").click();

      const mat = page.getByTestId("trace-mat");
      await expect(mat).toBeVisible();
      await scrollToTop(page.locator(".ad-cut-session"));
      const outline = JSON.parse((await mat.getAttribute("data-outline")) ?? "[]") as [number, number][];
      const loop = [...outline, outline[0] ?? [0, 0], outline[1] ?? [0, 0]];
      const path = await svgToScreen(mat, loop);
      const first = path[0];
      if (first === undefined) throw new Error("No outline to trace");
      await page.mouse.move(first[0], first[1]);
      await page.mouse.down();
      for (const [index, point] of path.slice(1).entries()) {
        await page.mouse.move(point[0], point[1], { steps: 18 });
        if (index === Math.floor(path.length / 2)) await shot("06-cut-trace");
      }
      await page.mouse.up();
      await expect(page.getByTestId("keep-cut")).toBeVisible();
      await expect(page.locator(".ad-trace__result")).toContainText("on the line");
      await shot("07-cut-traced");
      await page.getByTestId("keep-cut").click();
      await page.getByRole("switch", { name: /Assist cut/ }).click();
      await expect(page.locator(".ad-cut-item", { hasText: "Skirt front" })).toContainText("80% assist");
      await page.getByTestId("commit-cut").click();
      await expect(page.locator(".ad-cut-done")).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("08-cut-done");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Dress form" })).toBeVisible();
      await scrollToTop(page.locator(".ad-assemble-stage"));
      const form = page.locator(".ad-assemble-stage__form > svg");
      await drag(
        page,
        await centreOf(page.locator('[data-panel="a-line-front"]')),
        await centreOf(form.locator('[data-slot="bodice-front"] rect')),
      );
      await expect(page.locator(".ad-assemble-feedback--gentle")).toContainText("belongs on the skirt front");
      await shot("09-assemble-wrong-slot");
      for (const [pieceId, slot] of Object.entries(SLOTS)) {
        await drag(
          page,
          await centreOf(page.locator(`[data-panel="${pieceId}"]`)),
          await centreOf(form.locator(`[data-slot="${slot}"] rect`)),
        );
        await expect(page.locator(`[data-panel="${pieceId}"]`)).toBeDisabled();
      }
      await shot("10-assemble-done");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Sewing machine" })).toBeVisible();
      const bed = page.getByTestId("sewing-bed");
      for (let seam = 0; seam < 8; seam += 1) {
        if (await page.getByTestId("advance-stage").isEnabled()) break;
        await scrollToTop(page.locator(".ad-machine"));
        const [x, y] = await centreOf(bed);
        await page.mouse.move(x, y);
        await page.mouse.down();
        if (seam === 0) {
          await expect
            .poll(async () => Number(await bed.getAttribute("data-progress")), { timeout: 20_000 })
            .toBeGreaterThan(0.2);
          await shot("11-sew-running");
        }
        await expect(bed).toHaveAttribute("data-progress", "1.000", { timeout: 20_000 });
        await page.mouse.up();
        if (seam === 0) await shot("12-sew-seam-done");
        const next = page.getByTestId("next-seam");
        if (await next.isVisible()) await next.click();
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("13-sew-all-done");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Finishing touches" })).toBeVisible();
      await scrollToTop(page.locator(".ad-decorate-stage"));
      const doll = page.locator(".ad-decorate-stage__doll > svg");
      const spots = await svgToScreen(doll, [
        [200, 196],
        [200, 236],
      ]);
      for (const spot of spots)
        await drag(page, await centreOf(page.locator('.ad-trim-chip[data-trim="button"]')), spot);
      await expect(doll.locator("[data-decoration]")).toHaveCount(2);
      await page.getByRole("button", { name: "Bigger" }).click();
      await shot("14-decorate");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Final fitting" })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("15-review");
      const coinsAtReview = Number(
        (
          await page.locator(".ad-craft-header .ad-stat-chip--coins .ad-stat-chip__value").innerText()
        ).replace(/\D/g, ""),
      );
      await page.getByTestId("deliver").click();

      const results = page.getByTestId("results");
      await expect(results).toBeVisible();
      await expect(results.locator(".ad-craft-criterion")).toHaveCount(7);
      await expect(results.locator(".ad-craft-results__total--coins")).toContainText("+");
      const scoreNumber = results.locator(".ad-craft-results__score-number");
      const finalScore = ((await scoreNumber.getAttribute("aria-label")) ?? "")
        .replace(/\D+/g, " ")
        .trim()
        .split(" ")[0];
      await expect(scoreNumber).toHaveText(finalScore ?? "", { timeout: 10_000 });
      await shot("16-results");
      await results.locator(".ad-craft-results__details").scrollIntoViewIfNeeded();
      await shot("17-results-details");
      await page.getByTestId("results-exit").click();
      await finishStories(page);
      await expect(page.getByTestId("studio-hub")).toBeVisible();
      const coinsAfter = Number((await page.getByTestId("stat-coins").innerText()).replace(/\D/g, ""));
      expect(coinsAfter).toBeGreaterThan(coinsAtReview);
    });
  });
}
