import { expect, test } from "@playwright/test";
import { serialize } from "../../src/games/chef/core";
import { finishChefStories, stat, watchOutside } from "../fixtures/chefKitchen";
import { chooseDoor, endDays, openChefSave, readyHeadChef, savedChef } from "../fixtures/chefPaths";

test("Clementine sets a three-dish menu, fills the fridge and serves a festival", async ({ page }) => {
  test.setTimeout(240_000);
  const outside = watchOutside(page);
  await openChefSave(page, serialize(readyHeadChef("relaxed")));
  await chooseDoor(page, "truck");
  await expect(page.getByRole("heading", { level: 1, name: "Clementine" })).toBeVisible();
  expect(await stat(page, "stat-coins")).toBe(1500 - 300);

  await page.getByTestId("open-menu").click();
  for (const id of ["kelewele", "elote", "jollof-rice"]) await page.getByTestId(`dish-${id}`).click();
  await page.getByTestId("confirm-path-menu").click();
  await expect(page.locator("[data-testid^='price-']")).toHaveCount(3);
  await page.getByTestId("menu-done").click();

  await page.getByTestId("open-ready").click();
  await expect(page.getByTestId("more-kelewele")).toBeDisabled();
  await page.getByRole("button", { name: "Get ready fewer Elote" }).click();
  await expect(page.getByTestId("more-kelewele")).toBeEnabled();
  await page.getByTestId("more-kelewele").click();
  await page.getByTestId("ready-done").click();
  await expect(page.getByTestId("hatch-card")).toContainText("15 ready");

  for (let day = 0; day < 7 && (await page.getByTestId("serve-festival").count()) === 0; day += 1)
    await endDays(page, 1);
  await page.getByTestId("serve-festival").click();
  await expect(page.getByTestId("start-hatch")).toBeDisabled();
  await expect(page.locator(".ck-dish-dialog")).toContainText(
    "They cook for the guests after the first eight tickets.",
  );
  await expect(page.locator(".ck-helpers [tabindex='0']")).toHaveCount(1);
  await page.getByTestId("helper-nilufar").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("helper-sol")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("helper-sol")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("helper-nilufar")).toHaveAttribute("aria-checked", "true");
  const before = await stat(page, "stat-coins");
  await page.getByTestId("start-hatch").click();
  await expect(page.getByTestId("service-rush")).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByTestId("ticket-rail").locator(".ck-slip")).toHaveCount(3);
  await page.getByTestId("team-finish").click();
  await expect(page.getByTestId("festival-report")).toContainText("festival guests");
  await finishChefStories(page);
  await page.getByTestId("service-exit").click();
  await finishChefStories(page);
  await expect(page.getByTestId("festival-map")).toContainText("1 of 8 festivals");
  expect(await stat(page, "stat-coins")).not.toBe(before);

  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishChefStories(page);
  await expect(page.getByTestId("festival-map")).toContainText("1 of 8 festivals");
  expect(await savedChef(page, (state) => state.path?.kind)).toBe("truck");
  expect(outside).toEqual([]);
});
