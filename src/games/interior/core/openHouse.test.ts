import { describe, expect, it } from "vitest";
import { ENQUIRY_COINS, openHouse, openHouseQuote } from "./openHouse";
import { reduce } from "./reduce";
import { lastResult } from "./reveal";
import { newTestGame, playOrder, recipeFor, settleStories, withOrder } from "./testPlaythrough";

function showHome() {
  const base = settleStories(newTestGame({ trait: "charmer" }));
  const ordered = withOrder(
    { ...base, reputation: 24, coins: 400, trends: { ...base.trends, current: ["classic", "cosy"] } },
    "bellwind",
  );
  const gig = ordered.gigs.active[ordered.gigs.active.length - 1];
  if (gig === undefined) throw new Error("no gig");
  return { ordered, gigId: gig.id };
}

describe("the Open House", () => {
  it("plays after a passing show home and turns visits into enquiries", () => {
    const { ordered, gigId } = showHome();
    const state = playOrder(ordered, gigId, recipeFor("bellwind"));
    const run = state.activeRun;
    const entry = run === null ? null : lastResult(state, run.id);
    expect(entry?.evaluation.passed).toBe(true);
    const visit = entry?.openHouse;
    if (visit === null || visit === undefined) throw new Error("no open house");
    expect(visit.panels.map((panel) => panel.id)).toEqual(["comfort", "flow", "wow"]);
    expect(visit.coins).toBe(visit.enquiries * ENQUIRY_COINS);
    if (visit.coins > 0)
      expect(entry?.reward.lines.find((line) => line.label === "Open House enquiries")?.amount).toBe(
        visit.coins,
      );
  });

  it("clamps enquiries between 0 and 5 and picks a quote by score band", () => {
    const { ordered, gigId } = showHome();
    const started = reduce(ordered, { type: "startOrder", gigId });
    const run = started.activeRun;
    if (run === null) throw new Error("no run");
    const empty = openHouse(run, 0);
    expect(empty.enquiries).toBe(0);
    expect(empty.coins).toBe(0);
    const perfect = openHouse({ ...run, plan: { ...run.plan, featurePaint: "deep-lagoon" } }, 1);
    expect(perfect.enquiries).toBeLessThanOrEqual(5);
    expect(openHouseQuote(95)).not.toBe(openHouseQuote(40));
  });
});
