import { expect, type Page } from "@playwright/test";
import { centreOf } from "./patisseriePage";

async function scaleGrams(page: Page): Promise<number> {
  const label = (await page.locator(".pa-dial").getAttribute("aria-label")) ?? "";
  const match = /shows (\d+)/.exec(label);
  return match?.[1] === undefined ? 0 : Number(match[1]);
}

export async function pourByHand(page: Page, stopAt: number): Promise<void> {
  const pad = await centreOf(page.getByTestId("pour-pad"));
  await page.mouse.move(pad.x, pad.y);
  await page.mouse.down();
  for (let guard = 0; guard < 200 && (await scaleGrams(page)) < stopAt; guard += 1)
    await page.waitForTimeout(25);
  await page.mouse.up();
  await expect(page.getByTestId("keep-weigh")).toBeEnabled();
}

export async function pourWithHelper(page: Page): Promise<void> {
  const pad = await centreOf(page.getByTestId("pour-pad"));
  await page.mouse.move(pad.x, pad.y);
  await page.mouse.down();
  await expect(page.getByTestId("keep-weigh")).toBeEnabled({ timeout: 15_000 });
  await page.mouse.up();
}

export async function stirByHand(page: Page, laps: number): Promise<void> {
  const bowl = page.getByTestId("stir-bowl");
  const box = await bowl.boundingBox();
  if (box === null) throw new Error("No bowl");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const radius = box.width * 0.28;
  let angle = -Math.PI / 2;
  await page.mouse.move(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  await page.mouse.down();
  for (let guard = 0; guard < 1600; guard += 1) {
    const progress = Number((await bowl.getAttribute("data-progress")) ?? "0");
    if (progress >= laps) break;
    const direction = Math.floor(progress) % 2 === 0 ? 1 : -1;
    angle += direction * 0.12;
    await page.mouse.move(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    await page.waitForTimeout(30);
  }
  await page.mouse.up();
  await expect(bowl).toHaveAttribute("data-progress", `${laps.toFixed(3)}`);
}

export async function bakeByHand(page: Page): Promise<void> {
  await page.getByTestId("start-bake").click();
  await expect(page.getByTestId("turn-tray")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("turn-tray").click();
  const oven = page.getByTestId("oven");
  await expect
    .poll(async () => Number((await oven.getAttribute("data-share")) ?? "0"), {
      timeout: 20_000,
      intervals: [50],
    })
    .toBeGreaterThanOrEqual(0.98);
  await page.getByTestId("take-out").click();
}

export async function traceByHand(page: Page): Promise<void> {
  const table = page.getByTestId("pipe-table");
  const raw = (await table.getAttribute("data-path")) ?? "[]";
  const closed = (await table.getAttribute("data-closed")) === "true";
  const points = JSON.parse(raw) as [number, number][];
  const box = await table.boundingBox();
  if (box === null) throw new Error("No pipe table");
  const toScreen = ([x, y]: [number, number]) => ({
    x: box.x + (x / 24) * box.width,
    y: box.y + (y / 24) * box.height,
  });
  const route = closed && points[0] !== undefined ? [...points, points[0]] : points;
  const first = route[0];
  if (first === undefined) throw new Error("Empty path");
  const start = toScreen(first);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (const point of route.slice(1)) {
    const next = toScreen(point);
    await page.mouse.move(next.x, next.y, { steps: 2 });
  }
  await page.mouse.up();
  await page.getByTestId("keep-line").click();
}
