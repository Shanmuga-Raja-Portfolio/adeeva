import { expect, test } from "@playwright/test";

test("the About page explains privacy and installing, and can delete everything on the device", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("studio.profile", JSON.stringify({ name: "Ada" }));
    window.localStorage.setItem("adeeva.save.1", JSON.stringify({ schemaVersion: 3, reputation: 4 }));
  });
  await page.goto("/#/about");
  const about = page.getByTestId("about-page");
  await expect(about.getByRole("heading", { level: 1 })).toHaveText("About Maker Studio and your privacy");
  for (const heading of [
    "What it keeps, and where",
    "What it never does",
    "Where it lives online",
    "Install it like an app",
    "Saves stay on each device",
    "Deleting everything",
  ])
    await expect(about.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  await expect(about).toContainText("standard request logs");
  await expect(about).toContainText("apart from Safari tabs");

  const iphone = about.getByTestId("install-apple-mobile");
  await iphone.locator("summary").click();
  await expect(iphone).toContainText("Add to Home Screen");
  await expect(iphone.locator("svg[data-scene]")).toHaveCount(3);

  await about.getByRole("button", { name: "Delete everything on this device" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Keep everything" }).click();
  expect(await page.evaluate(() => window.localStorage.getItem("adeeva.save.1"))).not.toBeNull();

  await about.getByRole("button", { name: "Delete everything on this device" }).click();
  const confirm = dialog.getByRole("button", { name: "Delete everything", exact: true });
  await expect(dialog.getByRole("button", { name: "Keep everything" })).toBeFocused();
  await expect(confirm).toBeDisabled();
  const word = dialog.getByLabel("Type delete to confirm");
  await word.fill("delet");
  await expect(confirm).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("adeeva.save.1"))).not.toBeNull();
  await word.fill("Delete");
  await confirm.click();
  await expect(page.getByRole("heading", { name: "Welcome to Maker Studio" })).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);
  expect(await page.evaluate(() => window.localStorage.getItem("adeeva.save.1"))).toBeNull();
});
