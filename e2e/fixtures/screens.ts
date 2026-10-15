import type { Page, TestInfo } from "@playwright/test";
import { settledForShot } from "./settle";

export function shooter(page: Page, testInfo: TestInfo, prefix: string) {
  return async (name: string, fullPage = false) => {
    await settledForShot(page);
    await page.screenshot({
      path: testInfo.outputPath(`${prefix}-${name}.png`),
      fullPage,
      animations: "disabled",
    });
  };
}
