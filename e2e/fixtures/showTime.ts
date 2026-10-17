import type { Page } from "@playwright/test";

const STEP_MS = 100;
const LIMIT_MS = 120_000;
const PAUSE_LEAD_MS = 3000;

export async function holdShowTime(page: Page): Promise<void> {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + PAUSE_LEAD_MS);
}

export async function releaseShowTime(page: Page): Promise<void> {
  await page.clock.resume();
}

export async function playUntil(page: Page, what: string, reached: () => Promise<boolean>): Promise<void> {
  for (let played = 0; played <= LIMIT_MS; played += STEP_MS) {
    if (await reached()) return;
    await page.clock.runFor(STEP_MS);
  }
  throw new Error(`The show never reached ${what}`);
}

export async function sceneOf(page: Page, testId: string): Promise<string | null> {
  return page.evaluate(
    (id) => document.querySelector(`[data-testid='${id}']`)?.getAttribute("data-scene") ?? null,
    testId,
  );
}

export async function playToScene(page: Page, testId: string, scene: string): Promise<void> {
  await playUntil(page, `${testId} ${scene}`, async () => (await sceneOf(page, testId)) === scene);
}
