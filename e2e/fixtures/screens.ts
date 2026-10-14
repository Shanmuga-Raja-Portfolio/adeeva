import type { Page, TestInfo } from "@playwright/test";

export function shooter(page: Page, testInfo: TestInfo, prefix: string) {
  return async (name: string, fullPage = false) => {
    await page.waitForTimeout(350);
    await page.screenshot({
      path: testInfo.outputPath(`${prefix}-${name}.png`),
      fullPage,
      animations: "disabled",
    });
  };
}
