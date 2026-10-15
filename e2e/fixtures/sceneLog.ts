import type { Page } from "@playwright/test";

interface SceneWindow {
  shownScenes?: string[];
}

export async function recordScenes(page: Page, testId: string): Promise<() => Promise<readonly string[]>> {
  await page.evaluate((id) => {
    const seen: string[] = [];
    const note = () => {
      const scene = document.querySelector(`[data-testid='${id}']`)?.getAttribute("data-scene");
      if (scene !== undefined && scene !== null && seen[seen.length - 1] !== scene) seen.push(scene);
    };
    new MutationObserver(note).observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-scene"],
    });
    (window as SceneWindow).shownScenes = seen;
  }, testId);
  return () => page.evaluate(() => (window as SceneWindow).shownScenes ?? []);
}
