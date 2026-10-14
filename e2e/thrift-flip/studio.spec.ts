import { expect, test } from "@playwright/test";
import { finishStories } from "../fixtures/story";

test("home opens Thrift-Flip Studio, the avatar comes pre-filled and Back to studio returns home", async ({
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
  const tile = page.getByTestId("tile-thrift-flip");
  await expect(tile).toContainText("Open now");
  await tile.click();
  await expect(page).toHaveURL(/#\/thrift-flip$/);
  await expect(page.getByRole("heading", { level: 1, name: "Thrift-Flip Studio" })).toBeFocused({
    timeout: 30_000,
  });

  await page.getByTestId("slot-1").getByRole("button", { name: "Start here" }).click();
  await expect(page.getByLabel("Name")).toHaveValue("Juno");
  await expect(page.getByRole("radio", { name: "Locs" })).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Name").fill("Juniper");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Dreamer" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Market Stall Remaker" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Standard" }).click();
  await page.getByRole("button", { name: "Open the stall" }).click();
  await finishStories(page);
  await expect(page.getByTestId("stall-hub")).toBeVisible();
  const profile = await page.evaluate(() => window.localStorage.getItem("studio.profile"));
  expect(JSON.parse(profile ?? "{}").name).toBe("Juniper");

  await page.getByTestId("save-exit").click();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByTestId("studio-greeting")).toHaveText("Welcome back, Juniper");
  expect(await page.evaluate(() => window.localStorage.getItem("thrift-flip.save.1"))).not.toBeNull();
});
