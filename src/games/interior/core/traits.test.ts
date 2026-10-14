import type { TraitId } from "../../../engine/trait";
import { visibleNextTrends } from "../../../engine/trendMarket";
import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { lastResult } from "./reveal";
import { surfaceColours } from "./roomColours";
import { roomSource } from "./roomSource";
import { floorTolerance, splatSpeed } from "./skillTolerance";
import {
  lastGigId,
  newTestGame,
  playOrder,
  recipeFor,
  settleStories,
  withOrder,
  type RoomRecipe,
} from "./testPlaythrough";

function revealFor(
  trait: TraitId,
  recipe: RoomRecipe,
  tweak: (state: GameState) => GameState = (state) => state,
) {
  const ordered = withOrder(tweak(settleStories(newTestGame({ trait }))), "nana-pearl");
  const state = playOrder(ordered, lastGigId(ordered), recipe);
  const run = state.activeRun;
  const entry = run === null ? null : lastResult(state, run.id);
  if (entry === null) throw new Error("no result");
  return { state, entry };
}

const COLOURFUL: RoomRecipe = { ...recipeFor("nana-pearl"), featurePaint: "morning-sky" };

describe("trait perks", () => {
  it("Dreamer earns Big ideas for a colourful room", () => {
    const labels = (trait: TraitId) =>
      revealFor(trait, COLOURFUL).entry.reward.lines.map((line) => line.label);
    expect(labels("dreamer")).toContain("Big ideas");
    expect(labels("charmer")).not.toContain("Big ideas");
  });

  it("Dreamer needs four surface colours or a bold room for Big ideas", () => {
    const colourful = revealFor("dreamer", COLOURFUL);
    const plain = revealFor("dreamer", recipeFor("nana-pearl"));
    const source = (state: GameState) => {
      if (state.activeRun === null) throw new Error("no run");
      return roomSource(state.activeRun);
    };
    expect(surfaceColours(source(colourful.state)).length).toBeGreaterThanOrEqual(4);
    expect(surfaceColours(source(plain.state))).toHaveLength(3);
    expect(plain.entry.reward.lines.map((line) => line.label)).not.toContain("Big ideas");
  });

  it("Perfectionist makes floors and rolling 20% more forgiving", () => {
    const plain = newTestGame({ trait: "charmer" });
    const steady = newTestGame({ trait: "perfectionist" });
    expect(floorTolerance(steady) / floorTolerance(plain)).toBeCloseTo(1.2);
    expect(splatSpeed(steady) / splatSpeed(plain)).toBeCloseTo(1.2);
  });

  it("Trendsetter sees next week's tags and earns extra for a trend match", () => {
    const trendy = newTestGame({ trait: "trendsetter" });
    expect(visibleNextTrends(trendy)).toEqual(trendy.trends.next);
    expect(visibleNextTrends(newTestGame({ trait: "dreamer" }))).toBeNull();
    const hot = (state: GameState): GameState => ({
      ...state,
      trends: { ...state.trends, current: ["cosy", "calm"] },
    });
    const lines = revealFor("trendsetter", recipeFor("nana-pearl"), hot).entry.reward.lines.map(
      (line) => line.label,
    );
    expect(lines).toContain("Street favourite");
    expect(lines).toContain("Trendsetter eye");
  });

  it("Charmer earns a tip on a happy reveal and loses no reputation on a near miss", () => {
    expect(
      revealFor("charmer", recipeFor("nana-pearl")).entry.reward.lines.map((line) => line.label),
    ).toContain("Charmer tip");
    const miss: RoomRecipe = {
      ...recipeFor("nana-pearl"),
      furniture: ["bookcase"],
      lights: ["paper-pendant"],
    };
    expect(revealFor("charmer", miss).entry.reward.reputation).toBe(0);
    expect(revealFor("dreamer", miss).entry.reward.reputation).toBe(-1);
  });
});
