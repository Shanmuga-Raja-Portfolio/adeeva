import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import type { SwapTable } from "./boutique";
import { boutiqueStart, endDays } from "./boutiquePlaythrough";
import { findById } from "./catalog";
import { cellThreshold } from "./clean";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { isSwapDay } from "./seasonCalendar";
import { tableDone, tableOwned, todaysSwapDay } from "./swapDay";
import { swapTableCount } from "./swapRoll";
import { dispatchAll, settleStories, TEST_SEAM_TICKS, withFind } from "./testPlaythrough";

function hallDay(upgrades: GameState["upgrades"] = []): GameState {
  return endDays({ ...boutiqueStart({ seed: 3 }), upgrades }, 10);
}

function mendTable(state: GameState, table: SwapTable, accuracy: number): Action[] {
  if (table.kind === "stitch") {
    const stitches = findById(table.findId).lines[table.line]?.stitches ?? 0;
    return Array.from({ length: stitches }, (_, stitch) => ({
      type: "tablePull",
      tableId: table.id,
      stitch,
      distanceCm: accuracy >= 0.6 ? 2 : 30,
      assisted: false,
    }));
  }
  if (table.kind === "seam")
    return [
      {
        type: "tableSew",
        tableId: table.id,
        progress: 1,
        ticks: TEST_SEAM_TICKS,
        insideTicks: Math.round(accuracy * TEST_SEAM_TICKS),
        assisted: false,
      },
    ];
  const perCell = Math.ceil(cellThreshold(state, tableOwned(table), table.stain));
  const cleared = accuracy >= 0.6 ? perCell : 0;
  return [
    {
      type: "tableScrub",
      tableId: table.id,
      cellTicks: Array.from({ length: table.stain.cells }, () => cleared),
      harshTicks: 0,
      scrubTicks: Math.max(1, cleared * table.stain.cells),
    },
  ];
}

describe("Swap & Mend", () => {
  it("lays out six tables and six swap finds on season day 11", () => {
    const state = hallDay();
    expect(isSwapDay(state)).toBe(true);
    const swapDay = todaysSwapDay(state);
    expect(swapDay?.tables).toHaveLength(6);
    expect(swapDay?.rail).toHaveLength(6);
    expect(swapDay?.committed).toBe(false);
    expect(todaysSwapDay(hallDay(["swap-shelf"]))?.tables).toHaveLength(
      swapTableCount({ upgrades: ["swap-shelf"] }),
    );
  });

  it("commits the day on the first table and blocks flips and the shift after", () => {
    const state = hallDay();
    const table = todaysSwapDay(state)?.tables[0];
    if (table === undefined) throw new Error("No table");
    const first = mendTable(state, table, 1)[0];
    if (first === undefined) throw new Error("No action");
    const started = settleStories(reduce(state, first));
    expect(todaysSwapDay(started)?.committed).toBe(true);
    expect(started.calendar.hoursLeft).toBe(state.calendar.hoursLeft - 1);
    expect(started.stock.scraps.length).toBe(Math.min(12, state.stock.scraps.length + 3));
    expect(started.story.seen).toContain("tf-swap-and-mend");
    expect(reduce(started, { type: "workShift" })).toBe(started);
    expect(reduce(started, { type: "startOwnFlip" })).toBe(started);
  });

  it("rewards each well-mended table once with leaves, buzz and capped reputation", () => {
    let state = hallDay();
    const tables = todaysSwapDay(state)?.tables ?? [];
    for (const table of tables) state = dispatchAll(state, mendTable(state, table, 0.9));
    const done = todaysSwapDay(state);
    expect(done?.tables.every((table) => tableDone(state, table) && table.rewarded)).toBe(true);
    const base = hallDay();
    expect(state.keptInUse).toBe(base.keptInUse + 6);
    expect(state.reputation).toBe(base.reputation + 3);
    expect(state.calendar.hoursLeft).toBe(base.calendar.hoursLeft - 6);
    const again = tables[0];
    if (again === undefined) throw new Error("No table");
    const replay = mendTable(state, again, 0.9)[0];
    if (replay === undefined) throw new Error("No action");
    expect(reduce(state, replay)).toBe(state);
  });

  it("does not reward a table mended with too many slips, except on Relaxed", () => {
    const state = hallDay();
    const table =
      todaysSwapDay(state)?.tables.find((entry) => entry.kind === "seam") ?? todaysSwapDay(state)?.tables[0];
    if (table === undefined) throw new Error("No table");
    const shaky = dispatchAll(state, mendTable(state, table, 0.3));
    expect(shaky.keptInUse).toBe(state.keptInUse);
    const relaxed = { ...state, profile: { ...state.profile, difficulty: "relaxed" as const } };
    const kind = dispatchAll(relaxed, mendTable(relaxed, table, 0.3));
    expect(kind.keptInUse).toBe(relaxed.keptInUse + 1);
  });

  it("swaps stockroom finds one for one, at most three times, never rack pieces", () => {
    const state = withFind(
      withFind(withFind(withFind(hallDay(), "faded-jeans"), "sailor-top"), "tea-dress"),
      "black-jeans",
    );
    const rail = todaysSwapDay(state)?.rail ?? [];
    const keys = state.stock.finds.map((owned) => owned.id);
    let next = state;
    for (let index = 0; index < 3; index += 1)
      next = reduce(next, { type: "swapFind", slotId: rail[index]?.id ?? "", findKey: keys[index] ?? "" });
    expect(next.stock.finds).toHaveLength(state.stock.finds.length);
    expect(todaysSwapDay(next)?.swaps).toBe(3);
    expect(next.keptInUse).toBe(state.keptInUse + 3);
    expect(next.coins).toBe(state.coins);
    const fourth = reduce(next, { type: "swapFind", slotId: rail[3]?.id ?? "", findKey: keys[3] ?? "" });
    expect(fourth).toBe(next);
    expect(reduce(state, { type: "swapFind", slotId: rail[0]?.id ?? "", findKey: "piece-1" })).toBe(state);
  });

  it("keeps the hall closed on other days", () => {
    const early = endDays(boutiqueStart({ seed: 3 }), 9);
    const table = todaysSwapDay(hallDay())?.tables[0];
    expect(todaysSwapDay(early)).toBeNull();
    expect(reduce(early, { type: "tableSoak", tableId: table?.id ?? "table-1" })).toBe(early);
  });
});
