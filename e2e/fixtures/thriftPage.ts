import { expect, type Locator, type Page } from "@playwright/test";
import { settle, stillBox } from "./settle";

export const THRIFT_URL = "/#/thrift-flip";

export async function openThrift(page: Page): Promise<void> {
  if (page.url() !== "about:blank") await page.goto("about:blank");
  await page.goto(THRIFT_URL);
}

export async function svgToScreen(
  svg: Locator,
  points: readonly (readonly [number, number])[],
): Promise<[number, number][]> {
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

export async function centreOf(locator: Locator): Promise<[number, number]> {
  const box = await stillBox(locator);
  return [box.x + box.width / 2, box.y + box.height / 2];
}

export async function drag(page: Page, from: readonly [number, number], to: readonly [number, number]) {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move(from[0] + 6, from[1] + 4, { steps: 3 });
  await page.mouse.move(to[0], to[1], { steps: 14 });
  await page.mouse.up();
}

export async function advance(page: Page) {
  const button = page.getByTestId("advance-stage");
  await expect(button).toBeEnabled();
  await button.click();
}

export async function coinsIn(locator: Locator): Promise<number> {
  return Number((await locator.innerText()).replace(/\D/g, ""));
}
