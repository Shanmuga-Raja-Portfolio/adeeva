import { expect, test } from "@playwright/test";
import { bakeByHand, pourByHand, pourWithHelper, stirByHand, traceByHand } from "../fixtures/bakeBench";
import { coins, dragBetween, finishBakeryStories, freshPatisserie } from "../fixtures/patisseriePage";

test("a new baker takes Pip's order through every step by hand, then saves and continues", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const outside: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "localhost" && url.protocol !== "data:" && url.protocol !== "blob:")
      outside.push(request.url());
  });
  await freshPatisserie(page);

  await page.getByRole("button", { name: "New Game" }).click();
  await page.getByLabel("Name").fill("Mira");
  await page.getByRole("radio", { name: "Curly puff" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Dreamer" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Relaxed" }).click();
  await page.getByRole("button", { name: "Open the bakery" }).click();
  await expect(page.getByRole("heading", { name: "The Keys to Crumb & Comet" })).toBeVisible();
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  await expect(page.getByTestId("guide-bubble")).toContainText("Pip has an order");
  const startCoins = await coins(page);
  expect(startCoins).toBe(80);

  await page.getByRole("button", { name: "Accept Pip" }).click();
  await page.getByTestId("order-card").getByRole("button", { name: "Start baking" }).click();
  await expect(page.getByRole("heading", { name: "The order card" })).toBeVisible();
  await page.getByTestId("advance-stage").click();

  await page.getByRole("radio", { name: "Cupcake Tray" }).click();
  await page.getByRole("radio", { name: /Vanilla Cloud/ }).click();
  await page.getByRole("button", { name: /^Sky/ }).click();
  await page.getByRole("button", { name: /^Blush/ }).click();
  await page.getByTestId("advance-stage").click();

  await expect(page.getByRole("heading", { name: "The pantry" })).toBeVisible();
  await page.getByTestId("buy-pantry").click();
  await expect(page.getByText("You have everything for this bake.")).toBeVisible();
  await page.getByTestId("advance-stage").click();

  await expect(page.getByRole("heading", { name: "Scoop & Weigh" })).toBeVisible();
  await pourByHand(page, 185);
  await page.getByTestId("keep-weigh").click();
  await page.getByRole("switch", { name: "Scale helper" }).click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "caster-sugar");
  await pourWithHelper(page);
  await page.getByTestId("keep-weigh").click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "butter");
  for (let slice = 0; slice < 7; slice += 1) await page.getByTestId("piece-pad").click();
  await page.getByTestId("keep-weigh").click();
  await expect(page.getByTestId("weigh-station")).toHaveAttribute("data-ingredient", "milk");
  await pourWithHelper(page);
  await page.getByTestId("keep-weigh").click();
  for (let egg = 0; egg < 3; egg += 1)
    await page.getByRole("button", { name: "Tap to crack an egg" }).first().click();
  await page.getByTestId("commit-batch").click();
  await expect(page.getByText("In the bowl!")).toBeVisible();
  await page.getByTestId("advance-stage").click();

  await expect(page.getByRole("heading", { name: "Stir the bowl" })).toBeVisible();
  await stirByHand(page, 3);
  await expect(page.getByText("Smooth and glossy!")).toBeVisible();
  await page.getByTestId("advance-stage").click();

  await expect(page.getByRole("heading", { name: "The oven" })).toBeVisible();
  await page.getByRole("radio", { name: "3 heat dots" }).click();
  await bakeByHand(page);
  await expect(page.locator(".pa-oven-bench__result")).toBeVisible();
  await page.getByTestId("advance-stage").click();

  await expect(page.getByRole("heading", { name: "Stack and fill" })).toBeVisible();
  await page.getByTestId("advance-stage").click();

  await expect(page.getByRole("heading", { name: "Pipe the icing" })).toBeVisible();
  for (let path = 0; path < 3; path += 1) await traceByHand(page);
  await expect(page.getByText("Every line is piped. Beautiful!")).toBeVisible();
  await page.getByTestId("advance-stage").click();

  await expect(page.getByRole("heading", { name: "Toppings" })).toBeVisible();
  const cake = page.locator(".pa-decorate__cake");
  await dragBetween(page, page.getByTestId("topping-sprinkles"), cake);
  await dragBetween(page, page.getByTestId("topping-party-candle"), cake);
  await expect(page.locator(".pa-decorate__hit")).toHaveCount(2);
  await page.getByTestId("advance-stage").click();

  await expect(page.getByRole("heading", { name: "Ready to box" })).toBeVisible();
  await page.getByTestId("deliver").click();
  await expect(page.getByTestId("results")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pip loved it!" })).toBeVisible();
  await expect(page.getByTestId("reward-totals")).toContainText("rep");
  await page.getByTestId("results-exit").click();
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  const afterCoins = await coins(page);
  expect(afterCoins).not.toBe(startCoins);
  const reputation = await page.getByTestId("stat-reputation").innerText();
  expect(Number(reputation.replace(/[^0-9]/g, ""))).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Save & exit" }).click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishBakeryStories(page);
  await expect(page.getByTestId("bakery-hub")).toBeVisible();
  expect(await coins(page)).toBe(afterCoins);
  await page.getByRole("button", { name: "Open the Bake Book" }).click();
  await expect(page.getByTestId("bake-book")).toContainText("Pip");
  expect(outside).toEqual([]);
});

test("the studio opens Patisserie Atelier and comes back home", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("tile-patisserie")).not.toContainText("In the workshop");
  await page.getByRole("link", { name: /Play Patisserie Atelier/ }).click();
  await expect(page).toHaveURL(/#\/patisserie$/);
  await expect(page.getByRole("heading", { level: 1, name: "Patisserie Atelier" })).toBeVisible();
  await page.getByRole("button", { name: "Back to studio" }).click();
  await expect(page.getByTestId("studio-home")).toBeVisible();
  await expect(page).toHaveURL(/#\/$/);
});
