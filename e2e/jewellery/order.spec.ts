import { expect, test } from "@playwright/test";
import {
  advance,
  coins,
  cutByHand,
  dragOnto,
  finishJewelleryStories,
  freshJewellery,
  newJeweller,
  polishByHand,
  setStoneByHand,
  warmByHand,
} from "../fixtures/jewelleryBench";
import { isOutsideRequest } from "../fixtures/outsideRequest";

test("a new jeweller makes Gran Mina's pendant by hand, delivers it, then saves and continues", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const outside: string[] = [];
  page.on("request", (request) => {
    if (isOutsideRequest(request.url())) outside.push(request.url());
  });
  await freshJewellery(page);

  await newJeweller(page);
  await expect(page.getByTestId("coach-bubble")).toContainText("Gran Mina");
  const startCoins = await coins(page);
  expect(startCoins).toBe(100);

  await page.getByRole("button", { name: "Accept Gran Mina" }).click();
  await page.getByTestId("order-card").getByRole("button", { name: "Start making" }).click();
  await expect(page.getByRole("heading", { name: "The order tag" })).toBeVisible();
  await advance(page);

  await expect(page.getByRole("heading", { name: "Design the piece" })).toBeVisible();
  await page.getByRole("radio", { name: /^Brass/ }).click();
  await page.getByRole("radio", { name: /^Garnet/ }).click();
  await advance(page);

  await expect(page.getByRole("heading", { name: "The Supply Cabinet" })).toBeVisible();
  await page.getByTestId("buy-fits").click();
  await expect(page.getByText("You have everything for this piece.")).toBeVisible();
  expect(Number((await page.getByTestId("bench-coins").innerText()).replace(/\D/g, ""))).toBe(85);
  await advance(page);

  await expect(page.getByRole("heading", { name: "Plan your sheet" })).toBeVisible();
  await dragOnto(page, page.getByTestId("tray-plate"), page.getByTestId("sheet-sheet"));
  await expect(page.getByTestId("placed-plate")).toBeVisible();
  await page.getByRole("button", { name: "Show me" }).click();
  await expect(page.getByText("Every shape has its own space.")).toBeVisible();
  await advance(page);

  await expect(page.getByRole("heading", { name: "Cut out" })).toBeVisible();
  for (let part = 0; part < 3; part += 1) await cutByHand(page);
  await expect(page.getByText("Every shape is cut out. Crisp edges!")).toBeVisible();
  await advance(page);

  await expect(page.getByRole("heading", { name: "The Joining Lamp" })).toBeVisible();
  await warmByHand(page);
  await page.getByRole("switch", { name: "Steady lamp" }).click();
  await expect(page.getByText("Every seam is joined. Smooth as silk!")).toBeVisible({ timeout: 20_000 });
  await advance(page);

  await expect(page.getByRole("heading", { name: "Set the stones" })).toBeVisible();
  await setStoneByHand(page);
  await expect(page.getByText("Every stone is snug in its claws!")).toBeVisible();
  await advance(page);

  await expect(page.getByRole("heading", { name: "Polish" })).toBeVisible();
  await polishByHand(page);
  await page.getByRole("switch", { name: "Buffing wheel" }).click();
  for (const name of ["Stone seat", "Loop"]) {
    await page.locator(".jb-work__item", { hasText: name }).click();
    await page.getByTestId("buff").click();
  }
  await advance(page);

  await expect(page.getByRole("heading", { name: "Display" })).toBeVisible();
  await page.getByRole("radio", { name: "Fine Chain" }).click();
  await advance(page);

  await expect(page.getByRole("heading", { name: "Ready to wrap" })).toBeVisible();
  await page.getByTestId("deliver").click();
  await expect(page.getByTestId("results")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: /Gran Mina/ })).toBeVisible();
  await expect(page.getByTestId("reward-totals")).toContainText("rep");
  await page.getByTestId("results-exit").click();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("bench-hub")).toBeVisible();
  const afterCoins = await coins(page);
  expect(afterCoins).not.toBe(startCoins);
  expect(Number((await page.getByTestId("stat-reputation").innerText()).replace(/\D/g, ""))).toBeGreaterThan(
    0,
  );

  await page.getByTestId("save-exit").click();
  await page.reload();
  await page.getByRole("button", { name: /^Continue/ }).click();
  await finishJewelleryStories(page);
  await expect(page.getByTestId("bench-hub")).toBeVisible();
  expect(await coins(page)).toBe(afterCoins);
  await page.getByRole("button", { name: "Open the Keepsake Case" }).click();
  await expect(page.getByTestId("keepsake-case")).toContainText("Gran Mina");
  expect(outside).toEqual([]);
});
