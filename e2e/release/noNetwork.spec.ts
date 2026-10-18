import { expect, test } from "@playwright/test";
import { foreignRequests, watchPolicy } from "../fixtures/policyWatch";
import { finishStories } from "../fixtures/story";

test("the studio and a game stay on their own address under the strict policy", async ({
  context,
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL ?? "").origin;
  const watch = await watchPolicy(context, page);
  const response = await page.goto("/");
  const policy = (await response?.allHeaders())?.["content-security-policy"] ?? "";
  expect(policy).toContain("default-src 'self'");
  expect(policy).toContain("frame-ancestors 'none'");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("studio-home")).toBeVisible();

  await page.getByRole("link", { name: /Play ADEEVA/ }).click();
  await page.getByRole("button", { name: "New Game" }).click();
  const next = page.getByRole("button", { name: "Next" });
  await page.getByLabel("Name").fill("Noor");
  await next.click();
  await page.getByRole("radio", { name: "Charmer" }).click();
  await next.click();
  await page.getByRole("radio", { name: "Student Designer" }).click();
  await next.click();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  await page.getByRole("button", { name: "Open the studio" }).click();
  await finishStories(page);
  await expect(page.getByTestId("studio-hub")).toBeVisible();
  await page.getByRole("button", { name: "Save & exit" }).click();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByTestId("studio-greeting")).toHaveText("Welcome back, Noor");

  await page.getByRole("link", { name: /Play Six Kitchens/ }).click();
  await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await page.getByRole("link", { name: "About and privacy" }).click();
  await expect(page.getByTestId("about-page")).toBeVisible();

  await watch.collect();
  expect(watch.requests.length).toBeGreaterThan(0);
  expect(foreignRequests(watch.requests, origin)).toEqual([]);
  expect(watch.breaches).toEqual([]);
});

test("the policy watch notices when the strict policy blocks something", async ({ context, page }) => {
  const watch = await watchPolicy(context, page);
  await page.goto("/");
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = "body { outline: 1px solid red; }";
    document.head.append(style);
  });
  await expect
    .poll(async () => {
      await watch.collect();
      return watch.breaches.join("\n");
    })
    .toMatch(/style-src/);
});
