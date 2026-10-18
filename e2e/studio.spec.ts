import { expect, test, type Page } from "@playwright/test";
import { ADEEVA_URL } from "./fixtures/adeevaPage";
import { finishStories } from "./fixtures/story";
import { isOutsideRequest } from "./fixtures/outsideRequest";
import { recordToasts, toastsSeen } from "./fixtures/toastLog";

function watchOutsideRequests(page: Page): string[] {
  const outside: string[] = [];
  page.on("request", (request) => {
    if (isOutsideRequest(request.url())) outside.push(request.url());
  });
  return outside;
}

async function freshStudio(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("studio-home")).toBeVisible();
}

async function makeDesigner(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: "New Game" }).click();
  const next = page.getByRole("button", { name: "Next" });
  await expect(page.getByLabel("Name")).toHaveValue("");
  await page.getByLabel("Name").fill(name);
  await page.getByRole("radio", { name: "Braids" }).click();
  await next.click();
  await page.getByRole("radio", { name: "Charmer" }).click();
  await next.click();
  await page.getByRole("radio", { name: "Student Designer" }).click();
  await next.click();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  await page.getByRole("button", { name: "Open the studio" }).click();
  await finishStories(page);
  await expect(page.getByTestId("studio-hub")).toBeVisible();
}

test("the home screen shows seven games and ADEEVA opens and returns home", async ({ page }) => {
  const outside = watchOutsideRequests(page);
  await freshStudio(page);
  await expect(page.getByRole("heading", { name: "Welcome to Maker Studio" })).toBeVisible();
  await expect(page.locator("[data-testid^='tile-']")).toHaveCount(7);
  await expect(page.locator("a[data-testid^='tile-']")).toHaveCount(7);
  await expect(page.getByTestId("tile-thrift-flip")).toContainText("Thrift-Flip Studio");
  await expect(page.getByTestId("tile-thrift-flip")).toHaveAttribute("href", "#/thrift-flip");
  await expect(page.getByTestId("tile-jewellery")).toContainText("Jewellery Bench");
  await expect(page.getByTestId("tile-jewellery")).toHaveAttribute("href", "#/jewellery");
  await expect(page.getByTestId("tile-interior")).toContainText("Interior Studio");
  await expect(page.getByTestId("tile-interior")).toHaveAttribute("href", "#/interior");
  await expect(page.getByTestId("tile-chef")).toContainText("Six Kitchens");
  await expect(page.getByTestId("tile-chef")).toHaveAttribute("href", "#/chef");
  await expect(page.getByTestId("studio-reputation")).toContainText("Studio reputation");
  await expect(page.getByTestId("perk-rose-gold-hair")).toContainText("Unlocks at 4 reputation");

  await page.getByRole("link", { name: /Play ADEEVA/ }).click();
  await expect(page).toHaveURL(/#\/adeeva$/);
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);

  await page.goBack();
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
  expect(outside).toEqual([]);
});

test("the avatar made in ADEEVA appears on the home screen and comes back pre-filled", async ({ page }) => {
  const outside = watchOutsideRequests(page);
  await freshStudio(page);
  await page.goto(ADEEVA_URL);
  await makeDesigner(page, "Zuri");
  await page.getByRole("button", { name: "Save & exit" }).click();
  await page.getByRole("button", { name: "Back to studio" }).click();

  await expect(page.getByTestId("studio-greeting")).toHaveText("Welcome back, Zuri");
  await expect(page.getByRole("img", { name: "Zuri, your maker" })).toBeVisible();
  const look = await page.evaluate(() => {
    const raw = window.localStorage.getItem("studio.profile");
    return raw === null ? null : (JSON.parse(raw) as { name: string; look: { hairStyle: string } });
  });
  expect(look?.name).toBe("Zuri");
  expect(look?.look.hairStyle).toBe("braids");

  await page.getByRole("link", { name: /Play ADEEVA/ }).click();
  await page.getByTestId("slot-2").getByRole("button", { name: "Start here" }).click();
  await expect(page.getByLabel("Name")).toHaveValue("Zuri");
  await expect(page.getByRole("radio", { name: "Braids" })).toHaveAttribute("aria-checked", "true");
  expect(outside).toEqual([]);
});

test("the parent page shows the promise, playtime and how to clear saves", async ({ page }) => {
  const outside = watchOutsideRequests(page);
  await page.clock.install();
  await freshStudio(page);
  await page.getByRole("link", { name: "Parent page" }).click();
  await expect(page.getByTestId("playtime-adeeva")).toContainText("Not played yet");

  await page.goto(ADEEVA_URL);
  await makeDesigner(page, "Ada");
  await page.clock.fastForward(1500);
  await page.getByRole("button", { name: "Save & exit" }).click();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await page.getByRole("link", { name: "Parent page" }).click();

  const parent = page.getByTestId("parent-page");
  await expect(parent).toContainText("What this studio does not do");
  await expect(parent).toContainText("No chat and no contact with other players.");
  await expect(page.getByTestId("playtime-adeeva")).toContainText("Under a minute");

  await parent.getByRole("button", { name: "Clear ADEEVA saves" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Clear saves" }).click();
  await expect(parent.getByRole("button", { name: "Clear ADEEVA saves" })).toBeDisabled();
  expect(await page.evaluate(() => window.localStorage.getItem("adeeva.save.1"))).toBeNull();

  await page.getByRole("link", { name: "Back to the studio" }).click();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  expect(outside).toEqual([]);
});

test("an unknown page leads home with a tidy address", async ({ page }) => {
  await freshStudio(page);
  for (const hash of ["#/nowhere", "#/attic-of-dreams"]) {
    await page.evaluate((next) => {
      window.location.hash = next;
    }, hash);
    await expect(page.getByTestId("studio-home")).toBeVisible();
    await expect(page).toHaveURL(/#\/$/);
  }
});

test("moving between the studio and a game puts focus somewhere useful", async ({ page }) => {
  await freshStudio(page);
  await page.getByRole("link", { name: /Play ADEEVA/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "ADEEVA" })).toBeFocused();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByRole("link", { name: /Play ADEEVA/ })).toBeFocused();
  await page.getByRole("link", { name: "Parent page" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /How Maker Studio looks after/ })).toBeFocused();
});

test("several perks unlocked at once arrive as one message", async ({ page }) => {
  await freshStudio(page);
  await page.evaluate(() => {
    const save = { schemaVersion: 3, reputation: 60, profile: { career: "student" } };
    window.localStorage.setItem("adeeva.save.1", JSON.stringify(save));
    const jewellery = { schemaVersion: 1, reputation: 30, profile: { trait: "dreamer" } };
    window.localStorage.setItem("jewellery.save.1", JSON.stringify(jewellery));
    const chef = { schemaVersion: 1, reputation: 30, profile: { trait: "charmer", start: "student" } };
    window.localStorage.setItem("chef.save.1", JSON.stringify(chef));
  });
  const toasts = await recordToasts(page);
  await page.reload();
  await expect.poll(() => toastsSeen(toasts, "8 new perks unlocked!")).toBe(1);
  expect(await toasts()).toHaveLength(1);
});

test("a save ADEEVA cannot open earns no studio reputation", async ({ page }) => {
  await freshStudio(page);
  await page.evaluate(() => {
    window.localStorage.setItem("adeeva.save.1", JSON.stringify({ reputation: 999 }));
  });
  await page.reload();
  await expect(page.getByTestId("perk-rose-gold-hair")).toContainText("Unlocks at 4 reputation");
  await expect(page.locator(".ad-toast")).toHaveCount(0);
});
