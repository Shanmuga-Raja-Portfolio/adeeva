import { expect, type Page } from "@playwright/test";
import { finishJewelleryStories } from "./jewelleryBench";

export async function endLoftDay(page: Page): Promise<void> {
  await page.getByTestId("end-day").click();
  await page.locator(".jb-night").getByRole("button", { name: "Open the bench" }).click();
  await finishJewelleryStories(page);
}

function zoneNumbers(raw: string | null): number[] {
  return (raw ?? "0.7,0.85,0.76,0.91").split(",").map(Number);
}

export async function warmTwinByHand(page: Page): Promise<void> {
  const bench = page.getByTestId("twin-bench");
  const [, firstTo, secondFrom] = zoneNumbers(await bench.getAttribute("data-zones"));
  const low = (secondFrom ?? 0.76) + 0.008;
  const high = (secondFrom ?? 0.76) + ((firstTo ?? 0.85) - (secondFrom ?? 0.76)) * 0.6;
  const button = page.getByTestId("warm-button");
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  if (box === null) throw new Error("No warm button");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const done = async () => (await page.getByTestId("twin-note").count()) > 0;
  const warmth = async () =>
    Number(
      await page.evaluate(
        () => document.querySelector("[data-testid='twin-bench']")?.getAttribute("data-warmth") ?? "0",
      ),
    );
  for (let pulse = 0; pulse < 80 && !(await done()); pulse += 1) {
    await page.mouse.down();
    await expect
      .poll(async () => (await done()) || (await warmth()) >= high, { timeout: 10_000, intervals: [30] })
      .toBe(true);
    await page.mouse.up();
    await expect
      .poll(async () => (await done()) || (await warmth()) <= low, { timeout: 10_000, intervals: [30] })
      .toBe(true);
  }
  await expect(page.getByTestId("twin-note")).toBeVisible();
}

export async function buffTheRest(page: Page): Promise<void> {
  const wheel = page.getByRole("switch", { name: "Buffing wheel" });
  if ((await wheel.getAttribute("aria-checked")) !== "true") await wheel.click();
  const items = page.locator(".jb-polish .jb-work__item");
  const count = await items.count();
  for (let index = 0; index < count; index += 1) {
    await items.nth(index).click();
    const buff = page.getByTestId("buff");
    if ((await buff.count()) > 0 && (await buff.isEnabled())) await buff.click();
  }
}
