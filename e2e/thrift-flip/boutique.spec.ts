import { expect, test, type Page } from "@playwright/test";
import {
  openThriftSave,
  showcaseSave,
  swapDaySave,
  thresholdSave,
  tillDaySave,
} from "../fixtures/boutiqueSaves";
import { shooter } from "../fixtures/screens";
import { finishStories } from "../fixtures/story";
import { scrollIntoView, scrubOneStain, sewSeams, snipStitches } from "../fixtures/thriftBench";
import { advance, centreOf, coinsIn, drag, svgToScreen } from "../fixtures/thriftPage";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 820, height: 1180 },
] as const;

function watchPage(page: Page): { readonly outside: string[]; readonly problems: string[] } {
  const outside: string[] = [];
  const problems: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "localhost" && url.protocol !== "data:" && url.protocol !== "blob:")
      outside.push(request.url());
  });
  page.on("pageerror", (error) => problems.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
  });
  return { outside, problems };
}

async function storiesUntilChoice(page: Page) {
  const choice = page.getByTestId("story-choice-open");
  for (let step = 0; step < 30; step += 1) {
    if (await choice.isVisible()) return;
    await page.locator(".ad-story .ad-story__footer button").first().click();
  }
  await expect(choice).toBeVisible();
}

for (const viewport of VIEWPORTS) {
  test.describe(`the Resale Boutique on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test(`unlock, open the boutique, mend a ticket, dress the window, save and reload (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(300_000);
      const shot = shooter(page, testInfo, viewport.name);
      const watch = watchPage(page);
      await openThriftSave(page, thresholdSave());
      await finishStories(page);
      const hub = page.getByTestId("stall-hub");
      await expect(hub).toHaveAttribute("data-career", "stall");
      await expect(page.getByTestId("larkspur-card")).toBeVisible();
      await scrollIntoView(page, '[data-testid="larkspur-card"]');
      await shot("b01-larkspur-card");
      await page.evaluate(() => window.scrollTo(0, 0));

      await page.getByTestId("open-stall").click();
      await page.getByTestId("hold-stall").click();
      await page.getByTestId("stall-done").click();
      await finishStories(page);
      await page.getByTestId("end-day").click();
      await page.getByTestId("dawn-continue").click();
      await storiesUntilChoice(page);
      await shot("b02-offer-beat");
      await page.getByTestId("story-choice-open").click();
      await expect(page.getByTestId("confirm-sign")).toBeVisible();
      await page.getByTestId("sign-patch-and-pocket").click();
      await shot("b03-sign-picker");
      await page.getByTestId("confirm-sign").click();
      await expect(page.locator(".ad-story__title")).toHaveText("The New Sign");
      await page.waitForTimeout(400);
      await shot("b04-new-sign-beat");
      await finishStories(page);
      await expect(hub).toHaveAttribute("data-career", "boutique");
      await expect(page.locator(".tf-hero__text h2")).toHaveText("Patch & Pocket");
      await shot("b05-boutique-hub");
      await shot("b06-boutique-hub-full", true);

      const ticket = page.locator('[data-testid="offer-tag"][data-kind="mend"]').first();
      await ticket.getByRole("button", { name: "Accept" }).click();
      await page.getByTestId("gig-card").getByRole("button", { name: "Start mend" }).click();
      await expect(page.getByRole("heading", { level: 1, name: "A loved thing comes in" })).toBeVisible();
      await shot("b07-ticket-brief");
      await advance(page);

      await expect(page.getByRole("heading", { level: 1, name: "Snip the old split" })).toBeVisible();
      await expect(page.locator(".tf-workbench__lines .tf-line-chip")).toHaveCount(1);
      await snipStitches(page);
      await shot("b08-ticket-unpick");
      await advance(page);

      await expect(page.getByRole("heading", { level: 1, name: "Scrub the stains" })).toBeVisible();
      await scrubOneStain(page);
      await page.getByRole("switch", { name: /Assist soak/ }).click();
      await page.getByTestId("soak").click();
      await advance(page);

      await expect(page.getByRole("heading", { level: 1, name: "Sew it closed" })).toBeVisible();
      await sewSeams(page, () => shot("b09-ticket-sew"));
      await advance(page);

      await expect(page.getByRole("heading", { level: 1, name: "Finishing touches" })).toBeVisible();
      await scrollIntoView(page, ".tf-finish");
      await page.locator('[data-drawer="marks"]').click();
      const darn = page.locator('[data-finish="mend-darn"]');
      await expect(darn).toContainText("free on tickets");
      const [spot] = await svgToScreen(page.locator(".tf-finish__svg"), [[200, 220]]);
      if (spot === undefined) throw new Error("No spot");
      await drag(page, await centreOf(darn), spot);
      await expect(page.locator(".tf-finish__svg [data-finish-id]")).toHaveCount(1);
      await shot("b10-ticket-finish");
      const coinsBefore = await coinsIn(page.locator(".tf-flip-header__coins .ad-stat-chip__value"));
      await advance(page);

      await expect(page.getByRole("heading", { level: 1, name: "Ready to hand it back" })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot("b11-ticket-review");
      await page.getByTestId("deliver").click();
      await expect(page.getByTestId("results")).toBeVisible();
      await expect(page.getByTestId("results").locator(".tf-criterion")).toHaveCount(8);
      await page.waitForTimeout(1200);
      await shot("b12-ticket-results");
      await page.getByTestId("results-exit").click();
      await finishStories(page);
      expect(await coinsIn(page.getByTestId("stat-coins"))).toBeGreaterThan(coinsBefore);
      await expect(page.getByTestId("kept-in-use")).toHaveText("1");

      await page.getByTestId("open-window").click();
      await expect(page.getByTestId("window-screen")).toBeVisible();
      await page.getByTestId("buy-prop-paper-moon").click();
      await page.getByTestId("window-prop-paper-moon").click();
      await page.getByTestId("window-add-piece-1").click();
      await page.getByTestId("window-add-piece-2").click();
      const piece = page.locator('[data-window-item="piece:piece-2"]');
      const from = await centreOf(piece);
      const frame = await page.locator(".tf-window-screen__scene").boundingBox();
      if (frame === null) throw new Error("No window");
      await drag(page, from, [frame.x + frame.width * 0.84, from[1]]);
      await page.locator(".tf-window-screen__stage").focus();
      await page.keyboard.press("ArrowUp");
      await expect(page.getByTestId("window-total")).not.toHaveText("0");
      await shot("b13-window");
      await page.getByTestId("window-back").click();
      await expect(page.getByRole("dialog", { name: "Leave without dressing the window?" })).toBeVisible();
      await page.getByTestId("keep-draft").click();
      await expect(page.locator('[data-window-item="piece:piece-2"]')).toHaveCount(1);
      await page.getByTestId("dress-window").click();
      await expect(page.getByTestId("dress-window")).toBeDisabled();
      await page.getByRole("button", { name: "Back to the shop" }).click();
      await finishStories(page);
      await expect(page.getByTestId("window-card")).toContainText("buzz on Till Day");
      const savedCoins = await coinsIn(page.getByTestId("stat-coins"));

      await page.getByTestId("save-exit").click();
      await expect(page.getByTestId("slot-place")).toContainText("Patch & Pocket");
      await page.reload();
      await page.getByRole("button", { name: /^Continue/ }).click();
      await finishStories(page);
      await expect(hub).toHaveAttribute("data-career", "boutique");
      expect(await coinsIn(page.getByTestId("stat-coins"))).toBe(savedCoins);
      await expect(page.getByTestId("kept-in-use")).toHaveText("1");
      await expect(
        page.getByTestId("window-card").locator('[data-window-item="prop:paper-moon"]'),
      ).toHaveCount(1);
      const saved = await page.evaluate(() => window.localStorage.getItem("thrift-flip.save.1"));
      expect(JSON.parse(saved ?? "{}").schemaVersion).toBe(2);
      expect(watch.outside).toEqual([]);
      expect(watch.problems).toEqual([]);
    });

    test(`stage the Upcycle Showcase with the keyboard, watch it and read the kind panels (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(180_000);
      const shot = shooter(page, testInfo, viewport.name);
      const watch = watchPage(page);
      await openThriftSave(page, showcaseSave());
      await finishStories(page);
      await expect(page.getByTestId("open-showcase")).toBeVisible();
      await scrollIntoView(page, '[data-testid="season-panel"]');
      await shot("b14-season-panel");
      await page.getByTestId("open-showcase").focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("showcase-planner")).toBeVisible();
      await shot("b15-planner");
      await page.getByRole("button", { name: /Walk the Remade Top earlier/ }).focus();
      await page.keyboard.press("Enter");
      await page.getByTestId("card-piece-2-find:satin-robe").focus();
      await page.keyboard.press("Space");
      await page.getByRole("radio", { name: /Dreamy Strings/ }).focus();
      await page.keyboard.press("Space");
      await page.getByRole("radio", { name: /Warm Glow/ }).focus();
      await page.keyboard.press("Space");
      await shot("b16-planner-ready", true);
      await page.getByTestId("stage-showcase").focus();
      await page.keyboard.press("Enter");
      const show = page.getByTestId("hall-show");
      await expect(show).toBeVisible();
      await expect(page.getByTestId("skip-show")).toBeFocused();
      await expect(show).toHaveAttribute("data-scene", "walk-1", { timeout: 20_000 });
      await expect(page.getByTestId("show-story-card")).toBeVisible({ timeout: 10_000 });
      await shot("b17-show-walk");
      await page.keyboard.press("Enter");
      const results = page.getByTestId("showcase-results");
      await expect(results).toBeVisible();
      await expect(page.getByTestId("rosette-name")).toBeFocused();
      await expect(results.locator(".ad-jury")).toHaveCount(3);
      await page.waitForTimeout(2200);
      await shot("b18-showcase-results");
      await shot("b19-showcase-results-full", true);
      await page.getByTestId("showcase-done").click();
      await finishStories(page);
      await expect(page.getByTestId("keepsakes").locator("li")).toHaveCount(1);
      await scrollIntoView(page, '[data-testid="keepsakes"]');
      await shot("b20-rosette-wall");

      await page.getByTestId("save-exit").click();
      await page.reload();
      await page.getByRole("button", { name: /^Continue/ }).click();
      await finishStories(page);
      await expect(page.getByTestId("keepsakes").locator("li")).toHaveCount(1);
      await expect(page.getByTestId("open-showcase")).toHaveText("See the Showcase");
      await page.getByTestId("open-showcase").click();
      await expect(page.getByTestId("showcase-results")).toBeVisible();
      await expect(page.getByRole("button", { name: /Watch the show again/ })).toBeVisible();
      expect(watch.outside).toEqual([]);
      expect(watch.problems).toEqual([]);
    });

    test(`run Swap & Mend in the hall: a table and a swap (${viewport.name})`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      const shot = shooter(page, testInfo, viewport.name);
      const watch = watchPage(page);
      await openThriftSave(page, swapDaySave());
      await finishStories(page);
      await expect(page.locator(".tf-hero__text h2")).toHaveText("Swap & Mend is on today");
      await expect(page.getByTestId("work-shift")).toHaveCount(0);
      await page.getByTestId("open-hall").click();
      await expect(page.getByTestId("hall-screen")).toBeVisible();
      await shot("b21-hall");
      await page.locator('[data-testid^="help-table-"]').first().click();
      const work = page.getByTestId("table-work");
      await expect(work).toBeVisible();
      await shot("b22-hall-table");
      if ((await work.getByTestId("stitch-bench").count()) > 0) {
        await page.getByRole("switch", { name: /Assist snip/ }).click();
        for (let guard = 0; guard < 20; guard += 1) {
          const open = work.locator('[data-stitch][data-popped="no"] .tf-stitch__hit');
          if ((await open.count()) === 0) break;
          await page.mouse.click(...(await centreOf(open.first())));
        }
      } else if ((await work.getByTestId("stain-scrubber").count()) > 0) {
        await page.getByRole("switch", { name: /Assist soak/ }).click();
        await work.getByRole("button", { name: "Soak it" }).click();
      } else {
        const bed = work.getByTestId("sewing-bed");
        await bed.scrollIntoViewIfNeeded();
        const [x, y] = await centreOf(bed);
        await page.mouse.move(x, y);
        await page.mouse.down();
        await expect(work.locator(".tf-table-work__done")).toBeVisible({ timeout: 30_000 });
        await page.mouse.up();
      }
      await expect(work.locator(".tf-table-work__done")).toBeVisible({ timeout: 20_000 });
      await page.getByTestId("table-close").click();
      await expect(page.locator(".tf-hall-table--done")).toHaveCount(1);
      await expect(page.getByTestId("well-mended")).toContainText("well mended");
      const slot = page.locator('[data-testid^="swap-swap-"]').first();
      await slot.click();
      await expect(page.getByTestId("swap-rail")).toContainText("1/3 swaps");
      await scrollIntoView(page, '[data-testid="swap-rail"]');
      await shot("b23-swap-rail");
      await page.getByRole("button", { name: "Back to the shop" }).click();
      await expect(page.getByTestId("work-shift")).toHaveCount(0);
      expect(watch.outside).toEqual([]);
      expect(watch.problems).toEqual([]);
    });

    test(`sell the seasonal rack on Till Day with window and season bonuses (${viewport.name})`, async ({
      page,
    }, testInfo) => {
      const shot = shooter(page, testInfo, viewport.name);
      const watch = watchPage(page);
      await openThriftSave(page, tillDaySave());
      await finishStories(page);
      await expect(page.locator(".tf-hero__text h2")).toHaveText("It's Till Day!");
      await page.getByTestId("open-stall").click();
      await expect(page.getByTestId("price-tag")).toHaveCount(3);
      await expect(page.getByTestId("price-tag").first()).toContainText("In the window");
      await shot("b24-till-prices", true);
      for (const tag of await page.getByTestId("price-tag").all()) {
        const text = await tag.locator(".tf-price__guide").innerText();
        const high = Number(text.match(/\d+/g)?.[1] ?? 0);
        const value = tag.getByTestId("price-value");
        for (let guard = 0; guard < 200; guard += 1) {
          const current = Number(await value.innerText());
          if (current === high) break;
          await tag.getByRole("button", { name: current < high ? /One coin more/ : /One coin less/ }).click();
        }
      }
      await page.getByTestId("hold-stall").click();
      await expect(page.getByTestId("stall-result").locator(".tf-sale--fair")).toHaveCount(3);
      await page.waitForTimeout(900);
      await shot("b25-till-result", true);
      await page.getByTestId("stall-done").click();
      expect(watch.outside).toEqual([]);
      expect(watch.problems).toEqual([]);
    });

    test(`start straight in the boutique from a new game (${viewport.name})`, async ({ page }, testInfo) => {
      const shot = shooter(page, testInfo, viewport.name);
      const watch = watchPage(page);
      await page.goto("/#/thrift-flip");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await page.getByRole("button", { name: "New Game" }).click();
      await page.getByLabel("Name").fill("Mira");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Trendsetter" }).click();
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Boutique Owner" }).click();
      await shot("b26-career-step");
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("radio", { name: "Standard" }).click();
      await page.getByRole("button", { name: "Open the shop" }).click();
      await expect(page.locator(".ad-story__title")).toHaveText("Walls at Last");
      await shot("b27-boutique-intro");
      await finishStories(page);
      const hub = page.getByTestId("stall-hub");
      await expect(hub).toHaveAttribute("data-career", "boutique");
      expect(await coinsIn(page.getByTestId("stat-coins"))).toBe(320);
      await expect(
        page.locator(
          '[data-testid="offer-tag"][data-kind="mend"], [data-testid="offer-tag"][data-kind="alter"]',
        ),
      ).toHaveCount(1);
      expect(watch.outside).toEqual([]);
      expect(watch.problems).toEqual([]);
    });
  });
}

test("the Showcase shows still story cards with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 800 });
  await openThriftSave(page, showcaseSave());
  await finishStories(page);
  await page.getByTestId("open-showcase").click();
  await page.getByRole("radio", { name: /Classic Jazz/ }).click();
  await page.getByRole("radio", { name: /Spotlight/ }).click();
  await page.getByTestId("planner-back").click();
  await expect(page.getByRole("dialog", { name: "Leave the Showcase plan?" })).toBeVisible();
  await page.getByTestId("keep-draft").click();
  await expect(page.getByRole("radio", { name: /Spotlight/ })).toHaveAttribute("aria-checked", "true");
  await page.getByTestId("stage-showcase").click();
  const show = page.getByTestId("hall-show");
  await expect(show).toHaveAttribute("data-scene", "walk-1", { timeout: 20_000 });
  await expect(page.getByTestId("show-story-card").first()).toHaveCSS("opacity", "1");
  await expect(show).toHaveAttribute("data-scene", "walk-2", { timeout: 20_000 });
  await page.getByTestId("skip-show").click();
  await expect(page.getByTestId("showcase-results")).toBeVisible();
});
