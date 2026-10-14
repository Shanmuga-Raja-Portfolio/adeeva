import { expect, test } from "@playwright/test";
import { finishChefStories } from "../fixtures/chefKitchen";

test("home opens Six Kitchens with the studio avatar pre-filled, and Back to studio returns home", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("chef.sound", "off");
    window.localStorage.setItem(
      "studio.profile",
      JSON.stringify({
        version: 1,
        name: "Juno",
        look: { skinTone: "amber", hairStyle: "locs", hairColour: "auburn", outfit: "denim-jacket" },
        accessory: null,
        theme: "morning",
        perks: [],
      }),
    );
  });
  await page.reload();
  const tile = page.getByTestId("tile-chef");
  await expect(tile).toContainText("Open now");
  await expect(tile).toContainText("Cook your way from student to head chef");
  await tile.click();
  await expect(page).toHaveURL(/#\/chef$/);
  await expect(page.getByRole("heading", { level: 1, name: "Six Kitchens" })).toBeFocused({
    timeout: 30_000,
  });

  await page.getByTestId("slot-1").getByRole("button", { name: "Start here" }).click();
  await expect(page.getByLabel("Name")).toHaveValue("Juno");
  await expect(page.getByRole("radio", { name: "Locs" })).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Name").fill("Junia");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Dreamer" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Cookery Student" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  await page.getByRole("button", { name: "Open the kitchen" }).click();
  await finishChefStories(page);
  await expect(page.getByTestId("kitchen-hub")).toBeVisible();
  const profile = await page.evaluate(() => window.localStorage.getItem("studio.profile"));
  expect((JSON.parse(profile ?? "{}") as { name?: string }).name).toBe("Junia");

  await page.getByTestId("save-exit").click();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByTestId("studio-greeting")).toHaveText("Welcome back, Junia");
  expect(await page.evaluate(() => window.localStorage.getItem("chef.save.1"))).not.toBeNull();
});
