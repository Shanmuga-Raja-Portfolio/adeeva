import { expect, type Locator, type Page } from "@playwright/test";
import { settle } from "./settle";
import { isOutsideRequest } from "./outsideRequest";

export const INTERIOR_URL = "/#/interior";

type Pair = readonly [number, number];

export function watchOutsideRequests(page: Page): string[] {
  const outside: string[] = [];
  page.on("request", (request) => {
    if (isOutsideRequest(request.url())) outside.push(request.url());
  });
  return outside;
}

export async function freshInterior(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(INTERIOR_URL);
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
}

export async function finishInteriorStories(page: Page): Promise<void> {
  const story = page.locator(".is-story");
  for (let step = 0; step < 60; step += 1) {
    if ((await story.count()) === 0) return;
    await story.locator(".is-story__footer button").first().click();
  }
  await expect(story).toHaveCount(0);
}

export async function newDesigner(page: Page, difficulty = "Standard"): Promise<void> {
  await page.getByRole("button", { name: "New Game" }).click();
  await page.getByLabel("Name").fill("Mira");
  await page.getByRole("radio", { name: "Curly puff" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Perfectionist" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("radio", { name: /Junior Room Designer/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: difficulty }).click();
  await page.getByRole("button", { name: "Open the loft" }).click();
  await expect(page.getByRole("heading", { name: "Keys to the Loft" })).toBeVisible();
  await finishInteriorStories(page);
  await expect(page.getByTestId("loft-hub")).toBeVisible();
}

export async function coins(page: Page): Promise<number> {
  return Number((await page.getByTestId("stat-coins").innerText()).replace(/[^0-9-]/g, ""));
}

export async function advance(page: Page): Promise<void> {
  const button = page.getByTestId("advance-stage");
  await expect(button).toBeEnabled();
  await button.click();
}

export async function toScreen(svg: Locator, points: readonly Pair[]): Promise<Pair[]> {
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

export async function dragPath(page: Page, route: readonly Pair[], pause = 0): Promise<void> {
  const first = route[0];
  if (first === undefined) return;
  await page.mouse.move(first[0], first[1]);
  await page.mouse.down();
  for (const [x, y] of route.slice(1)) {
    await page.mouse.move(x, y, { steps: 2 });
    if (pause > 0) await page.waitForTimeout(pause);
  }
  await page.mouse.up();
}

export async function dragOnto(page: Page, from: Locator, svg: Locator, point: Pair): Promise<void> {
  await from.scrollIntoViewIfNeeded();
  const [to] = await toScreen(svg, [point]);
  const start = await from.boundingBox();
  if (start === null || to === undefined) throw new Error("Nothing to drag");
  const sx = start.x + start.width / 2;
  const sy = start.y + start.height / 2;
  await dragPath(page, [[sx, sy], [sx + 14, sy + 10], [(sx + to[0]) / 2, (sy + to[1]) / 2], to]);
}

function along(points: readonly Pair[], closed: boolean, stepCm: number): Pair[] {
  const ring = closed && points[0] !== undefined ? [...points, points[0]] : [...points];
  const out: Pair[] = [];
  ring.slice(1).forEach((end, index) => {
    const start = ring[index] ?? end;
    const steps = Math.max(1, Math.ceil(Math.hypot(end[0] - start[0], end[1] - start[1]) / stepCm));
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      out.push([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t]);
    }
  });
  const last = ring[ring.length - 1];
  if (last !== undefined) out.push(last);
  return out;
}

export async function edgeByHand(page: Page, pathId: string): Promise<void> {
  const figure = page.getByTestId(`edge-${pathId}`);
  await figure.scrollIntoViewIfNeeded();
  await settle(page);
  const svg = figure.locator("svg").first();
  const points = JSON.parse((await figure.getAttribute("data-path")) ?? "[]") as Pair[];
  const closed = (await figure.getAttribute("data-closed")) === "true";
  const route = await toScreen(svg, along(points, closed, 0.6));
  await dragPath(page, route);
}

export async function rollByHand(page: Page, wall: "back" | "side"): Promise<void> {
  const roll = page.getByTestId(`roll-${wall}`);
  await roll.scrollIntoViewIfNeeded();
  await settle(page);
  const svg = roll.locator("svg").first();
  for (let coat = 0; coat < 2; coat += 1)
    for (let row = 0; row < 5; row += 1) {
      await page.getByTestId("dip-roller").click();
      const y = row * 64 + 32;
      const line: Pair[] = Array.from({ length: 13 }, (_, step): Pair => [12 + step * 40.6, y]);
      await dragPath(page, await toScreen(svg, line), 25);
    }
}

export async function rollTwoToneByHand(page: Page): Promise<void> {
  const roll = page.getByTestId("roll-back");
  await roll.scrollIntoViewIfNeeded();
  await settle(page);
  const svg = roll.locator("svg").first();
  for (let coat = 0; coat < 2; coat += 1)
    for (let row = 0; row < 5; row += 1) {
      await page.getByTestId(row < 3 ? "dip-top" : "dip-bottom").click();
      const y = row * 64 + 32;
      const line: Pair[] = Array.from({ length: 13 }, (_, step): Pair => [12 + step * 40.6, y]);
      await dragPath(page, await toScreen(svg, line), 25);
    }
}

export async function layFloorByHand(page: Page, pieces: number): Promise<void> {
  const area = page.getByTestId("floor-area");
  for (let piece = 0; piece < pieces; piece += 1) {
    await page.locator(".is-floor__work").evaluate((element) => element.scrollIntoView({ block: "center" }));
    await settle(page);
    const [tx, ty] = ((await area.getAttribute("data-target")) ?? "0,0").split(",").map(Number);
    const right = page.locator("[data-testid^='floor-candidate-'][data-right='true']");
    const key = ((await right.getAttribute("data-testid")) ?? "").replace("floor-candidate-", "");
    const [w, h] = key.split("-")[0]?.split("x").map(Number) ?? [30, 30];
    await dragOnto(page, right, area, [(tx ?? 0) + (w ?? 30) / 2, (ty ?? 0) + (h ?? 30) / 2]);
    await expect(page.getByTestId("floor-pending")).toBeVisible();
    await page.getByTestId("press-floor").click();
    await expect(area).toHaveAttribute("aria-label", new RegExp(`${piece + 1} of 6 pieces laid`));
  }
}

export async function revealBySlider(page: Page): Promise<void> {
  const handle = page.getByTestId("reveal-handle");
  await handle.scrollIntoViewIfNeeded();
  await settle(page);
  const box = await handle.boundingBox();
  const track = await page.locator(".is-reveal__track").boundingBox();
  if (box === null || track === null) throw new Error("No reveal slider");
  const y = box.y + box.height / 2;
  await dragPath(page, [
    [box.x + box.width / 2, y],
    [track.x + track.width * 0.4, y],
    [track.x + track.width * 0.8, y],
    [track.x + track.width + 20, y],
  ]);
}
