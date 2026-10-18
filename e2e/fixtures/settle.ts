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

function countUpsAtTarget(): boolean {
  return Array.from(document.querySelectorAll("[aria-label*=' out of 100']")).every((element) => {
    const target = /(\d+) out of 100/.exec(element.getAttribute("aria-label") ?? "")?.[1];
    const shown = [element, ...Array.from(element.querySelectorAll("*"))].find((node) =>
      /^\d+$/.test(node.textContent?.trim() ?? ""),
    );
    return target === undefined || shown === undefined || shown.textContent?.trim() === target;
  });
}

export async function countUpsShown(page: Page): Promise<boolean> {
  return page.evaluate(countUpsAtTarget);
}

export async function countUpsDone(page: Page): Promise<void> {
  await page.waitForFunction(countUpsAtTarget, undefined, { polling: "raf" });
}

async function countTargetsReached(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("[data-count-target]")).every(
        (element) =>
          element.querySelector("[data-count-value]")?.textContent?.trim() ===
          element.getAttribute("data-count-target"),
      ),
    undefined,
    { polling: "raf" },
  );
}

export async function settledForShot(page: Page): Promise<void> {
  await countUpsDone(page);
  await countTargetsReached(page);
  await settle(page);
}
