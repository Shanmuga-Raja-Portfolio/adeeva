import { expect, type Page } from "@playwright/test";
import { tapMalletOnce } from "./mallet";
import { svgToScreen, tracePath, type ScreenPoint } from "./workshopPage";

function densify(points: readonly ScreenPoint[], spacing: number): ScreenPoint[] {
  return points.flatMap((point, index) => {
    const next = points[index + 1];
    if (next === undefined) return [point];
    const steps = Math.max(1, Math.ceil(Math.hypot(next[0] - point[0], next[1] - point[1]) / spacing));
    return Array.from({ length: steps }, (_, step): ScreenPoint => [
      point[0] + ((next[0] - point[0]) * step) / steps,
      point[1] + ((next[1] - point[1]) * step) / steps,
    ]);
  });
}

export async function placeOnePartByHand(page: Page, partId: string) {
  const tray = page.getByTestId(`tray-${partId}`);
  await tray.scrollIntoViewIfNeeded();
  await tray.focus();
  await page.keyboard.press("Enter");
  const placed = page.getByTestId("layout-canvas").locator(`[data-part-id="${partId}"]`);
  await expect(placed).toHaveCount(1);
  await placed.focus();
  for (let step = 0; step < 4; step += 1) await page.keyboard.press("ArrowRight");
  await expect(placed).toHaveAttribute("data-assisted", "false");
}

export async function sawOneLineByHand(page: Page) {
  const bench = page.getByTestId("saw-bench");
  await bench.scrollIntoViewIfNeeded();
  const cut = JSON.parse((await bench.getAttribute("data-cut")) ?? "[]") as [number, number][];
  await tracePath(page, densify(await svgToScreen(bench, cut), 3));
  await expect(page.locator(".ww-saw__message")).toContainText(/Clean cut|is cut out/);
}

export async function sawRestOnRail(page: Page) {
  await page.getByRole("switch", { name: "Guide rail" }).click();
  for (let part = 0; part < 30; part += 1) {
    const rail = page.getByTestId("saw-rail");
    if ((await rail.count()) === 0) break;
    await rail.click();
    await expect(rail)
      .toBeEnabled({ timeout: 5000 })
      .catch(() => undefined);
  }
  await expect(page.getByText("Every part is cut out.")).toBeVisible();
}

export async function joinRestWithMagnet(page: Page, taps: number) {
  await page.getByRole("switch", { name: "Magnet helper" }).click();
  for (let joint = 0; joint < 30; joint += 1) {
    if ((await page.getByText("Every joint is tapped home.").count()) > 0) break;
    for (let tap = 0; tap < taps; tap += 1)
      await tapMalletOnce(page, () => page.getByTestId("mallet").click());
  }
  await expect(page.getByText("Every joint is tapped home.")).toBeVisible();
}
