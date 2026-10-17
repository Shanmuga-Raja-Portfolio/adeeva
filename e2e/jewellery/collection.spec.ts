import { expect, test, type Page } from "@playwright/test";
import {
  advance,
  cutByHand,
  dragOnto,
  finishJewelleryStories,
  polishByHand,
  setStoneByHand,
} from "../fixtures/jewelleryBench";
import { depthShooter } from "../fixtures/depthShots";
import { buffTheRest, warmTwinByHand } from "../fixtures/loftBench";
import { isOutsideRequest } from "../fixtures/outsideRequest";
import { openPreparedJewellery, themedLoft } from "../fixtures/preparedJewellery";

interface TrayGem {
  readonly index: number;
  readonly tint: string;
  readonly price: number;
}

async function trayGems(page: Page): Promise<TrayGem[]> {
  const buttons = page.getByTestId("gem-tray").getByRole("button");
  const gems: TrayGem[] = [];
  for (let index = 0; index < (await buttons.count()); index += 1) {
    const button = buttons.nth(index);
    gems.push({
      index,
      tint: (await button.getAttribute("data-tint")) ?? "",
      price: Number(await button.getAttribute("data-price")),
    });
  }
  return gems;
}

function matchingPair(gems: readonly TrayGem[]): readonly [TrayGem, TrayGem] {
  const tints = [...new Set(gems.map((gem) => gem.tint))];
  const pairs = tints.flatMap((tint) => {
    const [first, second] = gems.filter((gem) => gem.tint === tint).sort((a, b) => a.price - b.price);
    return first !== undefined && second !== undefined ? [[first, second] as const] : [];
  });
  const best = pairs.sort((a, b) => a[0].price + a[1].price - (b[0].price + b[1].price))[0];
  if (best === undefined) throw new Error("No matching pair on the tray");
  return best;
}

const VIEWPORTS = [
  { width: 1280, height: 800 },
  { width: 820, height: 1180 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`a line piece at ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    test("a Collection Designer plans a line, buys matching stones and makes a pair piece by hand", async ({
      page,
    }, info) => {
      const shot = depthShooter(page, info, `jb-${viewport.width}`);
      test.setTimeout(300_000);
      const outside: string[] = [];
      page.on("request", (request) => {
        if (isOutsideRequest(request.url())) outside.push(request.url());
      });
      await openPreparedJewellery(page, themedLoft());

      await page.getByTestId("open-board").click();
      await expect(page.getByTestId("collection-board")).toBeVisible();
      await expect(page.getByTestId("confirm-board")).toBeDisabled();
      await page.getByTestId("board-product-stone-drops").click();
      await page.getByTestId("board-product-shape-pendant").click();
      await page.getByTestId("board-product-stack-ring").click();
      await page.getByRole("radio", { name: "Leaf" }).click();
      await page.getByRole("radio", { name: /^Silver/ }).click();
      await page.getByRole("radio", { name: /^High Shine/ }).click();
      await page
        .getByRole("radiogroup", { name: "Hero stone" })
        .getByRole("radio", { name: /^Sky Glass/ })
        .click();
      await expect(page.getByTestId("harmony-detail")).toContainText("Motif on 67%");
      await expect(page.getByTestId("board-tray")).toBeInViewport();
      await page.getByTestId("board-product-stack-ring").click();
      await page.getByTestId("board-product-bangle").click();
      await expect(page.getByTestId("harmony-detail")).toContainText("Motif on 100%");
      await page.getByTestId("confirm-board").click();
      await finishJewelleryStories(page);
      await expect(page.getByTestId("line-card")).toBeVisible();

      await page.getByTestId("open-gems").click();
      await expect(page.getByTestId("gem-market")).toBeVisible();
      await expect(page.getByTestId("buy-gems")).toBeDisabled();
      const [first, second] = matchingPair(await trayGems(page));
      const tray = page.getByTestId("gem-tray").getByRole("button");
      await dragOnto(page, tray.nth(first.index), page.getByTestId("line-pot"));
      await expect(page.getByTestId(`pot-gem-${first.index}`)).toBeVisible();
      await tray.nth(first.index).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId(`pot-gem-${first.index}`)).toHaveCount(0);
      await expect(tray.nth(first.index)).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId(`pot-gem-${first.index}`)).toBeVisible();
      await expect(tray.nth(first.index)).toBeFocused();
      const step = second.index > first.index ? "ArrowRight" : "ArrowLeft";
      for (let moves = 0; moves < Math.abs(second.index - first.index); moves += 1)
        await page.keyboard.press(step);
      await expect(tray.nth(second.index)).toBeFocused();
      await page.keyboard.down("Space");
      await expect(page.getByTestId("gem-loupe")).toBeVisible();
      await page.keyboard.up("Space");
      await expect(page.getByTestId("gem-loupe")).toHaveCount(0);
      await page.keyboard.press("Enter");
      await expect(page.getByTestId(`pot-gem-${second.index}`)).toBeVisible();
      await expect(tray.nth(second.index)).toBeFocused();
      await page.getByTestId("buy-gems").click();
      await finishJewelleryStories(page);
      await expect(page.getByTestId("step-gems")).toContainText("Line Pot filled");

      await page.getByTestId("start-line-0").click();
      await expect(page.getByRole("heading", { name: "Design the piece" })).toBeVisible();
      await expect(page.getByTestId("locked-shape")).toContainText("Leaf");
      await shot("20-line-design");
      await advance(page);
      await expect(page.getByRole("heading", { name: "The Supply Cabinet" })).toBeVisible();
      await page.getByTestId("buy-fits").click();
      await advance(page);
      await expect(page.getByRole("heading", { name: "Plan your sheet" })).toBeVisible();
      await page.getByRole("button", { name: "Show me" }).click();
      await expect(page.getByText("Every shape has its own space.")).toBeVisible();
      await shot("21-line-plan");
      await advance(page);

      await expect(page.getByRole("heading", { name: "Cut out" })).toBeVisible();
      await expect(page.getByTestId("motif-master")).toContainText("becomes the motif master");
      await shot("22-line-cut");
      for (let part = 0; part < 8 && (await page.getByTestId("cut-loupe").count()) > 0; part += 1)
        await cutByHand(page);
      await expect(page.getByText("Every shape is cut out. Crisp edges!")).toBeVisible();
      await advance(page);

      await expect(page.getByRole("heading", { name: "The Joining Lamp" })).toBeVisible();
      await expect(page.getByRole("radio", { name: "Join both" })).toHaveAttribute("aria-checked", "true");
      await shot("23-twin-lamp");
      await warmTwinByHand(page);
      await expect(page.getByText("Every seam is joined. Smooth as silk!")).toBeVisible();
      await advance(page);

      await expect(page.getByRole("heading", { name: "Set the stones" })).toBeVisible();
      await expect(page.getByText("Pick stones from your Line Pot first.")).toBeVisible();
      const potStones = page.getByTestId("pot-picker").getByRole("button");
      await potStones.nth(0).click();
      await potStones.nth(1).click();
      await shot("24-pot-picker");
      await setStoneByHand(page);
      await setStoneByHand(page);
      await expect(page.getByText("Every stone is snug in its claws!")).toBeVisible();
      await advance(page);

      await expect(page.getByRole("heading", { name: "Polish" })).toBeVisible();
      await expect(page.getByTestId("shine-bar")).toContainText("This piece");
      await shot("25-shine-bar");
      await polishByHand(page);
      await buffTheRest(page);
      await advance(page);

      await expect(page.getByRole("heading", { name: "Display" })).toBeVisible();
      await expect(page.getByTestId("line-finish")).toContainText("High Shine");
      await shot("26-line-display");
      await advance(page);
      await expect(page.getByRole("heading", { name: "Ready for the line" })).toBeVisible();
      await page.getByTestId("add-to-line").click();
      await expect(page.getByTestId("line-progress")).toContainText("1 of 3 pieces");
      await shot("27-line-results");
      await page.getByTestId("results-exit").click();
      await finishJewelleryStories(page);
      await expect(page.getByTestId("line-slot-0")).toContainText("Quality");

      await page.getByTestId("save-exit").click();
      await page.reload();
      await page.getByRole("button", { name: /^Continue/ }).click();
      await finishJewelleryStories(page);
      await expect(page.getByTestId("line-slot-0")).toContainText("Quality");
      await expect(page.getByTestId("start-line-1")).toBeVisible();
      expect(outside).toEqual([]);
    });
  });
}
