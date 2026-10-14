import { describe, expect, it } from "vitest";
import type { DifficultyId } from "./difficulty";
import { STYLE_TAGS } from "./styleTag";
import type { TrendState } from "./trendMarket";
import { settleWeek, type WeekLedger, type WeekTrigger } from "./weekSettlement";

interface Ledger {
  readonly coins: number;
  readonly trends: TrendState;
  readonly rng: number;
  readonly profile: { readonly difficulty: DifficultyId };
  readonly queued: readonly WeekTrigger[];
}

const queue = (state: Ledger, trigger: WeekTrigger): Ledger => ({
  ...state,
  queued: [...state.queued, trigger],
});

const ledger = (coins: number, difficulty: DifficultyId): Ledger => ({
  coins,
  trends: { current: ["playful", "regal"], next: ["bold", "classic"] },
  rng: 42,
  profile: { difficulty },
  queued: [],
});

describe("settleWeek", () => {
  it("charges the bill, moves the trends on and queues the first-week beat", () => {
    const settled = settleWeek(ledger(100, "standard"), 30, STYLE_TAGS, queue);
    expect(settled.coins).toBe(70);
    expect(settled.trends.current).toEqual(["bold", "classic"]);
    expect(settled.rng).not.toBe(42);
    expect(settled.queued).toEqual(["first-week"]);
  });

  it("queues bankruptcy only on challenging when coins go below zero", () => {
    expect(settleWeek(ledger(10, "challenging"), 30, STYLE_TAGS, queue).queued).toEqual([
      "first-week",
      "bankrupt",
    ]);
    expect(settleWeek(ledger(10, "standard"), 30, STYLE_TAGS, queue).queued).toEqual(["first-week"]);
  });

  it("draws next week's trends from a game's own tag list when given one", () => {
    type OwnTag = "dainty" | "nature" | "sparkly" | "bold";
    const own: WeekLedger<OwnTag> = {
      coins: 50,
      trends: { current: ["dainty", "nature"], next: ["sparkly", "bold"] },
      rng: 7,
      profile: { difficulty: "standard" },
    };
    const settled = settleWeek(own, 20, ["dainty", "nature", "sparkly", "bold"] as const, (state) => state);
    expect(settled.coins).toBe(30);
    expect(settled.trends.current).toEqual(["sparkly", "bold"]);
    expect(settled.trends.next.every((tag) => ["dainty", "nature", "sparkly", "bold"].includes(tag))).toBe(
      true,
    );
  });
});
