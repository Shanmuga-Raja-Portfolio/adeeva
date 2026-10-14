import { expect, type Locator, type Page } from "@playwright/test";

export const CHEF_URL = "/#/chef";

type Pair = readonly [number, number];

export function watchOutside(page: Page): string[] {
  const outside: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "localhost" && url.protocol !== "data:" && url.protocol !== "blob:")
      outside.push(request.url());
  });
  return outside;
}

export async function freshChef(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("chef.sound", "off");
  });
  await page.goto(CHEF_URL);
  await page.reload();
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
}

export async function finishChefStories(page: Page): Promise<void> {
  const story = page.locator(".ck-story");
  for (let step = 0; step < 60; step += 1) {
    if ((await story.count()) === 0) return;
    await story.locator(".ck-story__footer button").first().click();
  }
  await expect(story).toHaveCount(0);
}

export async function newChef(
  page: Page,
  start: "Cookery Student" | "Head Chef",
  difficulty: string,
): Promise<void> {
  await page.getByRole("button", { name: "New Game" }).click();
  await page.getByLabel("Name").fill("Tomi");
  await page.getByRole("radio", { name: "Curly puff" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Charmer" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: start }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: difficulty }).click();
  await page.getByRole("button", { name: "Open the kitchen" }).click();
  await expect(page.locator(".ck-story")).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByTestId("kitchen-hub")).toBeVisible();
}

export async function stat(page: Page, id: string): Promise<number> {
  return Number((await page.getByTestId(id).innerText()).replace(/[^0-9-]/g, ""));
}

export async function advance(page: Page): Promise<void> {
  const button = page.getByTestId("advance-stage");
  await expect(button).toBeEnabled();
  await button.click();
}

async function middle(locator: Locator): Promise<Pair> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("Element has no box");
  return [box.x + box.width / 2, box.y + box.height / 2];
}

export async function dragOnto(page: Page, from: Locator, to: Locator): Promise<void> {
  await from.scrollIntoViewIfNeeded();
  const [x1, y1] = await middle(from);
  const [x2, y2] = await middle(to);
  await page.mouse.move(x1, y1);
  await page.mouse.down();
  await page.mouse.move((x1 + x2) / 2, (y1 + y2) / 2, { steps: 6 });
  await page.mouse.move(x2, y2, { steps: 6 });
  await page.mouse.up();
}

export async function svgToScreen(svg: Locator, points: readonly Pair[]): Promise<Pair[]> {
  return svg.evaluate((element, list) => {
    const matrix = (element as SVGGraphicsElement).getScreenCTM();
    if (matrix === null) return [];
    return list.map(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix);
      return [point.x, point.y] as [number, number];
    });
  }, points);
}

async function clockAtLeast(page: Page, value: number): Promise<void> {
  await page.waitForFunction(
    (target) =>
      Number(document.querySelector("[data-testid='chop-board']")?.getAttribute("data-clock") ?? 0) >= target,
    value,
    { polling: "raf" },
  );
}

export async function chopByHand(page: Page): Promise<void> {
  const board = page.getByTestId("chop-board");
  await page.getByTestId("chop-start").click();
  const surface = page.getByTestId("chop-surface");
  await surface.scrollIntoViewIfNeeded();
  const [x, y] = await middle(surface);
  const stretch = JSON.parse((await board.getAttribute("data-stretch")) ?? "null") as Pair | null;
  if (stretch !== null) {
    await page.mouse.move(x, y);
    await clockAtLeast(page, stretch[0] - 15);
    await page.mouse.down();
    await clockAtLeast(page, stretch[1] - 15);
    await page.mouse.up();
    return;
  }
  const marks = JSON.parse((await board.getAttribute("data-marks")) ?? "[]") as number[];
  for (const mark of marks) {
    await clockAtLeast(page, mark - 20);
    await page.mouse.click(x, y);
  }
  await expect(board).toHaveAttribute("data-phase", "done", { timeout: 10_000 });
}

export async function simmerByHand(page: Page): Promise<void> {
  const pot = page.getByTestId("simmer-pot");
  const svg = pot.locator("svg.ck-pot");
  await svg.scrollIntoViewIfNeeded();
  const target = Number(await pot.getAttribute("data-target"));
  const guide = async (): Promise<Pair> => {
    const [gx, gy] = ((await pot.getAttribute("data-guide")) ?? "200,90").split(",").map(Number);
    return [gx ?? 200, gy ?? 90];
  };
  const [first] = await svgToScreen(svg, [await guide()]);
  if (first === undefined) throw new Error("No pot");
  await page.mouse.move(first[0], first[1]);
  await page.mouse.down();
  for (let step = 0; step < 4000; step += 1) {
    if (Number(await pot.getAttribute("data-level")) <= target + 0.01) break;
    const [point] = await svgToScreen(svg, [await guide()]);
    if (point !== undefined) await page.mouse.move(point[0], point[1]);
  }
  await page.mouse.up();
  await page.getByTestId("off-the-heat").click();
}

export async function sizzleByHand(page: Page): Promise<void> {
  await page.getByTestId("pan-start").click();
  const pan = page.getByTestId("sizzle-pan");
  await pan.scrollIntoViewIfNeeded();
  const flipped = new Set<string>();
  const pieces = page.locator("[data-testid^='piece-']");
  for (let guard = 0; guard < 800 && (await pieces.count()) > 0; guard += 1) {
    const count = await pieces.count();
    for (let index = 0; index < count; index += 1) {
      const piece = pieces.nth(index);
      const cook = Number(await piece.getAttribute("data-cook"));
      const side = Number(await piece.getAttribute("data-side"));
      const id = (await piece.getAttribute("data-testid")) ?? "";
      if (cook < 0.97) continue;
      const [x, y] = await middle(piece.locator("circle").first());
      if (side === 0 && !flipped.has(id)) {
        await page.mouse.click(x, y);
        flipped.add(id);
      } else if (side >= 1) {
        const [tray] = await svgToScreen(pan, [[490, 200]]);
        if (tray === undefined) throw new Error("No tray");
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(tray[0], tray[1], { steps: 8 });
        await page.mouse.up();
      }
      break;
    }
  }
}

export async function tasteByHand(page: Page): Promise<void> {
  const compass = page.getByTestId("taste-compass");
  await page.getByTestId("taste-spoon").click();
  const target = ((await compass.getAttribute("data-target")) ?? "0,0").split(",").map(Number);
  const wantSavoury = Number(await compass.getAttribute("data-target-savoury"));
  const jars = page.locator("[data-testid^='jar-']");
  const options: { readonly id: string; readonly vector: readonly number[]; readonly savoury: number }[] = [];
  for (let index = 0; index < (await jars.count()); index += 1) {
    const jar = jars.nth(index);
    options.push({
      id: (await jar.getAttribute("data-testid")) ?? "",
      vector: ((await jar.getAttribute("data-vector")) ?? "0,0").split(",").map(Number),
      savoury: Number(await jar.getAttribute("data-savoury")),
    });
  }
  let point = ((await compass.getAttribute("data-point")) ?? "0,0").split(",").map(Number);
  let savoury = Number(await compass.getAttribute("data-savoury"));
  const distance = (from: readonly number[]) =>
    Math.hypot((from[0] ?? 0) - (target[0] ?? 0), (from[1] ?? 0) - (target[1] ?? 0));
  for (let step = 0; step < 6 && distance(point) > 0; step += 1) {
    const moved = options
      .filter((option) => option.vector.some((value) => value !== 0))
      .map((option) => ({
        option,
        next: [(point[0] ?? 0) + (option.vector[0] ?? 0), (point[1] ?? 0) + (option.vector[1] ?? 0)],
      }))
      .filter((entry) => distance(entry.next) < distance(point))
      .sort((a, b) => distance(a.next) - distance(b.next))[0];
    if (moved === undefined) break;
    await page.getByTestId(moved.option.id).click();
    point = moved.next;
    savoury += moved.option.savoury;
  }
  for (; savoury < wantSavoury; savoury += 1) await page.getByTestId("jar-savoury-pinch").click();
  await page.getByTestId("taste-spoon").click();
  await page.getByTestId("taste-done").click();
}

export async function plateByHand(page: Page): Promise<void> {
  const canvas = page.getByTestId("plate-canvas");
  const tray = page.locator("[data-testid^='tray-']");
  for (let index = 0; index < (await tray.count()); index += 1) {
    const item = tray.nth(index);
    const role = (await item.locator(".ck-tray-item__role").innerText()).toLowerCase();
    if (role !== "hero") {
      await item.click();
      continue;
    }
    await item.scrollIntoViewIfNeeded();
    const [spot] = await svgToScreen(canvas, [[200, 196]]);
    if (spot === undefined) throw new Error("No plate");
    const [x, y] = await middle(item);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(spot[0], spot[1], { steps: 10 });
    await page.mouse.up();
  }
  await page.getByTestId("wipe-rim").click();
  await page.getByTestId("plate-it").click();
}
