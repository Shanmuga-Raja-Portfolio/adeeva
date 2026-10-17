import { expect, test } from "@playwright/test";
import { coins, finishJewelleryStories } from "../fixtures/jewelleryBench";
import { endLoftDay } from "../fixtures/loftBench";
import { isOutsideRequest } from "../fixtures/outsideRequest";
import { openRawJewellery, v1Save } from "../fixtures/preparedJewellery";

test("a version 1 save at the threshold gets the loft offer, opens the loft and keeps it after a reload", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const outside: string[] = [];
  page.on("request", (request) => {
    if (isOutsideRequest(request.url())) outside.push(request.url());
  });
  await openRawJewellery(page, v1Save("threshold"));
  await finishJewelleryStories(page);
  await expect(page.getByTestId("bench-hub")).toBeVisible();
  await expect(page.getByTestId("season-ribbon")).toHaveCount(0);
  const before = await coins(page);

  await page.getByTestId("end-day").click();
  await page.locator(".jb-night").getByRole("button", { name: "Open the bench" }).click();
  const story = page.locator(".jb-story");
  for (let step = 0; step < 30; step += 1) {
    if ((await page.getByRole("heading", { name: "The Spiral Stair" }).count()) > 0) break;
    await story.locator(".jb-story__footer button").first().click();
  }
  await expect(page.getByRole("heading", { name: "The Spiral Stair" })).toBeVisible();
  while ((await page.getByTestId("story-choice-launch").count()) === 0)
    await story.getByRole("button", { name: /Tap to continue/ }).click();
  await expect(page.getByTestId("story-choice-launch")).toBeDisabled();
  await page.getByTestId("story-choice-later").click();
  await finishJewelleryStories(page);

  const card = page.getByTestId("loft-offer-card");
  await expect(card).toBeVisible();
  await expect(page.getByTestId("open-loft")).toBeDisabled();
  await card.getByRole("radio", { name: "Brass Sparrow" }).click();
  await page.getByTestId("open-loft").click();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("loft-offer-card")).toHaveCount(0);
  await expect(page.getByTestId("season-ribbon")).toContainText("Season 1 starts on day");
  await expect(page.getByTestId("line-waiting")).toBeVisible();
  expect(await coins(page)).toBeGreaterThanOrEqual(before - 90);

  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("season-ribbon")).toContainText("Season 1 starts on day");

  for (let day = 0; day < 7 && (await page.getByTestId("theme-card").count()) === 0; day += 1)
    await endLoftDay(page);
  await expect(page.getByTestId("theme-card")).toBeVisible();
  await expect(page.getByTestId("season-ribbon")).toContainText("12 days to Lantern Night");
  await expect(page.locator(".jb-hub-hero")).toContainText("bench and loft rent");
  expect(outside).toEqual([]);
});
