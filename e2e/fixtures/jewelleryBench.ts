import { expect, type Locator, type Page } from "@playwright/test";

export const JEWELLERY_URL = "/#/jewellery";

type Pair = readonly [number, number];

export async function freshJewellery(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(JEWELLERY_URL);
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
}

export async function newJeweller(page: Page): Promise<void> {
  await page.getByRole("button", { name: "New Game" }).click();
  await page.getByLabel("Name").fill("Mira");
  await page.getByRole("radio", { name: "Curly puff" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Perfectionist" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("radio", { name: "Lantern Bench" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Standard" }).click();
  await page.getByRole("button", { name: "Open the bench" }).click();
  await expect(page.getByRole("heading", { name: "Lanterns On" })).toBeVisible();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("bench-hub")).toBeVisible();
}

export async function finishJewelleryStories(page: Page): Promise<void> {
  const story = page.locator(".jb-story");
  for (let step = 0; step < 60; step += 1) {
    if ((await story.count()) === 0) return;
    await story.locator(".jb-story__footer button").first().click();
  }
  await expect(story).toHaveCount(0);
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
  return svg.evaluate((element, list) => {
    const matrix = (element as SVGGraphicsElement).getScreenCTM();
    if (matrix === null) return [];
    return list.map(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix);
      return [point.x, point.y] as [number, number];
    });
  }, points);
}

async function dragPath(page: Page, route: readonly Pair[], release = true): Promise<void> {
  const first = route[0];
  if (first === undefined) return;
  await page.mouse.move(first[0], first[1]);
  await page.mouse.down();
  for (const [x, y] of route.slice(1)) await page.mouse.move(x, y, { steps: 3 });
  if (release) await page.mouse.up();
}

function strokesAlong(points: readonly Pair[], dots: readonly Pair[]): Pair[][] {
  const isDot = (point: Pair) => dots.some((dot) => dot[0] === point[0] && dot[1] === point[1]);
  const start = Math.max(0, points.findIndex(isDot));
  const strokes: Pair[][] = [];
  let stroke: Pair[] = [];
  for (let step = 0; step <= points.length; step += 1) {
    const point = points[(start + step) % points.length];
    if (point === undefined) continue;
    stroke.push(point);
    if (step > 0 && isDot(point)) {
      strokes.push(stroke);
      stroke = [point];
    }
  }
  if (stroke.length > 1) strokes.push(stroke);
  return strokes;
}

export async function cutByHand(page: Page, share = 1, holdLast = false): Promise<void> {
  const loupe = page.getByTestId("cut-loupe");
  await loupe.scrollIntoViewIfNeeded();
  const points = JSON.parse((await loupe.getAttribute("data-path")) ?? "[]") as Pair[];
  const dots = JSON.parse((await loupe.getAttribute("data-dots")) ?? "[]") as Pair[];
  let budget = Math.ceil(points.length * share) + 1;
  for (const stroke of strokesAlong(points, dots)) {
    if (budget < 2) return;
    const part = stroke.slice(0, budget);
    await dragPath(page, await toScreen(loupe, part), !holdLast || part.length === stroke.length);
    budget -= stroke.length - 1;
  }
}

export async function warmByHand(page: Page, input: "mouse" | "keyboard" = "mouse"): Promise<void> {
  const bench = page.getByTestId("lamp-bench");
  const finished = page.locator(".jb-work__item:disabled");
  const before = await finished.count();
  const [from, to] = ((await bench.getAttribute("data-zone")) ?? "0.7,0.85").split(",").map(Number);
  const top = (from ?? 0.7) + ((to ?? 0.85) - (from ?? 0.7)) * 0.55;
  const bottom = (from ?? 0.7) + 0.03;
  const button = page.getByTestId("warm-button");
  await button.scrollIntoViewIfNeeded();
  if (input === "mouse") {
    const box = await button.boundingBox();
    if (box === null) throw new Error("No warm button");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  }
  const hold = () => (input === "mouse" ? page.mouse.down() : page.keyboard.down(" "));
  const letGo = () => (input === "mouse" ? page.mouse.up() : page.keyboard.up(" "));
  const joined = async () => (await finished.count()) > before;
  const warmth = async () =>
    Number(
      await page.evaluate(
        () => document.querySelector("[data-testid='lamp-bench']")?.getAttribute("data-warmth") ?? "0",
      ),
    );
  for (let pulse = 0; pulse < 60 && !(await joined()); pulse += 1) {
    await hold();
    await expect
      .poll(async () => (await joined()) || (await warmth()) >= top, { timeout: 10_000, intervals: [60] })
      .toBe(true);
    await letGo();
    await expect
      .poll(async () => (await joined()) || (await warmth()) <= bottom, { timeout: 10_000, intervals: [60] })
      .toBe(true);
  }
  await expect(finished).toHaveCount(before + 1);
}

export async function setStoneByHand(page: Page): Promise<void> {
  const bench = page.getByTestId("stone-bench");
  const svg = bench.locator("svg").first();
  await svg.scrollIntoViewIfNeeded();
  const [x, y] = ((await bench.getAttribute("data-pose")) ?? "0,0,0").split(",").map(Number);
  const [stone, seat] = await toScreen(svg, [
    [x ?? 0, y ?? 0],
    [0, 0],
  ]);
  if (stone === undefined || seat === undefined) throw new Error("No stone on screen");
  await dragPath(page, [stone, [(stone[0] + seat[0]) / 2, (stone[1] + seat[1]) / 2], seat]);
  await expect(bench).toHaveAttribute("data-seated", "true");
  await page.getByTestId("press-claws").click();
  for (let index = 0; index < 4; index += 1) {
    const claw = page.getByTestId(`claw-${index}`);
    if ((await claw.count()) === 0) break;
    const [sx, sy] = ((await claw.getAttribute("data-snug")) ?? "0,0").split(",").map(Number);
    const box = await claw.boundingBox();
    const [snug] = await toScreen(svg, [[sx ?? 0, sy ?? 0]]);
    if (box === null || snug === undefined) throw new Error("No claw on screen");
    await dragPath(page, [[box.x + box.width / 2, box.y + box.height / 2], snug]);
  }
  await page.getByTestId("seat-done").click();
}

export async function polishByHand(page: Page): Promise<void> {
  const pad = page.getByTestId("polish-pad");
  const svg = pad.locator("svg").first();
  await svg.scrollIntoViewIfNeeded();
  for (let round = 0; round < 4; round += 1) {
    if (Number((await pad.getAttribute("data-shine")) ?? "0") >= 0.95) return;
    const box = await svg.boundingBox();
    if (box === null) throw new Error("No polish pad");
    const route: Pair[] = [];
    for (let row = 0; row < 14; row += 1) {
      const share = 0.2 + (row * 0.6) / 13;
      const half = Math.sqrt(0.44 ** 2 - (share - 0.5) ** 2);
      const y = box.y + box.height * share;
      route.push([box.x + box.width * (0.5 - half), y], [box.x + box.width * (0.5 + half), y]);
    }
    await dragPath(page, route);
  }
  expect(Number((await pad.getAttribute("data-shine")) ?? "0")).toBeGreaterThanOrEqual(0.6);
}

export async function dragOnto(page: Page, from: Locator, to: Locator): Promise<void> {
  await to.scrollIntoViewIfNeeded();
  const start = await from.boundingBox();
  const end = await to.boundingBox();
  if (start === null || end === null) throw new Error("Nothing to drag");
  await dragPath(page, [
    [start.x + start.width / 2, start.y + start.height / 2],
    [start.x + start.width / 2 + 12, start.y + start.height / 2 + 8],
    [end.x + end.width * 0.3, end.y + end.height * 0.3],
  ]);
}
