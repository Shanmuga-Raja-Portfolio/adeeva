import { expect, type Page } from "@playwright/test";
import { centreOf } from "./patisseriePage";
import { traceLegs, type TracePoint } from "./traceLegs";

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

const STIR_PACE = 3.5;
const STIR_STEP_MIN = 0.12;
const STIR_STEP_MAX = 0.5;
const STIR_MOVES_PER_CHECK = 8;

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
  let last = Date.now();
  for (let guard = 0; guard < 200; guard += 1) {
    const lapsDone = Number((await bowl.getAttribute("data-laps-done")) ?? "0");
    if (lapsDone >= laps) break;
    const direction = lapsDone % 2 === 0 ? 1 : -1;
    for (let move = 0; move < STIR_MOVES_PER_CHECK; move += 1) {
      await page.waitForTimeout(30);
      const now = Date.now();
      const step = Math.min(STIR_STEP_MAX, Math.max(STIR_STEP_MIN, (STIR_PACE * (now - last)) / 1000));
      last = now;
      angle += direction * step;
      await page.mouse.move(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    }
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

const TRACE_STEP_CM = 0.5;
export async function traceByHand(page: Page): Promise<void> {
  const table = page.getByTestId("pipe-table");
  const raw = (await table.getAttribute("data-path")) ?? "[]";
  const closed = (await table.getAttribute("data-closed")) === "true";
  const points = JSON.parse(raw) as TracePoint[];
  const box = await table.boundingBox();
  if (box === null) throw new Error("No pipe table");
  const toScreen = ([x, y]: TracePoint) => ({
    x: box.x + (x / 24) * box.width,
    y: box.y + (y / 24) * box.height,
  });
  const route = closed && points[0] !== undefined ? [...points, points[0]] : points;
  const first = route[0];
  if (first === undefined) throw new Error("Empty path");
  const start = toScreen(first);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (const [from, to] of traceLegs(route)) {
    const next = toScreen(to);
    const steps = Math.max(2, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / TRACE_STEP_CM));
    await page.mouse.move(next.x, next.y, { steps });
  }
  await page.mouse.up();
  await page.getByTestId("keep-line").click();
}
