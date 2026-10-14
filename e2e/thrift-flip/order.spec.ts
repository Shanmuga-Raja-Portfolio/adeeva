import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { finishStories } from "../fixtures/story";
import { advance, centreOf, coinsIn, drag, svgToScreen } from "../fixtures/thriftPage";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 820, height: 1180 },
] as const;

function shooter(page: Page, testInfo: TestInfo, prefix: string) {
  return async (name: string, fullPage = false) => {
    await page.waitForTimeout(350);
    await page.screenshot({
      path: testInfo.outputPath(`${prefix}-${name}.png`),
      fullPage,
      animations: "disabled",
    });
  };
}

async function scrollIntoView(page: Page, selector: string) {
  await page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo(0, Math.max(0, top));
    });
}

async function snipStitches(page: Page) {
  const bench = page.getByTestId("stitch-bench");
  await scrollIntoView(page, ".tf-workbench__table");
  const stitches = bench.locator('[data-stitch][data-popped="no"]');
  const first = await centreOf(stitches.nth(0).locator(".tf-stitch__hit"));
  const second = await centreOf(stitches.nth(1).locator(".tf-stitch__hit"));
  const spacing = Math.hypot(second[0] - first[0], second[1] - first[1]);
  const before = await bench.locator('[data-popped="yes"]').count();
  await drag(page, first, [first[0], first[1] + spacing * 0.55]);
  await expect(bench.locator('[data-popped="yes"]')).toHaveCount(before + 1);
  await page.getByRole("switch", { name: /Assist snip/ }).click();
  const chips = page.locator(".tf-workbench__lines .tf-line-chip");
  const lineCount = await chips.count();
  for (let line = 0; line < lineCount; line += 1) {
    await chips.nth(line).click();
    for (let guard = 0; guard < 20; guard += 1) {
      const open = page.getByTestId("stitch-bench").locator('[data-stitch][data-popped="no"]');
      if ((await open.count()) === 0) break;
      await page.mouse.click(...(await centreOf(open.first().locator(".tf-stitch__hit"))));
    }
  }
  const tabs = page.locator('.tf-workbench__top [role="tab"]');
  if ((await tabs.count()) > 1) {
    await tabs.nth(1).click();
    for (let line = 0; line < (await chips.count()); line += 1) {
      await chips.nth(line).click();
      for (let guard = 0; guard < 20; guard += 1) {
        const open = page.getByTestId("stitch-bench").locator('[data-stitch][data-popped="no"]');
        if ((await open.count()) === 0) break;
        await page.mouse.click(...(await centreOf(open.first().locator(".tf-stitch__hit"))));
      }
    }
  }
}

async function scrubOneStain(page: Page) {
  const scrubber = page.getByTestId("stain-scrubber");
  await scrollIntoView(page, ".tf-workbench__table");
  const box = await scrubber.boundingBox();
  if (box === null) throw new Error("No stain on the bench");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const radius = box.width * 0.17;
  await page.mouse.move(cx + radius, cy);
  await page.mouse.down();
  for (let turn = 0; turn < 40; turn += 1) {
    const angle = (turn / 8) * Math.PI * 2;
    await page.mouse.move(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, { steps: 4 });
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await expect.poll(async () => Number(await scrubber.getAttribute("data-scrub-ticks"))).toBeGreaterThan(0);
}

for (const viewport of VIEWPORTS) {
  test.describe(`a full order on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test(`new game, one order through every step, results, save and continue (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(300_000);
      const shot = shooter(page, testInfo, viewport.name);
      const outside: string[] = [];
      const problems: string[] = [];
      page.on("pageerror", (error) => problems.push(String(error)));
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
      });
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.hostname !== "localhost" && url.protocol !== "data:" && url.protocol !== "blob:")
          outside.push(request.url());
      });
      await page.goto("/");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await page.getByRole("link", { name: /Play Thrift-Flip Studio/ }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Thrift-Flip Studio" })).toBeVisible({
        timeout: 30_000,
      });
      await shot("01-title");

      await page.getByRole("button", { name: "New Game" }).click();
      await page.getByLabel("Name").fill("Rosa");
      await page.getByRole("radio", { name: "Curly puff" }).click();
      await shot("02-new-game-you");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Charmer" }).click();
      await shot("03-new-game-trait");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Relaxed" }).click();
      await shot("04-new-game-difficulty");
      await page.getByRole("button", { name: "Open the stall" }).click();
      await expect(page.locator(".ad-story")).toBeVisible();
      await shot("05-story");
      await finishStories(page);

      const hub = page.getByTestId("stall-hub");
      await expect(hub).toBeVisible();
      await shot("06-hub");
      const offer = page.getByTestId("offer-tag").first();
      const clientId = await offer.getAttribute("data-client");
      expect(["nana-bea", "juniper-wren"]).toContain(clientId);
      const recipe = clientId === "nana-bea" ? "cushion-cover" : "scrunchie-trio";
      await offer.getByRole("button", { name: "Accept" }).click();
      await page.getByTestId("gig-card").getByRole("button", { name: "Start flip" }).click();

      await expect(page.getByRole("heading", { name: "Meet the order" })).toBeVisible();
      await shot("07-brief");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Plan the flip" })).toBeVisible();
      await page.locator(`[data-recipe="${recipe}"]`).click();
      await shot("08-design");
      await advance(page);

      await expect(page.getByRole("heading", { name: "The market rail" })).toBeVisible();
      await shot("09-market-closed");
      await page.getByTestId("open-market").click();
      const fitting = page.locator('.tf-rail-find[data-fits="yes"]').first();
      await expect(fitting).toBeVisible();
      await fitting.locator(".tf-rail-find__art").click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await shot("10-market-closeup");
      await page.getByRole("button", { name: "Back to the rail" }).click();
      await fitting.locator(".tf-rail-find__pick").click();
      await page.getByTestId("buy-finds").click();
      await expect(page.locator(".tf-owned--used")).toHaveCount(1);
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("11-market-bought");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Snip old stitches" })).toBeVisible();
      await shot("12-unpick");
      await snipStitches(page);
      await shot("13-unpick-done");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Scrub the stains" })).toBeVisible();
      await scrubOneStain(page);
      await shot("14-clean-scrub");
      await page.getByRole("switch", { name: /Assist soak/ }).click();
      await page.getByTestId("soak").click();
      await expect(page.locator(".tf-soaked")).toBeVisible();
      await advance(page);

      await expect(page.getByRole("heading", { name: "Lay out the pieces" })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: "Lay out the pieces" })).toBeFocused();
      await page.getByTestId("auto-layout").click();
      await expect(page.locator(".tf-layout__ok")).toBeVisible();
      const board = page.locator(".tf-layout__svg");
      const piece = board.locator("[data-piece-id] .ad-placed-piece__hit").first();
      const from = await centreOf(piece);
      const boardBox = await board.boundingBox();
      if (boardBox === null) throw new Error("No board");
      await drag(page, from, [from[0] + boardBox.width * 0.08, from[1] + boardBox.height * 0.04]);
      await shot("15-layout-dragged");
      await page.getByTestId("auto-layout").click();
      await expect(page.locator(".tf-layout__ok")).toBeVisible();
      await shot("16-layout-ready");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Cutting table" })).toBeVisible();
      const mat = page.getByTestId("trace-mat");
      await expect(mat).toBeVisible();
      await scrollIntoView(page, ".tf-cut__mat");
      const outline = JSON.parse((await mat.getAttribute("data-outline")) ?? "[]") as [number, number][];
      const loop = [...outline, outline[0] ?? [0, 0], outline[1] ?? [0, 0]];
      const path = await svgToScreen(mat, loop);
      const start = path[0];
      if (start === undefined) throw new Error("No outline to trace");
      await page.mouse.move(start[0], start[1]);
      await page.mouse.down();
      for (const [index, point] of path.slice(1).entries()) {
        await page.mouse.move(point[0], point[1], { steps: 18 });
        if (index === Math.floor(path.length / 2)) await shot("17-cut-trace");
      }
      await page.mouse.up();
      await expect(page.getByTestId("keep-cut")).toBeVisible();
      await page.getByTestId("keep-cut").click();
      const firstPiece = page.locator(".tf-cut-item").first();
      await expect(firstPiece).toContainText("%");
      const hoursAtCut = await page.locator(".tf-flip-header__stats").innerText();
      await page.getByRole("button", { name: "Go back to Lay out" }).click();
      await expect(page.getByRole("heading", { name: "Lay out the pieces" })).toBeVisible();
      await advance(page);
      await expect(page.getByRole("heading", { name: "Cutting table" })).toBeVisible();
      await expect(firstPiece).toContainText("%");
      expect(await page.locator(".tf-flip-header__stats").innerText()).toBe(hoursAtCut);
      await page.getByRole("switch", { name: /Assist cut/ }).click();
      await page.getByTestId("commit-cut").click();
      await expect(page.locator(".tf-cut__done")).toBeVisible();
      await shot("18-cut-done");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Sewing machine" })).toBeVisible();
      const bed = page.getByTestId("sewing-bed");
      for (let seam = 0; seam < 6; seam += 1) {
        if (await page.getByTestId("advance-stage").isEnabled()) break;
        await scrollIntoView(page, ".ad-machine");
        const [x, y] = await centreOf(bed);
        await page.mouse.move(x, y);
        await page.mouse.down();
        if (seam === 0) {
          await expect
            .poll(async () => Number(await bed.getAttribute("data-progress")), { timeout: 20_000 })
            .toBeGreaterThan(0.3);
          await shot("19-sew");
        }
        await expect(bed).toHaveAttribute("data-done", "true", { timeout: 20_000 });
        await page.mouse.up();
        const next = page.getByTestId("next-seam");
        if (await next.isVisible()) await next.click();
      }
      await advance(page);

      await expect(page.getByRole("heading", { name: "Finishing touches" })).toBeVisible();
      await scrollIntoView(page, ".tf-finish");
      const preview = page.locator(".tf-finish__svg");
      const spots = await svgToScreen(preview, [
        [170, 190],
        [230, 230],
      ]);
      const chip = clientId === "nana-bea" ? '[data-finish="new-button"]' : '[data-finish="patch-heart"]';
      if (clientId === "nana-bea") await page.locator('[data-drawer="tin"]').click();
      const chipCentre = await centreOf(page.locator(chip));
      const [probeSpot] = spots;
      if (probeSpot === undefined) throw new Error("No spot");
      await page.mouse.move(chipCentre[0], chipCentre[1]);
      await page.mouse.down();
      await page.mouse.move(probeSpot[0], probeSpot[1], { steps: 14 });
      const ghost = await centreOf(page.locator(".tf-finish__ghost"));
      expect(Math.hypot(ghost[0] - probeSpot[0], ghost[1] - probeSpot[1])).toBeLessThan(60);
      await page.mouse.move(chipCentre[0], chipCentre[1], { steps: 6 });
      await page.mouse.up();
      if (clientId === "nana-bea") {
        for (const spot of spots)
          await drag(page, await centreOf(page.locator('[data-finish="new-button"]')), spot);
      } else {
        const [spot] = spots;
        if (spot === undefined) throw new Error("No spot");
        await drag(page, await centreOf(page.locator('[data-finish="patch-heart"]')), spot);
      }
      await expect(preview.locator("[data-finish-id]")).toHaveCount(clientId === "nana-bea" ? 2 : 1);
      await page.getByRole("button", { name: "Bigger" }).click();
      await shot("20-finish");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Ready to hand over" })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("21-review");
      const coinsBefore = await coinsIn(page.locator(".tf-flip-header__coins .ad-stat-chip__value"));
      await page.getByTestId("deliver").click();
      const results = page.getByTestId("results");
      await expect(results).toBeVisible();
      await expect(results.locator(".tf-criterion")).toHaveCount(8);
      await expect(page.getByTestId("before-after")).toBeVisible();
      await page.waitForTimeout(1200);
      await shot("22-results");
      await shot("23-results-full", true);
      await page.getByTestId("results-exit").click();
      await finishStories(page);
      await expect(hub).toBeVisible();
      const coinsAfter = await coinsIn(page.getByTestId("stat-coins"));
      expect(coinsAfter).toBeGreaterThan(coinsBefore);
      await shot("24-hub-after");

      await page.getByTestId("end-day").click();
      await expect(page.getByTestId("dawn-continue")).toBeVisible();
      await shot("25-day-transition");
      await page.getByTestId("dawn-continue").click();
      await finishStories(page);
      await page.getByRole("button", { name: "Settings" }).click();
      await shot("26-settings");
      await page.getByRole("button", { name: "Done" }).click();
      const savedCoins = await coinsIn(page.getByTestId("stat-coins"));

      await page.getByTestId("save-exit").click();
      await expect(page.getByRole("button", { name: /^Continue/ })).toBeVisible();
      await page.reload();
      await page.getByRole("button", { name: /^Continue/ }).click();
      await finishStories(page);
      await expect(hub).toBeVisible();
      expect(await coinsIn(page.getByTestId("stat-coins"))).toBe(savedCoins);
      await expect(page.locator(".tf-hero__day")).toHaveText("Day 2");
      expect(outside).toEqual([]);
      expect(problems).toEqual([]);
    });
  });
}
