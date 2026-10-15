import { expect, test } from "@playwright/test";
import { pipOrderAt } from "../fixtures/benchStates";
import { openPreparedBench } from "../fixtures/preparedBakery";
import { widestSidewaysScroll } from "../fixtures/sidewaysScroll";

for (const width of [820, 375]) {
  test(`the bench and the results fit a ${width} px screen without sideways scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openPreparedBench(page, pipOrderAt("weigh"));
    await expect(page.getByTestId("weigh-station")).toBeVisible();
    expect(await widestSidewaysScroll(page)).toBe(0);

    await openPreparedBench(page, pipOrderAt("review"));
    await page.getByTestId("deliver").click();
    await expect(page.getByTestId("results")).toBeVisible();
    expect(await widestSidewaysScroll(page)).toBe(0);
  });
}
