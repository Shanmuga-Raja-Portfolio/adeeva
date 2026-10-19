import { expect, test } from "@playwright/test";
import { openThriftSave } from "../fixtures/boutiqueSaves";
import { thriftFinish } from "../fixtures/compactStages";
import { stillBox } from "../fixtures/settle";
import { widestSidewaysScroll } from "../fixtures/sidewaysScroll";
import { finishStories } from "../fixtures/story";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("Thrift-Flip: every tab of the finishing drawer fits the screen without scrolling sideways", async ({
  page,
}) => {
  const view = page.viewportSize();
  if (view === null) throw new Error("No viewport");
  await openThriftSave(page, thriftFinish());
  await finishStories(page);
  await page
    .getByTestId("gig-card")
    .getByRole("button", { name: /^Continue/ })
    .click();
  const drawer = page.locator(".tf-drawer");
  for (const tab of ["patches", "saved", "tin", "marks"]) {
    await drawer.locator(`[data-drawer=${tab}]`).click();
    await expect(drawer.locator(`[data-drawer=${tab}]`)).toHaveAttribute("aria-selected", "true");
    const box = await stillBox(drawer);
    expect(box.x + box.width, `drawer right edge on ${tab}`).toBeLessThanOrEqual(view.width + 1);
    for (const button of await drawer.getByRole("tab").all()) {
      const tabBox = await stillBox(button);
      expect(tabBox.x + tabBox.width, `tab inside the drawer on ${tab}`).toBeLessThanOrEqual(
        box.x + box.width + 1,
      );
    }
    expect(await widestSidewaysScroll(page), `sideways scroll on ${tab}`).toBe(0);
  }
});
