import { describe, expect, it } from "vitest";
import type { ColourId } from "../../../engine/palette";
import { boxAccepts, boxPay, canOpenCounter, drawCards, MIXED_BOX_BONUS } from "./boxItUp";
import { kindKey, type CounterTray } from "./counter";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";

const TRAYS: CounterTray[] = [
  {
    id: "tray-1",
    productId: "cupcake-tray",
    colour: "sky",
    quality: 100,
    tags: ["playful", "classic"],
    left: 6,
  },
  { id: "tray-2", productId: "iced-biscuits", colour: "mustard", quality: 50, tags: ["casual"], left: 6 },
];

function counterDay(overrides: Partial<GameState> = {}): GameState {
  const base = settleStories(newTestGame());
  return {
    ...base,
    calendar: { day: 7, hoursLeft: 10 },
    counter: { ...base.counter, trays: TRAYS },
    trends: { current: ["playful", "sporty"], next: ["dreamy", "bold"] },
    ...overrides,
  };
}

describe("Box It Up", () => {
  it("draws the same fillable cards from the same seed", () => {
    const [cards, rng] = drawCards(TRAYS, 6, 99);
    const [again] = drawCards(TRAYS, 6, 99);
    expect(again).toEqual(cards);
    expect(rng).not.toBe(99);
    expect(cards).toHaveLength(6);
    for (const card of cards) {
      expect(card.items.length).toBeGreaterThanOrEqual(2);
      expect(card.items.length).toBeLessThanOrEqual(4);
      const sky = card.items.filter((item) => item.colour === "sky").length;
      expect(sky).toBeLessThanOrEqual(6);
    }
  });

  it("opens only on Counter Day with trays to sell", () => {
    expect(canOpenCounter(counterDay()).ok).toBe(true);
    expect(canOpenCounter(counterDay({ calendar: { day: 3, hoursLeft: 10 } })).ok).toBe(false);
    const empty = counterDay();
    expect(canOpenCounter({ ...empty, counter: { ...empty.counter, trays: [] } }).ok).toBe(false);
    const state = counterDay({ calendar: { day: 3, hoursLeft: 10 } });
    expect(reduce(state, { type: "openCounter" })).toBe(state);
  });

  it("pays more for good trays, hot tags and a Charmer's ribbon", () => {
    const plain = counterDay({ trends: { current: ["regal", "edgy"], next: ["dreamy", "bold"] } });
    const biscuit = TRAYS[1];
    const cupcake = TRAYS[0];
    if (biscuit === undefined || cupcake === undefined) throw new Error("missing trays");
    expect(boxPay(plain, [biscuit, biscuit])).toBe(10);
    expect(boxPay(plain, [cupcake, cupcake])).toBe(12);
    expect(boxPay(counterDay(), [cupcake, biscuit])).toBe(13 + MIXED_BOX_BONUS);
    expect(boxPay(plain, [cupcake, biscuit])).toBe(11 + MIXED_BOX_BONUS);
    const charmer = { ...plain, profile: { ...plain.profile, trait: "charmer" as const } };
    expect(boxPay(charmer, [biscuit, biscuit])).toBe(11);
  });

  it("sells a matching box once and bounces anything else", () => {
    const open = reduce(counterDay(), { type: "openCounter" });
    const session = open.counter.session;
    const card = session?.cards[0];
    if (card === undefined) throw new Error("no card");
    const trayIds = card.items.map((item) => (item.productId === "cupcake-tray" ? "tray-1" : "tray-2"));
    const other = card.items[0]?.productId === "cupcake-tray" ? "tray-2" : "tray-1";
    const wrong = card.items.map(() => other);
    expect(reduce(open, { type: "sellBox", cardIndex: 0, trayIds: wrong })).toBe(open);
    expect(reduce(open, { type: "sellBox", cardIndex: 0, trayIds: trayIds.slice(1) })).toBe(open);
    const sold = reduce(open, { type: "sellBox", cardIndex: 0, trayIds });
    expect(sold.coins).toBeGreaterThan(open.coins);
    expect(sold.counter.trays.reduce((sum, tray) => sum + tray.left, 0)).toBe(12 - card.items.length);
    expect(reduce(sold, { type: "sellBox", cardIndex: 0, trayIds })).toBe(sold);
    const first = card.items[0];
    if (first === undefined) throw new Error("empty card");
    expect(boxAccepts(card, [], first)).toBe(true);
    expect(boxAccepts(card, card.items, first)).toBe(false);
    const closed = reduce(sold, { type: "closeCounter" });
    expect(closed.counter.trays).toEqual([]);
    expect(closed.counter.lastSummary?.shared).toBe(12 - card.items.length);
    expect(closed.counter.lastSummary?.boxes).toBe(1);
    expect(reduce(closed, { type: "openCounter" })).toBe(closed);
    expect(kindKey(first)).toContain(first.colour);
  });

  it("makes a varied counter pay about as well as a single kind", () => {
    const sellEveryCard = (state: GameState): number => {
      let next = reduce(state, { type: "openCounter" });
      const cards = next.counter.session?.cards ?? [];
      cards.forEach((card, cardIndex) => {
        const used = new Map<string, number>();
        const trayIds: string[] = [];
        for (const item of card.items) {
          const tray = next.counter.trays.find(
            (entry) => kindKey(entry) === kindKey(item) && entry.left - (used.get(entry.id) ?? 0) > 0,
          );
          if (tray === undefined) return;
          used.set(tray.id, (used.get(tray.id) ?? 0) + 1);
          trayIds.push(tray.id);
        }
        next = reduce(next, { type: "sellBox", cardIndex, trayIds });
      });
      return next.counter.session?.coins ?? 0;
    };
    const averageTakings = (kinds: readonly [CounterTray["productId"], ColourId][]): number => {
      let total = 0;
      for (let seed = 1; seed <= 200; seed += 1) {
        const base = settleStories(newTestGame({ seed }));
        const trays = kinds.map(([productId, colour], index) => ({
          id: `tray-${index + 1}`,
          productId,
          colour,
          quality: 85,
          tags: [],
          left: 6,
        }));
        total += sellEveryCard({
          ...base,
          calendar: { day: 7, hoursLeft: 10 },
          counter: { ...base.counter, trays, nextTrayNumber: trays.length + 1 },
        });
      }
      return total / 200;
    };
    const single = averageTakings([
      ["cupcake-tray", "sky"],
      ["cupcake-tray", "sky"],
      ["cupcake-tray", "sky"],
    ]);
    const varied = averageTakings([
      ["cupcake-tray", "sky"],
      ["cupcake-tray", "blush"],
      ["iced-biscuits", "sky"],
    ]);
    expect(varied).toBeGreaterThanOrEqual(single * 0.97);
  });
});
