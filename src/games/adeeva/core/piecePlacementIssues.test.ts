import { describe, expect, it } from "vitest";
import { createDressRun, type DressRun } from "./dressRun";
import { themeBrief } from "./brief";
import { fabricPlacementIssues } from "./piecePlacementIssues";
import { SHOW_THEMES } from "../content/showTheme";
import { SIMPLE_DESIGN, SIMPLE_LAYOUT } from "./testPlaythrough";

function designedRun(): DressRun {
  const theme = SHOW_THEMES[0];
  if (theme === undefined) throw new Error("expected a theme");
  const run = createDressRun(
    "run-1",
    { kind: "look", lookIndex: 0 },
    themeBrief(theme, 14, theme.minQuality),
    1,
  );
  return {
    ...run,
    stage: "cut",
    design: {
      parts: { ...SIMPLE_DESIGN },
      fabrics: { bodice: "ivory-cotton", neckline: "ivory-cotton", sleeves: null, skirt: "ivory-cotton" },
    },
  };
}

function withPlacements(run: DressRun, placements: DressRun["placements"]): DressRun {
  return { ...run, placements };
}

function asPlacements(layout: typeof SIMPLE_LAYOUT): DressRun["placements"] {
  return Object.fromEntries(
    Object.entries(layout).map(([pieceId, spot]) => [pieceId, { fabricId: "ivory-cotton", ...spot }]),
  );
}

describe("fabricPlacementIssues", () => {
  it("accepts the reference layout on two metres", () => {
    const run = withPlacements(designedRun(), asPlacements(SIMPLE_LAYOUT));
    expect(fabricPlacementIssues(run, "ivory-cotton", 2)).toEqual([]);
  });

  it("lists unplaced pieces", () => {
    const issues = fabricPlacementIssues(designedRun(), "ivory-cotton", 2);
    expect(issues.map((issue) => issue.kind)).toEqual([
      "unplaced",
      "unplaced",
      "unplaced",
      "unplaced",
      "unplaced",
    ]);
  });

  it("flags pieces past the bolt length", () => {
    const run = withPlacements(designedRun(), asPlacements(SIMPLE_LAYOUT));
    const issues = fabricPlacementIssues(run, "ivory-cotton", 1);
    expect(issues.filter((issue) => issue.kind === "out-of-bounds").map((issue) => issue.pieceId)).toEqual([
      "fitted-front",
      "fitted-back",
    ]);
  });

  it("flags a rotated piece that hangs off the width", () => {
    const layout = { ...SIMPLE_LAYOUT, "peter-pan": { x: 120, y: 70, rotation: 90 as const } };
    const fine = fabricPlacementIssues(
      withPlacements(designedRun(), asPlacements(layout)),
      "ivory-cotton",
      2,
    );
    expect(fine).toEqual([]);
    const wide = { ...SIMPLE_LAYOUT, "peter-pan": { x: 120, y: 70, rotation: 0 as const } };
    const issues = fabricPlacementIssues(
      withPlacements(designedRun(), asPlacements(wide)),
      "ivory-cotton",
      2,
    );
    expect(issues.map((issue) => [issue.pieceId, issue.kind])).toEqual([["peter-pan", "out-of-bounds"]]);
  });

  it("flags overlapping pieces, including rotated ones", () => {
    const layout = { ...SIMPLE_LAYOUT, "peter-pan": { x: 40, y: 75, rotation: 45 as const } };
    const issues = fabricPlacementIssues(
      withPlacements(designedRun(), asPlacements(layout)),
      "ivory-cotton",
      2,
    );
    const overlaps = issues.filter((issue) => issue.kind === "overlap");
    expect(overlaps.length).toBeGreaterThan(0);
    expect(
      overlaps.every((issue) => issue.pieceId === "peter-pan" || issue.otherPieceId === "peter-pan"),
    ).toBe(true);
  });
});
