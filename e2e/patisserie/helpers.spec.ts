import { expect, test } from "@playwright/test";
import { pourWithHelper } from "../fixtures/bakeBench";
import { pipOrderAt } from "../fixtures/benchStates";
import { openPreparedBench, savedBakery } from "../fixtures/preparedBakery";

test("a helped weigh stays helped when the scale helper is switched off", async ({ page }) => {
  await openPreparedBench(page, pipOrderAt("weigh"));
  const helper = page.getByRole("switch", { name: "Scale helper" });
  await helper.click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "flour");
  await pourWithHelper(page);
  await page.getByTestId("keep-weigh").click();
  await expect
    .poll(() => savedBakery(page, (state) => state.activeRun?.batches[0]?.weighs.flour?.assisted))
    .toBe(true);

  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "caster-sugar");
  await pourWithHelper(page);
  await helper.click();
  await expect(helper).toHaveAttribute("aria-checked", "false");
  await expect(page.getByTestId("keep-weigh")).toBeDisabled();

  await page.locator(".pa-weigh__item").first().click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "flour");
  await page.getByTestId("keep-weigh").click();
  await expect(page.locator(".pa-weigh__item").first()).toContainText("80%");
  await page.waitForTimeout(600);
  expect(await savedBakery(page, (state) => state.activeRun?.batches[0]?.weighs.flour?.assisted)).toBe(true);
});

test("stirring with the arrow keys counts as a steady-spoon stir", async ({ page }) => {
  await openPreparedBench(page, pipOrderAt("mix"));
  await expect(page.getByRole("switch", { name: "Steady spoon" })).toHaveAttribute("aria-checked", "false");
  const bowl = page.getByTestId("stir-bowl");
  await bowl.focus();
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(async () => Number((await bowl.getAttribute("data-progress")) ?? "0"), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(0.5);
  await page.keyboard.up("ArrowRight");
  await expect
    .poll(() => savedBakery(page, (state) => state.activeRun?.batches[0]?.stir?.assisted))
    .toBe(true);
});
