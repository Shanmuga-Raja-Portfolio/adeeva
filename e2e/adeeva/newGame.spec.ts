import { expect, test, type Page } from "@playwright/test";
import { openAdeeva } from "../fixtures/adeevaPage";
import { finishStories } from "../fixtures/story";

async function savedDay(page: Page, slot: number): Promise<number | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as { calendar?: { day?: number } };
    return parsed.calendar?.day ?? null;
  }, `adeeva.save.${slot}`);
}

test.beforeEach(async ({ page }) => {
  await openAdeeva(page);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("a new designer reaches the studio, takes a gig, ends the day and continues after reload", async ({
  page,
}) => {
  await page.getByRole("button", { name: "New Game" }).click();

  const next = page.getByRole("button", { name: "Next" });
  await expect(next).toBeDisabled();
  await page.getByLabel("Name").fill("Ada");
  await page.getByRole("radio", { name: "Braids" }).click();
  await next.click();

  await expect(next).toBeDisabled();
  await page.getByRole("radio", { name: "Dreamer" }).click();
  await next.click();

  await page.getByRole("radio", { name: "Student Designer" }).click();
  await next.click();

  const begin = page.getByRole("button", { name: "Open the studio" });
  await expect(begin).toBeDisabled();
  await page.getByRole("radio", { name: "Standard" }).click();
  await begin.click();

  await expect(page.locator(".ad-story")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Thread One" })).toBeVisible();
  await finishStories(page);

  const hub = page.getByTestId("studio-hub");
  await expect(hub).toBeVisible();
  await expect(page.getByTestId("stat-day")).toContainText("Day 1");
  await expect(page.getByTestId("stat-coins")).toContainText("120");
  await expect(page.getByRole("heading", { name: "Good morning, Ada" })).toBeVisible();

  const offers = page.getByTestId("offer-card");
  const offerCount = await offers.count();
  expect(offerCount).toBeGreaterThan(0);
  await offers
    .first()
    .getByRole("button", { name: /^Accept/ })
    .click();
  await expect(page.getByTestId("gig-card")).toHaveCount(1);
  await expect(offers).toHaveCount(offerCount - 1);
  await expect(page.getByTestId("gig-card").getByRole("button", { name: "Start sewing" })).toBeEnabled();

  await page.getByRole("button", { name: "End day" }).click();
  await expect(page.getByRole("heading", { name: /Day 2/ })).toBeVisible();
  await page.getByRole("button", { name: "Start the day" }).click();
  await finishStories(page);
  await expect(page.getByTestId("stat-day")).toContainText("Day 2");

  await expect.poll(() => savedDay(page, 1)).toBe(2);
  await page.reload();
  const resume = page.getByRole("button", { name: /^Continue/ });
  await expect(resume).toContainText("Ada");
  await expect(resume).toContainText("Day 2");
  await resume.click();
  await finishStories(page);
  await expect(page.getByTestId("stat-day")).toContainText("Day 2");
  await expect(page.getByTestId("gig-card")).toHaveCount(1);
});

test("a damaged save slot explains itself instead of loading", async ({ page }) => {
  await page.evaluate(() => window.localStorage.setItem("adeeva.save.2", "{not a real save"));
  await page.reload();
  const slot = page.getByTestId("slot-2");
  await expect(slot).toContainText("This save can't be opened.");
  await expect(slot).toContainText("damaged");
  await expect(page.getByRole("button", { name: /^Continue/ })).toHaveCount(0);
  await slot.getByRole("button", { name: "Delete save" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(slot).toContainText("An empty rail");
});
