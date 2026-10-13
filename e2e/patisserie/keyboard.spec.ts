import { expect, test } from "@playwright/test";
import { pipOrderAt } from "../fixtures/benchStates";
import { openPreparedBench } from "../fixtures/preparedBakery";

test("the oven and the step button keep keyboard focus on the next control", async ({ page }) => {
  test.setTimeout(90_000);
  await openPreparedBench(page, pipOrderAt("bake"));
  await page.getByTestId("start-bake").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("take-out")).toBeFocused();
  await expect(page.getByTestId("turn-tray")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("turn-tray").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("take-out")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".pa-oven-bench__result")).toBeFocused();

  await page.getByTestId("advance-stage").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Stack and fill" })).toBeFocused();
});

test("toppings can be added, moved and put back with the keyboard", async ({ page }) => {
  await openPreparedBench(page, pipOrderAt("decorate"));
  const tile = page.getByTestId("topping-party-candle");
  await tile.focus();
  for (let press = 0; press < 30 && (await tile.isEnabled()); press += 1) await page.keyboard.press("Enter");
  await expect(tile).toBeDisabled();
  await expect(page.locator(":focus")).toHaveCount(1);
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);

  const placed = page.locator(".pa-decorate__hit");
  const count = await placed.count();
  const first = placed.first();
  await first.focus();
  await expect(page.locator(".pa-decorate__controls")).toBeVisible();
  const before = Number(await first.getAttribute("cx"));
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => Number(await first.getAttribute("cx"))).toBeGreaterThan(before);
  await page.keyboard.press("Delete");
  await expect(placed).toHaveCount(count - 1);
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
});
