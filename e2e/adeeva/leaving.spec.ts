import { expect, test, type Page } from "@playwright/test";
import { newTestGame } from "../../src/games/adeeva/core/testPlaythrough";
import { openPreparedGame, savedState, settleStories } from "../fixtures/preparedGame";
import { recordToasts, toastsSeen } from "../fixtures/toastLog";

async function acceptFirstOffer(page: Page): Promise<void> {
  await page
    .getByTestId("offer-card")
    .first()
    .getByRole("button", { name: /^Accept/ })
    .click();
}

async function leaveByHash(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.location.hash = "#/";
  });
  await expect(page.getByTestId("studio-home")).toBeVisible();
}

test("leaving through the address bar keeps the move made just before", async ({ page }) => {
  await openPreparedGame(page, settleStories(newTestGame({ seed: 7, name: "Ada" })));
  expect(await savedState(page, (state) => state.gigs.active.length)).toBe(0);
  await acceptFirstOffer(page);
  await leaveByHash(page);
  expect(await savedState(page, (state) => state.gigs.active.length)).toBe(1);
});

test("going Back straight after opening the studio keeps the new game", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByRole("link", { name: /Play ADEEVA/ }).click();
  await page.getByRole("button", { name: "New Game" }).click();
  const next = page.getByRole("button", { name: "Next" });
  await page.getByLabel("Name").fill("Quinn");
  await next.click();
  await page.getByRole("radio", { name: "Charmer" }).click();
  await next.click();
  await page.getByRole("radio", { name: "Student Designer" }).click();
  await next.click();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  await page.getByRole("button", { name: "Open the studio" }).click();
  await page.goBack();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  expect(await savedState(page, (state) => state.profile.name)).toBe("Quinn");
  await page.getByRole("link", { name: /Play ADEEVA/ }).click();
  await expect(page.getByTestId("slot-1")).toContainText("Quinn");
});

test("leaving while the browser refuses to save says so on the way out", async ({ page }) => {
  await openPreparedGame(page, settleStories(newTestGame({ seed: 7, name: "Ada" })));
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith("adeeva.save")) throw new DOMException("full", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  const toasts = await recordToasts(page);
  await acceptFirstOffer(page);
  await leaveByHash(page);
  await expect.poll(() => toastsSeen(toasts, "We couldn't save your last few moments", "warning")).toBe(1);
  expect(await savedState(page, (state) => state.gigs.active.length)).toBe(0);
});
