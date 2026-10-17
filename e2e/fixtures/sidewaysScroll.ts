import type { Page } from "@playwright/test";

export async function widestSidewaysScroll(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const overflow = () => document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const scoresCounting = () =>
      Array.from(document.querySelectorAll("[aria-label^='Score ']")).some((element) => {
        const target = /^Score (\d+)/.exec(element.getAttribute("aria-label") ?? "")?.[1];
        return target !== undefined && element.textContent?.trim() !== target;
      });
    let animating = true;
    void Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ).then(() => {
      animating = false;
    });
    let widest = overflow();
    while (animating || scoresCounting()) {
      await document.documentElement.animate([], { duration: 16 }).finished;
      widest = Math.max(widest, overflow());
    }
    return Math.max(widest, overflow());
  });
}
