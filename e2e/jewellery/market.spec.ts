import { expect, test, type Page } from "@playwright/test";
import { advance, coins, finishJewelleryStories, freshJewellery } from "../fixtures/jewelleryBench";
import { stillBox } from "../fixtures/settle";

async function railCut(page: Page): Promise<void> {
  for (let part = 0; part < 6; part += 1) {
    const loupe = page.getByTestId("cut-loupe");
    if ((await loupe.count()) === 0) return;
    await loupe.scrollIntoViewIfNeeded();
    const box = await stillBox(loupe);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let step = 0; step < 120; step += 1) {
      const angle = step * 0.9;
      await page.mouse.move(cx + Math.cos(angle) * box.width * 0.3, cy + Math.sin(angle) * box.height * 0.3);
    }
    await page.mouse.up();
  }
}

async function helperOn(page: Page, name: string): Promise<void> {
  const toggle = page.getByRole("switch", { name });
  if ((await toggle.getAttribute("aria-checked")) !== "true") await toggle.click();
}

async function stallPiece(page: Page, product: string, glaze: string, first: boolean): Promise<void> {
  await page.getByTestId("stall-panel").getByRole("button", { name: product }).click();
  await expect(page.getByRole("heading", { name: "Design the piece" })).toBeVisible();
  await page.getByRole("radio", { name: /^Copper/ }).click();
  await advance(page);
  await page.getByTestId("buy-fits").click();
  await advance(page);
  await page.getByRole("button", { name: "Show me" }).click();
  await advance(page);
  await helperOn(page, "Guide rail");
  await railCut(page);
  await advance(page);
  if (first) {
    const button = page.getByTestId("warm-button");
    await button.scrollIntoViewIfNeeded();
    await button.hover();
    await page.mouse.down();
    await expect
      .poll(async () => Number((await page.getByTestId("lamp-bench").getAttribute("data-progress")) ?? "0"), {
        intervals: [100],
        timeout: 15_000,
      })
      .toBeGreaterThan(0.1);
    await page.mouse.up();
    await page.getByRole("button", { name: "Back to the arcade" }).click();
    await page.getByTestId("save-exit").click();
    await page.reload();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await finishJewelleryStories(page);
    await page.getByRole("button", { name: "Back to the bench" }).first().click();
    await expect(page.getByRole("heading", { name: "The Joining Lamp" })).toBeVisible();
    expect(
      Number((await page.getByTestId("lamp-bench").getAttribute("data-progress")) ?? "0"),
    ).toBeGreaterThan(0.1);
  }
  await helperOn(page, "Steady lamp");
  await expect(page.getByTestId("advance-stage")).toBeEnabled({ timeout: 20_000 });
  await advance(page);
  await helperOn(page, "Buffing wheel");
  const parts = page.locator(".jb-work__item");
  for (let index = 0; index < (await parts.count()); index += 1) {
    await parts.nth(index).click();
    await page.getByTestId("buff").click();
  }
  await advance(page);
  await page.getByRole("radio", { name: /^Colour Glaze/ }).click();
  await page.getByRole("radio", { name: glaze, exact: true }).click();
  const chains = page.getByRole("radiogroup", { name: "Chain or cord" }).getByRole("radio");
  if ((await chains.count()) > 0) await chains.first().click();
  await advance(page);
  await expect(page.getByRole("heading", { name: "Into the stall box!" })).toBeVisible();
  await page.getByTestId("results-exit").click();
  await finishJewelleryStories(page);
}

async function endDay(page: Page): Promise<void> {
  await page.getByTestId("end-day").click();
  await page.locator(".jb-night").getByRole("button", { name: "Open the bench" }).click();
  await finishJewelleryStories(page);
}

test("three stall pieces go on the Market Day tray, with a save and reload in the middle of a join", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await freshJewellery(page);
  await page.getByRole("button", { name: "New Game" }).click();
  await page.getByLabel("Name").fill("Teo");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Charmer" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("radio", { name: "Lantern Bench" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  await page.getByRole("button", { name: "Open the bench" }).click();
  await finishJewelleryStories(page);

  await stallPiece(page, "Stacking Ring", "Sage", true);
  await stallPiece(page, "Shape Pendant", "Coral", false);
  await endDay(page);
  await stallPiece(page, "Drop Earrings", "Sky", false);
  await expect(page.getByTestId("stall-panel")).toContainText("3 of 6 pieces");
  for (let day = 2; day < 7; day += 1) await endDay(page);

  const before = await coins(page);
  await page.getByTestId("open-market").click();
  await expect(page.getByTestId("market-day")).toBeVisible();
  for (let piece = 0; piece < 3; piece += 1) await page.locator(".jb-market__piece").first().click();
  await expect(page.getByTestId("tray-slot-centre")).not.toHaveClass(/jb-tray-slot--empty/);
  await page.getByRole("radio", { name: "Sage velvet" }).click();
  await page.getByTestId("show-tray").click();
  await expect(page.getByTestId("market-summary")).toContainText("Shopper score");
  await page.getByTestId("market-exit").click();
  await finishJewelleryStories(page);
  expect(await coins(page)).toBeGreaterThan(before);
  await page.getByRole("button", { name: "Open the Keepsake Case" }).click();
  await expect(page.locator(".jb-keepsake__card")).toHaveCount(3);
});
