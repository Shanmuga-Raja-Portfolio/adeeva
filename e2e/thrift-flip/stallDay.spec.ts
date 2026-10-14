import { expect, test, type Page } from "@playwright/test";
import { reduce, serialize, type GameState, type RackPiece } from "../../src/games/thrift-flip/core";
import { newTestGame, settleStories } from "../../src/games/thrift-flip/core/testPlaythrough";
import { finishStories } from "../fixtures/story";
import { coinsIn, openThrift } from "../fixtures/thriftPage";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 820, height: 1180 },
] as const;

function piece(id: string, recipeId: RackPiece["recipeId"], quality: number): RackPiece {
  const design =
    recipeId === "remade-top"
      ? { recipeId, parts: { bodice: "wrap-bodice", sleeves: "cap-sleeve" } }
      : { recipeId, parts: {} };
  return {
    id,
    runId: "run-1",
    recipeId,
    design,
    cloth: { colour: "teal", print: "floral", material: "cotton" },
    quality,
    leaves: 72,
    tags: ["casual", "playful"],
    finishes: [],
    madeDay: 3,
    findIds: ["tea-dress"],
    seamAccuracy: quality / 100,
    leavesParts: { reuse: 0.72, salvage: 0.72, secondhand: 0.72 },
    colours: ["teal"],
    showcaseSeason: null,
  };
}

function stallDaySave(): GameState {
  let state = settleStories(newTestGame({ seed: 21, trait: "charmer" }));
  for (let day = 1; day < 7; day += 1) state = reduce(state, { type: "endDay" });
  return {
    ...settleStories(state),
    rack: [piece("piece-1", "remade-top", 82), piece("piece-2", "tote-bag", 76)],
    next: { ...state.next, piece: 3 },
  };
}

async function guideBand(page: Page, index: number): Promise<[number, number]> {
  const text = await page.getByTestId("price-tag").nth(index).locator(".tf-price__guide").innerText();
  const numbers = text.match(/\d+/g)?.map(Number) ?? [];
  return [numbers[0] ?? 0, numbers[1] ?? 0];
}

for (const viewport of VIEWPORTS) {
  test(`Stall Day: price tags by slider, buttons and keys, then one rack-wide sale (${viewport.name})`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openThrift(page);
    await page.evaluate((json) => {
      window.localStorage.clear();
      window.localStorage.setItem("thrift-flip.save.1", json);
      window.localStorage.setItem("thrift-flip.lastSlot", "1");
    }, serialize(stallDaySave()));
    await page.reload();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await finishStories(page);
    const startCoins = await coinsIn(page.getByTestId("stat-coins"));
    await expect(page.locator(".tf-hero")).toContainText("It's Stall Day!");
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-27-hub-stall-day.png`) });
    await page.getByTestId("open-stall").click();
    await expect(page.getByTestId("stall-day")).toBeVisible();
    await expect(page.getByTestId("price-tag")).toHaveCount(2);

    const slider = page.getByTestId("price-tag").nth(0).locator("input[type=range]");
    const box = await slider.boundingBox();
    if (box === null) throw new Error("No slider");
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    const [, high] = await guideBand(page, 0);
    const value = page.getByTestId("price-tag").nth(0).getByTestId("price-value");
    for (let guard = 0; guard < 200; guard += 1) {
      const current = Number(await value.innerText());
      if (current === high) break;
      await page
        .getByTestId("price-tag")
        .nth(0)
        .getByRole("button", { name: current < high ? /One coin more/ : /One coin less/ })
        .click();
    }
    await expect(value).toHaveText(String(high));

    const [low2] = await guideBand(page, 1);
    const slider2 = page.getByTestId("price-tag").nth(1).locator("input[type=range]");
    await slider2.focus();
    const value2 = page.getByTestId("price-tag").nth(1).getByTestId("price-value");
    for (let guard = 0; guard < 200; guard += 1) {
      const current = Number(await value2.innerText());
      if (current === low2) break;
      await page.keyboard.press(current > low2 ? "ArrowLeft" : "ArrowRight");
    }
    await expect(value2).toHaveText(String(low2));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: testInfo.outputPath(`${viewport.name}-28-stall-prices.png`),
      fullPage: true,
    });

    await page.getByTestId("hold-stall").click();
    const result = page.getByTestId("stall-result");
    await expect(result).toBeVisible();
    await expect(result.locator(".tf-sale--fair")).toHaveCount(2);
    await page.screenshot({
      path: testInfo.outputPath(`${viewport.name}-29-stall-result.png`),
      fullPage: true,
    });
    await page.getByTestId("stall-done").click();
    await finishStories(page);
    expect(await coinsIn(page.getByTestId("stat-coins"))).toBe(startCoins + high + low2);
    await expect(page.locator(".tf-hero")).toContainText("The stall is packed up");
  });
}
