import { expect, test, type Page } from "@playwright/test";
import { advance, finishChefStories, freshChef, newChef } from "../fixtures/chefKitchen";
import { chopClockAtLeast, holdChopBoard } from "../fixtures/chopBoardClock";
import { stillBox } from "../fixtures/settle";

test.use({ viewport: { width: 1280, height: 800 } });

const instruction = (page: Page) => page.getByTestId("station-instruction");

async function boardMiddle(page: Page): Promise<[number, number]> {
  const surface = page.getByTestId("chop-surface");
  await surface.scrollIntoViewIfNeeded();
  const box = await stillBox(surface);
  return [box.x + box.width / 2, box.y + box.height / 2];
}

async function fillBowls(page: Page): Promise<void> {
  await expect(instruction(page)).toHaveText("Drag each ingredient into a bowl. Everything in its place!");
  const tiles = page.locator("[data-testid^='tile-']");
  while ((await tiles.count()) > 0) await tiles.first().click();
  await expect(instruction(page)).toHaveText("All in place! Tap Start cooking.");
  await advance(page);
}

test("the mince board shows one instruction that follows the hold", async ({ page }) => {
  test.setTimeout(120_000);
  await freshChef(page);
  await newChef(page, "Cookery Student", "Standard");
  await page.getByTestId("start-lesson").click();
  await expect(page.locator(".ck-story")).toBeVisible();
  await finishChefStories(page);
  await expect(page.getByTestId("coach-bubble")).toHaveText("Read the ticket, then tap Get ready.");
  await advance(page);
  await expect(page.getByTestId("coach-bubble")).toHaveCount(0);
  await fillBowls(page);

  const board = page.getByTestId("chop-board");
  const held = await holdChopBoard(page);
  await expect(instruction(page)).toHaveCount(1);
  await expect(page.getByTestId("coach-bubble")).toHaveCount(0);
  await expect(instruction(page)).toHaveText(
    "Tap Start chopping, then hold the board for the green stretch.",
  );
  const stretch = JSON.parse((await board.getAttribute("data-stretch")) ?? "null") as [number, number] | null;
  if (stretch === null) throw new Error("The dal's chop should be a mince");
  const [x, y] = await boardMiddle(page);
  await page.getByTestId("chop-start").click();
  await expect(instruction(page)).toHaveText("When green reaches the knife, press and hold the board.");
  await expect(instruction(page)).not.toContainText(/tap/i);
  await page.mouse.move(x, y);
  await chopClockAtLeast(page, held, stretch[0] - 15);
  await page.mouse.down();
  await expect(instruction(page)).toHaveText("Keep holding, then let go when the green ends!");
  await chopClockAtLeast(page, held, stretch[1] - 15);
  await page.mouse.up();
  await expect(page.getByTestId("simmer-pot")).toBeVisible();
  await expect(instruction(page)).toHaveText("Press and hold, then follow the glowing spoon.");
});

test("dice and slice boards ask for taps, switch when the board turns, and Auto-rhythm asks for a hold", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await freshChef(page);
  await newChef(page, "Head Chef", "Relaxed");
  await page.getByTestId("practice").click();
  await page.getByTestId("dish-chana-masala").click();
  await page.getByTestId("confirm-dishes").click();
  await finishChefStories(page);
  await advance(page);
  await fillBowls(page);

  const board = page.getByTestId("chop-board");
  const held = await holdChopBoard(page);
  await expect(instruction(page)).toHaveText("Tap Start chopping, then tap as marks meet the knife line.");
  const marks = JSON.parse((await board.getAttribute("data-marks")) ?? "[]") as number[];
  const turn = Number(await board.getAttribute("data-turn"));
  expect(turn).toBeGreaterThan(0);
  const [x, y] = await boardMiddle(page);
  await page.getByTestId("chop-start").click();
  await expect(instruction(page)).toHaveText("Tap the board as each mark meets the knife line.");
  for (const mark of marks.filter((at) => at < turn)) {
    await chopClockAtLeast(page, held, mark - 20);
    await page.mouse.click(x, y);
  }
  await chopClockAtLeast(page, held, turn);
  await expect(instruction(page)).toHaveText("The board turns. Keep tapping on the beat!");
  for (const mark of marks.filter((at) => at > turn)) {
    await chopClockAtLeast(page, held, mark - 20);
    await page.mouse.click(x, y);
  }

  await expect(board).toHaveAttribute("data-turn", "");
  await expect(instruction(page)).toHaveText("Tap Start chopping, then tap as marks meet the knife line.");
  await page.getByRole("switch", { name: "Auto-rhythm" }).click();
  await expect(instruction(page)).toHaveText(
    "Tap Start chopping, then hold the board. The knife keeps the beat.",
  );
  await page.getByTestId("chop-start").click();
  await expect(instruction(page)).toHaveText("Hold the board down and the knife keeps the beat.");
  const [sliceX, sliceY] = await boardMiddle(page);
  await page.mouse.move(sliceX, sliceY);
  await page.mouse.down();
  await expect(instruction(page)).toHaveText("Keep holding! The knife chops on the beat.");
  await page.mouse.up();
  await expect(instruction(page)).toHaveText("Hold the board down and the knife keeps the beat.");
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(instruction(page)).toHaveText("Paused. Tap Resume when you're ready.");
  await page.getByRole("button", { name: "Resume" }).click();
  await expect(instruction(page)).toHaveText("Hold the board down and the knife keeps the beat.");
});
