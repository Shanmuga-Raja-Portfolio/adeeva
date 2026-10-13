import { expect, test } from "@playwright/test";
import { newTestGame } from "../../src/games/patisserie/core/testPlaythrough";
import { serialize } from "../../src/games/patisserie/core";
import { PATISSERIE_URL } from "../fixtures/patisseriePage";

test("a double click on the last story line still shows that line", async ({ page }) => {
  await page.goto(PATISSERIE_URL);
  await page.evaluate((json) => {
    window.localStorage.clear();
    window.localStorage.setItem("patisserie.save.1", json);
    window.localStorage.setItem("patisserie.lastSlot", "1");
  }, serialize(newTestGame()));
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  const story = page.locator(".pa-story");
  await expect(story).toBeVisible();
  const title = await story.locator(".pa-story__title").innerText();
  const pips = story.locator(".pa-story__pip");
  const lines = await pips.count();
  for (let line = 1; line < lines - 1; line += 1)
    await story.getByRole("button", { name: "Tap to continue" }).click();
  await story.getByRole("button", { name: "Tap to continue" }).dblclick();
  await expect(story.locator(".pa-story__line")).toHaveCount(lines);
  await expect(story.locator(".pa-story__title")).toHaveText(title);
  await story.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
});
