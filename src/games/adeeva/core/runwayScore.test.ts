import { describe, expect, it } from "vitest";
import { FABRICS } from "../content/fabric";
import { PART_CATEGORIES } from "../content/garmentPart";
import { SHOW_THEMES } from "../content/showTheme";
import type { TrimId } from "../content/trim";
import type { Decoration, Design } from "./dressRun";
import { garmentTags } from "./dressTags";
import type { FinishedLook } from "./finishedLook";
import { reduce } from "./reduce";
import {
  closerStrength,
  ORDER_BASE_VALUE,
  ORDER_VALUE_PER_SEASON,
  scoreRunway,
  wowTrimCount,
  type RunwayChoice,
  type RunwayContext,
} from "./runwayScore";
import { craftToReview, newTestGame } from "./testPlaythrough";

function deliveredLook(): FinishedLook {
  const start = reduce(newTestGame({ career: "label", seed: 11 }), { type: "startLook", lookIndex: 0 });
  const look = reduce(craftToReview(start), { type: "deliver" }).season?.looks[0];
  if (look === undefined || look === null) throw new Error("expected a finished look");
  return look;
}

function decorated(look: FinishedLook, trims: readonly TrimId[]): FinishedLook {
  const decorations: Decoration[] = trims.map((trimId, index) => ({
    id: `decoration-${index + 1}`,
    trimId,
    x: 200,
    y: 300 + index * 20,
    rotation: 0,
    scale: 1,
    layer: index,
  }));
  return { ...look, snapshot: { ...look.snapshot, decorations } };
}

function partOf(look: FinishedLook, panelId: string, partId: string): number {
  const theme = SHOW_THEMES[0];
  if (theme === undefined) throw new Error("expected a theme");
  const result = scoreRunway([look, look, look], theme, choice, context);
  const value = result.panels.find((panel) => panel.id === panelId)?.parts.find((part) => part.id === partId);
  if (value === undefined) throw new Error(`expected ${panelId} ${partId}`);
  return value.value;
}

const choice: RunwayChoice = { order: [0, 1, 2], mood: "dreamy-strings", light: "cool" };
const context: RunwayContext = { seasonNumber: 1, late: false, difficulty: "standard" };

describe("audience wow", () => {
  it("counts each distinct bold, dreamy or regal trim once", () => {
    const look = deliveredLook();
    expect(wowTrimCount(decorated(look, []))).toBe(0);
    expect(wowTrimCount(decorated(look, ["button", "button", "bow", "lace", "ribbon-belt"]))).toBe(0);
    expect(wowTrimCount(decorated(look, ["sequin-patch", "sequin-patch", "sequin-patch"]))).toBe(1);
    expect(wowTrimCount(decorated(look, ["sequin-patch", "pearl", "flower-applique", "button"]))).toBe(3);
  });

  it("scores 25 points per distinct wow trim and ignores piles of plain trims", () => {
    const look = deliveredLook();
    const bare = partOf(decorated(look, []), "audience", "wow");
    expect(partOf(decorated(look, ["button", "button", "button", "button"]), "audience", "wow")).toBe(bare);
    const twoWow = decorated(look, ["sequin-patch", "star-applique", "button", "sequin-patch"]);
    expect(partOf(twoWow, "audience", "wow")).toBe(bare + 25);
    const fourWow = decorated(look, ["sequin-patch", "star-applique", "pearl", "flower-applique", "lace"]);
    expect(partOf(fourWow, "audience", "wow")).toBe(bare + 50);
  });
});

describe("buyers' wearability", () => {
  it("reads the garment, not the trims", () => {
    const look = deliveredLook();
    const parts: Design["parts"] = {
      bodice: "corset-bodice",
      neckline: "sweetheart-neckline",
      sleeves: "puff-sleeve",
      skirt: "ballgown-skirt",
    };
    const designs = FABRICS.map((fabric): Design => ({
      parts,
      fabrics: Object.fromEntries(
        PART_CATEGORIES.map((category) => [category, fabric.id]),
      ) as Design["fabrics"],
    }));
    const design = designs.find(
      (entry) => !garmentTags(entry).some((tag) => tag === "casual" || tag === "classic"),
    );
    if (design === undefined) throw new Error("expected a dressy design without everyday tags");
    const dressy = { ...look, snapshot: { ...look.snapshot, design } };
    const buttoned = decorated(dressy, ["button", "ribbon-belt"]);
    expect(buttoned.snapshot.decorations).toHaveLength(2);
    expect(partOf(buttoned, "buyers", "wearability")).toBe(0);
  });
});

describe("runway orders", () => {
  it("grow 10 coins per order each season until season 5", () => {
    const theme = SHOW_THEMES[0];
    if (theme === undefined) throw new Error("expected a theme");
    const looks = [deliveredLook(), deliveredLook(), deliveredLook()];
    const valueAt = (seasonNumber: number) => {
      const result = scoreRunway(looks, theme, choice, { ...context, seasonNumber });
      return result.orders === 0 ? 0 : result.coins / result.orders;
    };
    expect(ORDER_VALUE_PER_SEASON).toBe(10);
    expect(valueAt(1)).toBe(ORDER_BASE_VALUE);
    expect(valueAt(2)).toBe(ORDER_BASE_VALUE + 10);
    expect(valueAt(5)).toBe(ORDER_BASE_VALUE + 40);
    expect(valueAt(9)).toBe(ORDER_BASE_VALUE + 40);
  });
});

describe("show flow parity", () => {
  it("keeps the closer and opener maths now shared with the engine", () => {
    const look = deliveredLook();
    const scored = (score: number): FinishedLook => ({ ...look, evaluation: { ...look.evaluation, score } });
    const looks = [scored(70), scored(90), scored(80)];
    const original = (order: readonly number[]): number => {
      const scores = order.map((index) => looks[index]?.evaluation.score ?? 0);
      const best = Math.max(0, ...scores);
      const closer = scores[scores.length - 1] ?? 0;
      const closing = best === 0 ? 100 : (100 * closer) / best;
      const opening = (scores[0] ?? 0) >= (scores[1] ?? 0) ? 100 : 60;
      return Math.round(0.7 * closing + 0.3 * opening);
    };
    for (const order of [
      [0, 1, 2],
      [2, 0, 1],
      [1, 2, 0],
      [0, 2, 1],
    ])
      expect(closerStrength(looks, order)).toBe(original(order));
  });
});
