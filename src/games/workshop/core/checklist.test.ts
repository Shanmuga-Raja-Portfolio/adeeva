import { describe, expect, it } from "vitest";
import { checklist } from "./checklist";
import { reduce } from "./reduce";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playUntil,
  runOf,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";

function budgetLine(state: ReturnType<typeof newTestGame>): string | undefined {
  return checklist(state, runOf(state)).find((item) => item.id === "budget")?.label;
}

describe("the brief checklist", () => {
  it("names the budget line for what the piece itself costs, counting a board once a part sits on it", () => {
    const start = withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
    const laying = playUntil(start, lastGigId(start), BIRDHOUSE_PLAN, "layout");
    const budget = runOf(laying).brief.budget;
    const board = laying.boards[0];
    if (board === undefined) throw new Error("No board");
    expect(budgetLine(laying)).toBe(`Piece cost 0/${budget} coins`);
    const placed = reduce(laying, { type: "showMe", partId: null });
    expect(budgetLine(placed)).toBe(`Piece cost ${board.cost}/${budget} coins`);
  });
});
