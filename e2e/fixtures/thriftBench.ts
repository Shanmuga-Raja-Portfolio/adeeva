import { expect, type Page } from "@playwright/test";
import { centreOf, drag } from "./thriftPage";

export async function scrollIntoView(page: Page, selector: string) {
  await page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo(0, Math.max(0, top));
    });
}

export async function snipStitches(page: Page) {
  const bench = page.getByTestId("stitch-bench");
  await scrollIntoView(page, ".tf-workbench__table");
  const stitches = bench.locator('[data-stitch][data-popped="no"]');
  const first = await centreOf(stitches.nth(0).locator(".tf-stitch__hit"));
  const second = await centreOf(stitches.nth(1).locator(".tf-stitch__hit"));
  const spacing = Math.hypot(second[0] - first[0], second[1] - first[1]);
  const before = await bench.locator('[data-popped="yes"]').count();
  await drag(page, first, [first[0], first[1] + spacing * 0.55]);
  await expect(bench.locator('[data-popped="yes"]')).toHaveCount(before + 1);
  await page.getByRole("switch", { name: /Assist snip/ }).click();
  const chips = page.locator(".tf-workbench__lines .tf-line-chip");
  const lineCount = await chips.count();
  for (let line = 0; line < lineCount; line += 1) {
    await chips.nth(line).click();
    for (let guard = 0; guard < 20; guard += 1) {
      const open = page.getByTestId("stitch-bench").locator('[data-stitch][data-popped="no"]');
      if ((await open.count()) === 0) break;
      await page.mouse.click(...(await centreOf(open.first().locator(".tf-stitch__hit"))));
    }
  }
  const tabs = page.locator('.tf-workbench__top [role="tab"]');
  if ((await tabs.count()) > 1) {
    await tabs.nth(1).click();
    for (let line = 0; line < (await chips.count()); line += 1) {
      await chips.nth(line).click();
      for (let guard = 0; guard < 20; guard += 1) {
        const open = page.getByTestId("stitch-bench").locator('[data-stitch][data-popped="no"]');
        if ((await open.count()) === 0) break;
        await page.mouse.click(...(await centreOf(open.first().locator(".tf-stitch__hit"))));
      }
    }
  }
}

export async function scrubOneStain(page: Page) {
  const scrubber = page.getByTestId("stain-scrubber");
  await scrollIntoView(page, ".tf-workbench__table");
  const box = await scrubber.boundingBox();
  if (box === null) throw new Error("No stain on the bench");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const radius = box.width * 0.17;
  await page.mouse.move(cx + radius, cy);
  await page.mouse.down();
  for (let turn = 0; turn < 40; turn += 1) {
    const angle = (turn / 8) * Math.PI * 2;
    await page.mouse.move(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, { steps: 4 });
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await expect.poll(async () => Number(await scrubber.getAttribute("data-scrub-ticks"))).toBeGreaterThan(0);
}

export async function sewSeams(page: Page, onFirstSeam: () => Promise<void>): Promise<void> {
  const bed = page.getByTestId("sewing-bed");
  for (let seam = 0; seam < 6; seam += 1) {
    if (await page.getByTestId("advance-stage").isEnabled()) break;
    await scrollIntoView(page, ".ad-machine");
    const [x, y] = await centreOf(bed);
    await page.mouse.move(x, y);
    await page.mouse.down();
    if (seam === 0) {
      await expect
        .poll(async () => Number(await bed.getAttribute("data-progress")), { timeout: 20_000 })
        .toBeGreaterThan(0.3);
      await onFirstSeam();
    }
    await expect(bed).toHaveAttribute("data-done", "true", { timeout: 20_000 });
    await page.mouse.up();
    const next = page.getByTestId("next-seam");
    if (await next.isVisible()) await next.click();
  }
}
