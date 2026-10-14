import { expect, test, type Locator } from "@playwright/test";
import { advance, watchOutsideRequests } from "../fixtures/interiorStudio";
import { nookAt, openPreparedRoom, showHomeAt } from "../fixtures/preparedInterior";

async function spot(item: Locator): Promise<[number, number]> {
  const transform = (await item.getAttribute("transform")) ?? "";
  const match = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(transform);
  return [Number(match?.[1]), Number(match?.[2])];
}

test("a Bellwind show home is styled by keyboard, revealed with a tap on the track, then opens its Open House", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const outside = watchOutsideRequests(page);
  await openPreparedRoom(page, showHomeAt("style"));
  await expect(page.getByRole("heading", { name: "Style the room" })).toBeVisible();

  for (const decorId of ["framed-print", "potted-fern", "wall-clock"]) {
    await page.getByTestId(`stock-${decorId}`).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId(`placed-${decorId}`)).toBeVisible();
  }
  const fern = page.getByTestId("placed-potted-fern");
  const [x, y] = await spot(fern);
  await fern.focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  await expect.poll(() => spot(fern)).toEqual([x - 16, y - 8]);
  await advance(page);

  await expect(page.getByTestId("reveal-stage")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "The big reveal" })).toBeFocused();
  const track = await page.locator(".is-reveal__track").boundingBox();
  if (track === null) throw new Error("No reveal track");
  await page.mouse.click(track.x + track.width - 4, track.y + track.height / 2);
  await expect(page.getByTestId("reveal-handle")).toHaveAttribute("aria-valuenow", /^(9[2-9]|100)$/);
  await page.getByTestId("reveal-button").click();

  await expect(page.getByTestId("results")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: /Delphine Achebe/ })).toBeFocused();
  const openHouse = page.getByTestId("open-house");
  await expect(openHouse).toBeVisible();
  await expect(openHouse).toContainText("Open House score");
  await expect(openHouse).toContainText(/enquir/);
  const panel = await openHouse.boundingBox();
  const exit = await page.getByTestId("results-exit").boundingBox();
  if (panel === null || exit === null) throw new Error("No results layout");
  expect(exit.y).toBeGreaterThan(panel.y + panel.height - 1);
  expect(outside).toEqual([]);
});

test("the plan keeps keyboard focus, ignores a double tap and offers Settings from the makeover", async ({
  page,
}) => {
  await openPreparedRoom(page, nookAt("plan"));
  await expect(page.getByRole("heading", { name: "Pick and place" })).toBeVisible();
  await expect(page.locator(".is-plan__hint[role='status']")).toContainText(
    "Tap a piece to pick it, then Turn ↻.",
  );

  await page.getByTestId("tray-bookcase").dblclick();
  await expect(page.getByTestId("placed-bookcase")).toHaveCount(1);
  await page.getByTestId("placed-bookcase").focus();
  await page.keyboard.press("Delete");
  await expect(page.getByTestId("placed-bookcase")).toHaveCount(0);
  await expect(page.getByTestId("tray-bookcase")).toBeFocused();

  await page.getByTestId("makeover-settings").click();
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toContainText("Tidy up helper");
  await expect(dialog).toContainText("80%, or 70% on Challenging");
});
