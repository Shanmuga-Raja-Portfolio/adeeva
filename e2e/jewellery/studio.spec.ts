import { expect, test } from "@playwright/test";
import { finishJewelleryStories } from "../fixtures/jewelleryBench";

test("home opens Jewellery Bench with the studio avatar pre-filled, and Back to studio returns home", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
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
  const tile = page.getByTestId("tile-jewellery");
  await expect(tile).toContainText("Open now");
  await expect(tile).toContainText("Cut, join and set tiny treasures.");
  await tile.click();
  await expect(page).toHaveURL(/#\/jewellery$/);
  await expect(page.getByRole("heading", { level: 1, name: "Jewellery Bench" })).toBeFocused({
    timeout: 30_000,
  });

  await page.getByTestId("slot-1").getByRole("button", { name: "Start here" }).click();
  await expect(page.getByLabel("Name")).toHaveValue("Juno");
  await expect(page.getByRole("radio", { name: "Locs" })).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Name").fill("Juniper");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Dreamer" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("radio", { name: "Lantern Bench" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  await page.getByRole("button", { name: "Open the bench" }).click();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("bench-hub")).toBeVisible();
  const profile = await page.evaluate(() => window.localStorage.getItem("studio.profile"));
  expect(JSON.parse(profile ?? "{}").name).toBe("Juniper");

  await page.getByTestId("save-exit").click();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByTestId("studio-greeting")).toHaveText("Welcome back, Juniper");
  expect(await page.evaluate(() => window.localStorage.getItem("jewellery.save.1"))).not.toBeNull();
});
