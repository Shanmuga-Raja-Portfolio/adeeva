import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Page, TestInfo } from "@playwright/test";
import { settledForShot } from "./settle";

export function depthShooter(page: Page, testInfo: TestInfo, prefix: string) {
  const folder = process.env["WW_SHOTS"];
  return async (name: string, fullPage = false) => {
    await settledForShot(page);
    const file = `${prefix}-${name}.png`;
    if (folder !== undefined) mkdirSync(folder, { recursive: true });
    await page.screenshot({
      path: folder === undefined ? testInfo.outputPath(file) : join(folder, file),
      fullPage,
      animations: "disabled",
    });
  };
}
