import { expect, test, type Page } from "@playwright/test";
import { controlledStudio } from "../fixtures/controlledStudio";

interface MarkedWindow {
  sameVisit?: boolean;
}

async function publishNextVersion(page: Page): Promise<void> {
  await page.evaluate(async () => {
    (window as MarkedWindow).sameVisit = true;
    await navigator.serviceWorker.register("/sw.js?next=1", { scope: "/", updateViaCache: "none" });
  });
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined && registration.waiting !== null;
      }),
    )
    .toBe(true);
}

test("a new version waits quietly through a game, then restarts only when asked", async ({ page }) => {
  await controlledStudio(page);
  await page.getByRole("link", { name: /Play ADEEVA/ }).click();
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();

  await publishNextVersion(page);
  await expect(page.getByTestId("update-notice")).toHaveCount(0);
  expect(await page.evaluate(() => (window as MarkedWindow).sameVisit)).toBe(true);

  await page.getByRole("button", { name: "Back to studio" }).click();
  const notice = page.getByTestId("update-notice");
  await expect(notice).toContainText("A new version is ready — restart when you like.");
  await notice.getByRole("button", { name: "Later" }).click();
  await expect(notice).toHaveCount(0);
  expect(await page.evaluate(() => (window as MarkedWindow).sameVisit)).toBe(true);

  await page.getByRole("link", { name: "About and privacy" }).click();
  await page.getByRole("link", { name: "Back to the studio" }).click();
  await expect(page.getByTestId("update-notice")).toHaveCount(0);
});

test("Restart moves the studio onto the waiting version", async ({ page }) => {
  await controlledStudio(page);
  await publishNextVersion(page);
  const notice = page.getByTestId("update-notice");
  await expect(notice).toBeVisible();
  const reloaded = page.waitForEvent("load");
  await notice.getByRole("button", { name: "Restart" }).click();
  await reloaded;
  expect(await page.evaluate(() => (window as MarkedWindow).sameVisit ?? false)).toBe(false);
  await expect(page.getByTestId("studio-home")).toBeVisible();
  expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? "")).toMatch(
    /\/sw\.js\?next=1$/,
  );
});
