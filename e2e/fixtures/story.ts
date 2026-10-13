import { expect, type Page } from "@playwright/test";

export async function finishStories(page: Page): Promise<void> {
  const story = page.locator(".ad-story");
  for (let step = 0; step < 60; step += 1) {
    if ((await story.count()) === 0) return;
    await story.locator(".ad-story__footer button").first().click();
  }
  await expect(story).toHaveCount(0);
}
