import { expect, test, type Page } from "@playwright/test";
import { pipOrderAt } from "../fixtures/benchStates";
import { openPreparedBench } from "../fixtures/preparedBakery";

async function sidewaysScroll(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

for (const width of [820, 375]) {
  test(`the bench and the results fit a ${width} px screen without sideways scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openPreparedBench(page, pipOrderAt("weigh"));
    await expect(page.getByTestId("weigh-station")).toBeVisible();
    expect(await sidewaysScroll(page)).toBe(0);

    await openPreparedBench(page, pipOrderAt("review"));
    await page.getByTestId("deliver").click();
    await expect(page.getByTestId("results")).toBeVisible();
    for (let sample = 0; sample < 8; sample += 1) {
      expect(await sidewaysScroll(page)).toBe(0);
      await page.waitForTimeout(150);
    }
  });
}
