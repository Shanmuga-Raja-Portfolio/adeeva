import { expect, type Locator, type Page } from "@playwright/test";
import { settle, stillBox } from "./settle";

export type ScreenPoint = readonly [number, number];

export async function finishWorkshopStories(page: Page): Promise<void> {
  const story = page.locator(".ww-story");
  for (let step = 0; step < 40; step += 1) {
    if ((await story.count()) === 0) return;
    await story.locator(".ww-story__footer button").first().click();
  }
  await expect(story).toHaveCount(0);
}

export async function coinsOf(page: Page, testId: string): Promise<number> {
  return Number((await page.getByTestId(testId).innerText()).replace(/[^0-9-]/g, ""));
}

export async function svgToScreen(
  svg: Locator,
  points: readonly (readonly [number, number])[],
): Promise<ScreenPoint[]> {
  await settle(svg.page());
  return svg.evaluate((element, list) => {
    const matrix = (element as SVGGraphicsElement).getScreenCTM();
    if (matrix === null) return [];
    return list.map(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix);
      return [point.x, point.y] as [number, number];
    });
  }, points);
}

export async function centreOf(locator: Locator): Promise<ScreenPoint> {
  const box = await stillBox(locator);
  return [box.x + box.width / 2, box.y + box.height / 2];
}

export async function drag(page: Page, from: ScreenPoint, to: ScreenPoint, steps = 16): Promise<void> {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move(from[0] + 4, from[1] + 3, { steps: 2 });
  await page.mouse.move(to[0], to[1], { steps });
  await page.mouse.up();
}

export async function tracePath(page: Page, points: readonly ScreenPoint[]): Promise<void> {
  const [first, ...rest] = points;
  if (first === undefined) return;
  await page.mouse.move(first[0], first[1]);
  await page.mouse.down();
  for (const point of rest) await page.mouse.move(point[0], point[1], { steps: 6 });
  await page.mouse.up();
}

export async function advance(page: Page): Promise<void> {
  const button = page.getByTestId("advance-stage");
  await expect(button).toBeEnabled();
  await button.click();
}

export async function scrollToTop(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
}
