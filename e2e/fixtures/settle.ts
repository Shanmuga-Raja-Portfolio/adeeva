import type { Page } from "@playwright/test";

export async function settle(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

export async function countUpsDone(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("[aria-label*=' out of 100']")).every((element) => {
        const target = /(\d+) out of 100/.exec(element.getAttribute("aria-label") ?? "")?.[1];
        const shown = [element, ...Array.from(element.querySelectorAll("*"))].find((node) =>
          /^\d+$/.test(node.textContent?.trim() ?? ""),
        );
        return target === undefined || shown === undefined || shown.textContent?.trim() === target;
      }),
    undefined,
    { polling: "raf" },
  );
}

export async function settledForShot(page: Page): Promise<void> {
  await countUpsDone(page);
  await settle(page);
}
