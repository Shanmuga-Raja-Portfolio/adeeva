import { describe, expect, it } from "vitest";
import { launchThemeById } from "./catalog";
import type { CollectionPiece, LookbookPage } from "./collectionState";
import { awardFor } from "./lanternGarland";
import { launchPanels, launchTip, type LaunchInputs } from "./launchPanels";
import { launchPrize } from "./launchPrize";
import { bestPlan, lanternNightLine, stagedLaunch } from "./linePlaythrough";
import { marketReputationBonus } from "./marketReputationBonus";
import { reduce } from "./reduce";

const theme = launchThemeById("first-blossom");

function piece(id: string, overrides: Partial<CollectionPiece> = {}): CollectionPiece {
  return {
    id,
    look: {
      productId: "shape-pendant",
      options: { shape: "leaf", accent: "plain" },
      metalId: "silver",
      stoneId: null,
      stoneTint: null,
      finish: "high-shine",
      glaze: null,
      chain: "fine-chain",
      cordColour: null,
      charms: [],
    },
    quality: 88,
    tags: ["nature", "elegant"],
    colours: ["silver", "sage"],
    madeDay: 3,
    slot: 0,
    runId: `run-${id}`,
    cutAccuracy: 0.88,
    motifCutAccuracy: 0.82,
    joinAccuracy: 0.9,
    setAccuracy: null,
    polish: 0.95,
    carriesMotif: true,
    potStones: [],
    sparkle: 2,
    spend: 20,
    partArea: 900,
    sheetArea: 2000,
    sweetSpot: 90,
    ...overrides,
  };
}

function page(pieceId: string, light: number): LookbookPage {
  return { pieceId, backdrop: "linen", props: [], lampAngle: 90, light, assisted: false };
}

function inputs(pieces: CollectionPiece[], pages: LookbookPage[]): LaunchInputs {
  return {
    theme,
    pieces,
    pages,
    plan: {
      order: pieces.map((entry) => entry.id),
      lantern: theme.lantern,
      music: theme.music,
      card: theme.bestCard,
    },
    finish: "high-shine",
  };
}

describe("Lantern Night panels", () => {
  it("weighs Craft Table parts as specified", () => {
    const [craft] = launchPanels(inputs([piece("a"), piece("b")], [page("a", 0.8), page("b", 0.8)]));
    expect(craft?.parts.map((part) => [part.id, part.value, part.weight])).toEqual([
      ["craft", 88, 0.5],
      ["cuts", 88, 0.15],
      ["joins", 90, 0.15],
      ["sheet", 90, 0.1],
      ["metal", 80, 0.1],
    ]);
    expect(craft?.score).toBe(Math.round(44 + 13.2 + 13.5 + 9 + 8));
  });

  it("gives Palette 0.45 in the Harmony Circle when the line has no stones", () => {
    const [, harmony] = launchPanels(inputs([piece("a"), piece("b")], []));
    expect(harmony?.parts.map((part) => [part.id, part.weight])).toEqual([
      ["motif", 0.35],
      ["crisp", 0.2],
      ["palette", 0.45],
    ]);
    const stones = [{ stoneId: "garnet" as const, tint: "true" as const, shimmer: 2 as const }];
    const [, withStones] = launchPanels(inputs([piece("a", { potStones: stones }), piece("b")], []));
    expect(withStones?.parts.map((part) => part.id)).toEqual(["motif", "crisp", "stones", "palette"]);
  });

  it("scores Sparkle Lanterns with shimmer or the finish's sparkle, page light and the lantern", () => {
    const [, , sparkle] = launchPanels(inputs([piece("a")], [page("a", 0.8)]));
    expect(sparkle?.parts.map((part) => [part.id, part.value])).toEqual([
      ["shine", 95],
      ["shimmer", 100],
      ["light", 80],
      ["lantern", 100],
    ]);
    const missing = launchPanels({
      ...inputs([piece("a")], []),
      plan: { ...inputs([piece("a")], []).plan, lantern: "teal" },
    });
    expect(missing[2]?.parts.find((part) => part.id === "light")?.value).toBe(0);
    expect(missing[2]?.parts.find((part) => part.id === "lantern")?.value).toBe(40);
  });

  it("scores Story Corner with theme fit, styling, staging and the closer", () => {
    const pieces = [piece("a", { quality: 70 }), piece("b", { quality: 95 })];
    const [, , , story] = launchPanels(inputs(pieces, [page("a", 1), page("b", 1)]));
    expect(story?.parts.map((part) => [part.id, part.value])).toEqual([
      ["theme", 100],
      ["styling", 50],
      ["staging", 100],
      ["reveal", 88],
    ]);
    const tip = launchTip(launchPanels(inputs(pieces, [])));
    expect(tip.startsWith("Next time, try")).toBe(true);
  });
});

describe("awards and prizes", () => {
  it("bands awards by overall with fixed edges", () => {
    expect(awardFor(54)).toBe("lantern-ribbon");
    expect(awardFor(55)).toBe("ribbon-of-merit");
    expect(awardFor(69)).toBe("ribbon-of-merit");
    expect(awardFor(70)).toBe("silver-lantern");
    expect(awardFor(84)).toBe("silver-lantern");
    expect(awardFor(85)).toBe("gold-lantern");
    expect(awardFor(94)).toBe("gold-lantern");
    expect(awardFor(95)).toBe("moonlit-lantern");
  });

  it("pays 25 + 15 × spot + 4 × (overall − 50) and steps the spot at 70, or 75 on Challenging", () => {
    expect(launchPrize(83, 2, "standard")).toMatchObject({
      coins: 187,
      award: "silver-lantern",
      spotAfter: 3,
      buzz: 8,
    });
    expect(launchPrize(69, 2, "standard").spotAfter).toBe(2);
    expect(launchPrize(74, 2, "challenging").spotAfter).toBe(2);
    expect(launchPrize(75, 2, "challenging").spotAfter).toBe(3);
    expect(launchPrize(40, 1, "standard")).toMatchObject({ coins: 40, reputation: 0 });
    expect(launchPrize(40, 1, "challenging").reputation).toBe(-1);
    expect(launchPrize(99, 4, "standard").spotAfter).toBe(4);
  });

  it("offers a bigger spot on Relaxed from 55 instead of moving it", () => {
    expect(launchPrize(90, 1, "relaxed")).toMatchObject({ spotAfter: 1, spotOffer: true });
    expect(launchPrize(54, 1, "relaxed").spotOffer).toBe(false);
    const night = lanternNightLine({ difficulty: "relaxed" });
    const launched = stagedLaunch(night);
    expect(launched.launch?.spot).toBe(1);
    expect(launched.launch?.spotOffer).toBe(true);
    const moved = reduce(launched, { type: "moveSpot" });
    expect(moved.launch?.spot).toBe(2);
    expect(reduce(moved, { type: "moveSpot" })).toBe(moved);
  });

  it("stages the Launch once, pays, files keepsakes and lights the garland", () => {
    const night = lanternNightLine();
    const plan = bestPlan(night);
    const launched = stagedLaunch(night, plan);
    const result = launched.launch?.result;
    if (result === null || result === undefined) throw new Error("no result");
    expect(launched.coins).toBe(night.coins + result.coins);
    expect(launched.calendar.hoursLeft).toBe(0);
    expect(launched.launch?.garland[result.themeId]).toBe(result.award);
    expect(launched.launch?.awardsBySeason["1"]).toBe(result.award);
    expect(launched.keepsakes.filter((entry) => entry.source.kind === "collection")).toHaveLength(
      plan.order.length,
    );
    expect(launched.story.seen).toContain("jb-first-launch");
    expect(reduce(launched, { type: "stageLaunch", ...plan })).toBe(launched);
  });
});

describe("Market Day at depth", () => {
  it("multiplies stall sales by 1 + clamp(reputation − 20, 0, 40) ÷ 40", () => {
    expect(marketReputationBonus(0)).toBe(1);
    expect(marketReputationBonus(20)).toBe(1);
    expect(marketReputationBonus(45)).toBe(1.625);
    expect(marketReputationBonus(60)).toBe(2);
    expect(marketReputationBonus(90)).toBe(2);
  });
});
