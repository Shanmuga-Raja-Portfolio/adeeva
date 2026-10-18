import type { Locator, Page } from "@playwright/test";

const STEP_MS = 100;
const SCENE_STEP_MS = 1000;
const LIMIT_MS = 120_000;
const PAUSE_LEAD_MS = 3000;

export async function holdShowTime(page: Page): Promise<void> {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + PAUSE_LEAD_MS);
}

export async function releaseShowTime(page: Page): Promise<void> {
  await page.clock.resume();
}

export async function playUntil(
  page: Page,
  what: string,
  reached: () => Promise<boolean>,
  stepMs = STEP_MS,
): Promise<void> {
  for (let played = 0; played <= LIMIT_MS; played += stepMs) {
    if (await reached()) return;
    await page.clock.fastForward(stepMs);
  }
  throw new Error(`The show never reached ${what}`);
}

export async function playFor(page: Page, ms: number): Promise<void> {
  for (let left = ms; left > 0; left -= SCENE_STEP_MS)
    await page.clock.fastForward(Math.min(left, SCENE_STEP_MS));
}

export async function sceneOf(page: Page, testId: string): Promise<string | null> {
  return page.evaluate(
    (id) => document.querySelector(`[data-testid='${id}']`)?.getAttribute("data-scene") ?? null,
    testId,
  );
}

export async function playToScene(page: Page, testId: string, scene: string): Promise<void> {
  await playUntil(
    page,
    `${testId} ${scene}`,
    async () => (await sceneOf(page, testId)) === scene,
    SCENE_STEP_MS,
  );
}

export async function playWithinScene(
  page: Page,
  testId: string,
  scene: string,
  reached: () => Promise<boolean>,
): Promise<void> {
  await playUntil(
    page,
    `${testId} ${scene}`,
    async () => (await sceneOf(page, testId)) !== scene || (await reached()),
    SCENE_STEP_MS,
  );
}

export async function playUntilVisible(page: Page, what: string, element: Locator): Promise<void> {
  await playUntil(page, what, () => element.isVisible(), SCENE_STEP_MS);
}
