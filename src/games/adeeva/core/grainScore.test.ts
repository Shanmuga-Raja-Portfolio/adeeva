import { describe, expect, it } from "vitest";
import { createDressRun } from "./dressRun";
import { themeBrief } from "./brief";
import { hasBiasDrape } from "./dressTags";
import { grainScore, isBiasRotation } from "./grainScore";
import { ROTATIONS } from "../../../engine/geometry/rotation";
import { SHOW_THEMES } from "../content/showTheme";

describe("grainScore", () => {
  it("scores straight grain, bias and cross grain", () => {
    const straight = { grain: "straight" as const, slot: "skirt-front" as const };
    const biasSkirt = { grain: "bias-friendly" as const, slot: "skirt-back" as const };
    expect(ROTATIONS.map((rotation) => grainScore(straight, rotation))).toEqual([
      1, 0.7, 0.6, 0.7, 1, 0.7, 0.6, 0.7,
    ]);
    expect(ROTATIONS.map((rotation) => grainScore(biasSkirt, rotation))).toEqual([
      1, 1, 0.6, 1, 1, 1, 0.6, 1,
    ]);
  });

  it("keeps the bias bonus for skirts only", () => {
    const biasBodice = { grain: "bias-friendly" as const, slot: "bodice-front" as const };
    const biasNeckline = { grain: "bias-friendly" as const, slot: "neckline" as const };
    expect(grainScore(biasBodice, 45)).toBe(0.7);
    expect(grainScore(biasNeckline, 135)).toBe(0.7);
  });

  it("recognises bias angles", () => {
    expect(ROTATIONS.filter(isBiasRotation)).toEqual([45, 135, 225, 315]);
  });
});

describe("bias drape tag", () => {
  const theme = SHOW_THEMES[0];
  if (theme === undefined) throw new Error("expected a theme");
  const run = createDressRun(
    "run-1",
    { kind: "look", lookIndex: 0 },
    themeBrief(theme, 14, theme.minQuality),
    1,
  );
  const design = {
    parts: {
      bodice: "wrap-bodice",
      neckline: "sweetheart-neckline",
      sleeves: "sleeveless",
      skirt: "mini-skirt",
    },
    fabrics: { bodice: "ivory-cotton", neckline: "ivory-cotton", sleeves: null, skirt: "ivory-cotton" },
  };

  it("is added by a bias-cut skirt", () => {
    const placements = { "mini-front": { fabricId: "ivory-cotton", x: 0, y: 0, rotation: 45 as const } };
    expect(hasBiasDrape({ ...run.design, ...design }, placements)).toBe(true);
  });

  it("is not added by bias-cut bodice or neckline pieces", () => {
    const placements = {
      "wrap-front": { fabricId: "ivory-cotton", x: 0, y: 0, rotation: 45 as const },
      "sweetheart-facing": { fabricId: "ivory-cotton", x: 60, y: 0, rotation: 315 as const },
    };
    expect(hasBiasDrape({ ...run.design, ...design }, placements)).toBe(false);
  });
});
