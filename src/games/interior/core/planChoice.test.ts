import { describe, expect, it } from "vitest";
import { CLIENTS } from "../content/client";
import { FURNITURE_IDS } from "../content/furniture";
import { roomById } from "./catalog";
import { TURNS } from "./floorPlan";
import type { GameState } from "./gameState";
import { MAX_PIECES, planIssues, tidyIssue } from "./planChoice";
import { reduce } from "./reduce";
import { lastGigId, newTestGame, planRoom, recipeFor, settleStories, withOrder } from "./testPlaythrough";

function atPlan(clientId: string): GameState {
  const ordered = withOrder(settleStories(newTestGame()), clientId);
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return reduce(started, { type: "goToStage", stage: "plan" });
}

function run(state: GameState) {
  if (state.activeRun === null) throw new Error("no run");
  return state.activeRun;
}

function packed(clientId: string): GameState {
  let state = atPlan(clientId);
  const brief = run(state).brief;
  const room = roomById(brief.roomId);
  for (const furnitureId of FURNITURE_IDS) {
    if (brief.mustHaves.some((need) => need.itemId === furnitureId)) continue;
    for (const rotation of TURNS)
      for (let row = 0; row < room.rows; row += 1)
        for (let col = 0; col < room.cols; col += 1)
          state = reduce(state, { type: "placePiece", pieceId: null, furnitureId, col, row, rotation });
  }
  return state;
}

describe("Tidy up", () => {
  for (const client of CLIENTS)
    it(`never drops a piece or goes past ${MAX_PIECES} in a packed room for ${client.name}`, () => {
      const state = packed(client.id);
      const before = run(state).plan.pieces;
      const tidied = reduce(state, { type: "tidyUp" });
      if (tidied === state) {
        expect(tidyIssue(run(state))).not.toBeNull();
        return;
      }
      expect(tidyIssue(run(state))).toBeNull();
      const after = run(tidied).plan.pieces;
      expect(after.length).toBeLessThanOrEqual(MAX_PIECES);
      for (const piece of before) expect(after.some((entry) => entry.id === piece.id)).toBe(true);
    });

  it("explains why a crowded room cannot be tidied", () => {
    const state = packed("okafor-twins");
    expect(reduce(state, { type: "tidyUp" })).toBe(state);
    expect(tidyIssue(run(state))).toMatch(/Take a piece out/);
  });
});

describe("planned lights", () => {
  it("refuses a plan whose only light has nowhere to go", () => {
    const recipe = { ...recipeFor("nana-pearl"), lights: ["clip-lamp" as const] };
    const planned = planRoom(atPlan("nana-pearl"), recipe);
    expect(planIssues(run(planned))).toContain("Pick a light that has a place to go in this room.");
    expect(reduce(planned, { type: "goToStage", stage: "shop" })).toBe(planned);
    const fixed = reduce(planned, { type: "addLight", lightId: "paper-pendant" });
    expect(planIssues(run(fixed))).toEqual([]);
  });
});
