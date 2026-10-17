import { expect, test, type Page } from "@playwright/test";
import {
  advance,
  cutByHand,
  finishJewelleryStories,
  freshJewellery,
  newJeweller,
  polishByHand,
  setStoneByHand,
  warmByHand,
} from "../fixtures/jewelleryBench";

async function focusedTestId(page: Page): Promise<string | null> {
  return page.evaluate(() => document.activeElement?.getAttribute("data-testid") ?? null);
}

async function cutRound(page: Page): Promise<number> {
  const text = await page.locator(".jb-cut-loupe .jb-stats strong").first().innerText();
  return Number(text.replace(/\D/g, ""));
}

async function tireSeamInSave(page: Page, jointId: string): Promise<void> {
  await page.getByRole("button", { name: "Back to the arcade" }).first().click();
  await page.getByTestId("save-exit").click();
  await page.evaluate((joint) => {
    for (const key of Object.keys(window.localStorage)) {
      if (!key.startsWith("jewellery.save.")) continue;
      const save = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
        activeRun: { joins: Record<string, unknown> };
      };
      save.activeRun.joins[joint] = {
        ticks: 3600,
        insideTicks: 20,
        overTicks: 3000,
        assisted: false,
        twin: false,
      };
      window.localStorage.setItem(key, JSON.stringify(save));
    }
  }, jointId);
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishJewelleryStories(page);
  await page.getByRole("button", { name: "Back to the bench" }).first().click();
}

test("the bench keeps half-cut shapes, carries keyboard focus, rests a tired seam and stays on the rubbed part", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await freshJewellery(page);
  await newJeweller(page);
  await page.getByRole("button", { name: "Accept Gran Mina" }).click();
  await page.getByTestId("order-card").getByRole("button", { name: "Start making" }).click();
  await advance(page);
  await page.getByRole("radio", { name: /^Brass/ }).click();
  await page.getByRole("radio", { name: /^Garnet/ }).click();
  await advance(page);
  await page.getByTestId("buy-fits").click();
  await advance(page);
  await page.getByRole("button", { name: "Show me" }).click();
  await advance(page);

  await expect(page.getByRole("heading", { name: "Cut out" })).toBeVisible();
  await cutByHand(page, 0.3);
  const partial = await cutRound(page);
  expect(partial).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Back to the arcade" }).first().click();
  await page.getByRole("button", { name: "Back to the bench" }).first().click();
  await expect(page.getByRole("heading", { name: "Cut out" })).toBeVisible();
  expect(await cutRound(page)).toBe(partial);
  await page.getByTestId("cut-restart").click();
  expect(await cutRound(page)).toBe(0);
  for (let part = 0; part < 3; part += 1) await cutByHand(page);
  await expect(page.getByText("Every shape is cut out. Crisp edges!")).toBeVisible();
  await advance(page);

  await expect(page.getByRole("heading", { name: "The Joining Lamp" })).toBeVisible();
  await page.getByTestId("warm-button").focus();
  await warmByHand(page, "keyboard");
  await expect.poll(() => focusedTestId(page)).toBe("warm-button");

  await tireSeamInSave(page, "loop");
  await expect(page.getByRole("heading", { name: "The Joining Lamp" })).toBeVisible();
  await expect(page.getByText("This seam got tired. Tap Restart to try again.")).toBeVisible();
  await expect(page.getByTestId("warm-button")).toBeDisabled();
  await page.getByTestId("restart-seam").click();
  await expect(page.getByTestId("warm-button")).toBeEnabled();
  await expect(page.getByText("This seam got tired.")).toHaveCount(0);
  await page.getByTestId("warm-button").focus();
  await warmByHand(page, "keyboard");
  await expect(page.getByText("Every seam is joined. Smooth as silk!")).toBeVisible();
  await expect.poll(() => focusedTestId(page)).toBe("advance-stage");
  await advance(page);

  await setStoneByHand(page);
  await advance(page);

  await expect(page.getByRole("heading", { name: "Polish" })).toBeVisible();
  await polishByHand(page);
  const picked = page.locator(".jb-work__item[aria-pressed='true']");
  await expect(picked).toContainText("Pendant");
  expect(Number((await page.getByTestId("polish-pad").getAttribute("data-shine")) ?? "0")).toBeGreaterThan(
    0.9,
  );
  await page.getByTestId("polish-next").click();
  await expect(picked).toContainText("Stone seat");
});
