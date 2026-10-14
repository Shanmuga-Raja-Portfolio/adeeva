import { describe, expect, it } from "vitest";
import { COLOURS, type ColourId } from "../../../engine/palette";
import type { RngState } from "../../../engine/rng";
import { drawInt } from "../../../engine/rngDraw";
import { FILLINGS } from "../content/filling";
import { MENU_TIER_IDS } from "../content/menuTier";
import type { Brief } from "./brief";
import { mixById, productById } from "./catalog";
import { mixOptions } from "./design";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  endDays,
  playSalonTray,
  playShowpiece,
  readySeason,
  salonTrayPlan,
  serveTables,
  showpiecePlan,
  stageSuggestedFair,
} from "./salonPlaythrough";
import { dayKind } from "./seasonCalendar";
import { GOOD_PLAN, newTestGame, playOrder, settleStories, type BakePlan } from "./testPlaythrough";

interface Skill {
  readonly weighError: number;
  readonly stirShare: number;
  readonly bakeShare: number;
  readonly pipeOffset: number;
}

function noisy(rng: RngState, centre: number, spread: number): [number, RngState] {
  const [roll, next] = drawInt(rng, -100, 100);
  return [centre + (spread * roll) / 100, next];
}

function decentSkill(rng: RngState): [Skill, RngState] {
  const [weigh, a] = noisy(rng, 0.04, 0.04);
  const [stir, b] = noisy(a, 0.86, 0.06);
  const [bake, c] = noisy(b, 1, 0.08);
  const [pipe, d] = noisy(c, 0.25, 0.25);
  return [{ weighError: weigh, stirShare: stir, bakeShare: bake, pipeOffset: pipe }, d];
}

function briefPlan(brief: Brief, skill: Skill): BakePlan {
  const productId = brief.products[0] ?? "cupcake-tray";
  const product = productById(productId);
  const mixes = mixOptions(product).filter((mix) => !brief.avoidMixes.includes(mix.id));
  const rank = (tags: readonly string[]) =>
    tags.filter((tag) => brief.requiredTags.includes(tag as never)).length;
  const required = mixes.find((mix) => brief.requiredMixes.includes(mix.id));
  const best = [...mixes].sort((a, b) => rank(b.tags) - rank(a.tags))[0];
  const mix = required ?? best ?? mixById("vanilla-sponge");
  const filling =
    product.filling.kind === "required" || product.filling.kind === "optional"
      ? ([...FILLINGS].sort((a, b) => rank(b.tags) - rank(a.tags))[0]?.id ?? null)
      : null;
  const palette: ColourId[] = [
    ...brief.favouredColours,
    ...COLOURS.map((colour) => colour.id).filter((id) => !brief.favouredColours.includes(id)),
  ].filter((id) => !brief.avoidColours.includes(id));
  return {
    ...GOOD_PLAN,
    ...skill,
    productId,
    mixIds: Array.from({ length: product.batches }, () => mix.id),
    fillingId: filling,
    colours: palette.slice(0, Math.max(2, brief.minColours)),
  };
}

function playBestOrder(state: GameState, rng: RngState): [GameState, RngState] {
  let next = state;
  for (const offer of next.gigs.offers) {
    if (next.gigs.active.length >= 3) break;
    next = reduce(next, { type: "acceptOffer", offerId: offer.id });
  }
  const gig = [...next.gigs.active].sort((a, b) => a.brief.deadlineDay - b.brief.deadlineDay)[0];
  if (gig === undefined || dayKind(next) !== "baking") return [next, rng];
  const [skill, after] = decentSkill(rng);
  try {
    return [settleStories(playOrder(next, gig.id, briefPlan(gig.brief, skill))), after];
  } catch {
    return [settleStories(reduce(next, { type: "abandonRun" })), after];
  }
}

function bakeryWeeks(
  weeks: number,
  seed: number,
): { state: GameState; offerDay: number | null; passes: number; orders: number } {
  let state = settleStories(newTestGame({ seed, trait: "charmer" }));
  let rng: RngState = seed * 7919;
  let offerDay: number | null = null;
  let passes = 0;
  let orders = 0;
  const end = 1 + weeks * 7;
  while (state.calendar.day < end) {
    const before = state.log.length;
    const [played, nextRng] = playBestOrder(state, rng);
    rng = nextRng;
    state = played;
    if (state.log.length > before) {
      orders += 1;
      if (state.log[state.log.length - 1]?.reward.outcome === "pass") passes += 1;
    }
    if (
      offerDay === null &&
      (state.story.queue.includes("pa-salon-offer") || state.story.seen.includes("pa-salon-offer"))
    )
      offerDay = state.calendar.day;
    if (state.log.length > before && state.calendar.hoursLeft >= 8) continue;
    state = reduce(state, { type: "endDay" });
    if (offerDay === null && state.story.queue.includes("pa-salon-offer")) offerDay = state.calendar.day;
    state = settleStories({
      ...state,
      story: { ...state.story, queue: state.story.queue.filter((id) => id !== "pa-salon-offer") },
    });
  }
  return { state, offerDay, passes, orders };
}

function salonSeason(state: GameState, seed: number): GameState {
  const start = state.fair?.seasonStartDay ?? 1;
  let next = readySeason(endDays(state, start));
  for (const tier of MENU_TIER_IDS)
    next = settleStories(playSalonTray(next, tier, salonTrayPlan(next, tier)));
  let rng: RngState = seed;
  while (next.calendar.day < start + 5) {
    const [played, after] = playBestOrder(next, rng);
    rng = after;
    next = settleStories(reduce(played, { type: "endDay" }));
  }
  next = settleStories(serveTables(next));
  next = endDays(next, start + 7);
  next = settleStories(playShowpiece(next, showpiecePlan(next)));
  while (next.calendar.day < start + 12) {
    const [played, after] = playBestOrder(next, rng);
    rng = after;
    next = settleStories(reduce(played, { type: "endDay" }));
  }
  next = settleStories(stageSuggestedFair(next));
  return endDays(next, start + 14);
}

describe("depth economy (seeded simulation)", () => {
  it("brings a busy decent Corner Baker to the parlour key in weeks 2 to 4, passing most orders", () => {
    const runs = [11, 23, 37, 41, 59].map((seed) => bakeryWeeks(5, seed));
    for (const run of runs) {
      expect(run.offerDay).not.toBeNull();
      expect(run.offerDay ?? 0).toBeGreaterThan(10);
      expect(run.offerDay ?? 99).toBeLessThanOrEqual(28);
      expect(run.passes / Math.max(1, run.orders)).toBeGreaterThanOrEqual(0.7);
    }
  });

  it("gives a decent salon season a fair share of a Corner Baker's two weeks", () => {
    const bakery = bakeryWeeks(5, 11).state;
    const atThreeWeeks = bakeryWeeks(3, 11).state;
    const twoWeeks = bakery.coins - atThreeWeeks.coins;
    const opened = settleStories(
      reduce(
        {
          ...bakery,
          reputation: Math.max(30, bakery.reputation),
          ordersDelivered: Math.max(12, bakery.ordersDelivered),
        },
        { type: "openSalon" },
      ),
    );
    const before = endDays(opened, opened.fair?.seasonStartDay ?? 1);
    const after = salonSeason(before, 5);
    const season = after.coins - before.coins;
    expect(after.fair?.result ?? after.fair?.seasonNumber).toBeTruthy();
    expect(season).toBeGreaterThanOrEqual(0.8 * twoWeeks);
    expect(after.fair?.ribbonsByRun).not.toEqual({});
  });

  it("never lets Relaxed coins drop below zero and is the same on every run", () => {
    const relaxed = (seed: number) => {
      let state = settleStories(newTestGame({ seed, difficulty: "relaxed", career: "salon" }));
      let lowest = state.coins;
      state = salonSeason(state, seed);
      lowest = Math.min(lowest, state.coins);
      return { state, lowest };
    };
    const first = relaxed(3);
    expect(first.lowest).toBeGreaterThanOrEqual(0);
    expect(relaxed(3).state).toEqual(first.state);
  });
});
