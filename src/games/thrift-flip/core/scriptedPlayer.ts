import { MAX_ACTIVE_GIGS } from "../../../engine/gigBoard";
import { FIND_FIT } from "../content/findFit";
import { briefFitKeys, type Brief } from "./brief";
import { recipeById } from "./catalog";
import { designFor } from "./design";
import type { GameState, Gig } from "./gameState";
import { unlockedFinds } from "./marketRail";
import { reduce } from "./reduce";
import { hangingPieces } from "./rackRoom";
import { isStallDay } from "./stallCalendar";
import { pieceFairBand } from "./stallDay";
import { playFlipToReview, settleStories, type FlipPlan } from "./testPlaythrough";

export interface PlayerStyle {
  readonly commissionsPerWeek: number;
  readonly ownPerWeek: number;
  readonly seamBase: number;
  readonly seamSpread: number;
  readonly harshShare: number;
  readonly cut: FlipPlan["cut"];
}

export const DECENT_PLAYER: PlayerStyle = {
  commissionsPerWeek: 5,
  ownPerWeek: 1,
  seamBase: 0.7,
  seamSpread: 0.2,
  harshShare: 0.1,
  cut: "trace",
};

export const WEAKER_PLAYER: PlayerStyle = {
  commissionsPerWeek: 4,
  ownPerWeek: 1,
  seamBase: 0.5,
  seamSpread: 0.2,
  harshShare: 0.4,
  cut: "assist",
};

function seamAccuracy(style: PlayerStyle, day: number, salt: number): number {
  return style.seamBase + (style.seamSpread * ((day * 17 + salt * 31) % 11)) / 10;
}

function findFor(state: GameState, brief: Brief | null, key: string) {
  const { recipeId } = designFor(key);
  if (recipeId === null) return undefined;
  const blocked = recipeById(recipeId).blockedMaterials;
  return unlockedFinds(state).find((find) => {
    if (!FIND_FIT[find.id].includes(key) || blocked.includes(find.material)) return false;
    if (brief === null) return true;
    return !brief.avoidColours.includes(find.colour) && !brief.avoidMaterials.includes(find.material);
  });
}

function planFor(state: GameState, brief: Brief | null, style: PlayerStyle, salt: number): FlipPlan | null {
  const keys = brief === null ? ["tote-bag", "cushion-cover"] : briefFitKeys(brief);
  for (const key of keys) {
    const find = findFor(state, brief, key);
    if (find === undefined) continue;
    return {
      design: designFor(key),
      findId: find.id,
      grade: "loved",
      pullCm: 2,
      harshShare: style.harshShare,
      cut: style.cut,
      seamAccuracy: seamAccuracy(style, state.calendar.day, salt),
    };
  }
  return null;
}

function acceptOffers(state: GameState): GameState {
  let next = state;
  for (const offer of state.gigs.offers) {
    if (next.gigs.active.length >= MAX_ACTIVE_GIGS) break;
    if (offer.brief.kind !== "flip") continue;
    next = reduce(next, { type: "acceptOffer", offerId: offer.id });
  }
  return next;
}

function nextGig(state: GameState): Gig | undefined {
  return [...state.gigs.active]
    .filter((gig) => gig.brief.kind === "flip")
    .sort((a, b) => a.brief.deadlineDay - b.brief.deadlineDay)[0];
}

function delivered(state: GameState, review: GameState): GameState {
  const done = reduce(review, { type: "deliver" });
  return done === review
    ? reduce(state, { type: "workShift" })
    : settleStories(reduce(done, { type: "endDay" }));
}

function holdFairStall(state: GameState): GameState {
  const prices = Object.fromEntries(
    hangingPieces(state).map((piece) => [piece.id, pieceFairBand(state, piece).high]),
  );
  return settleStories(reduce(reduce(state, { type: "holdStall", prices }), { type: "endDay" }));
}

export interface WeekTally {
  readonly commissions: number;
  readonly own: number;
}

export function playDay(state: GameState, style: PlayerStyle, tally: WeekTally): [GameState, WeekTally] {
  const ready = settleStories(state);
  if (isStallDay(ready.calendar.day)) return [holdFairStall(ready), { commissions: 0, own: 0 }];
  const accepted = acceptOffers(ready);
  const gig = nextGig(accepted);
  if (gig !== undefined && tally.commissions < style.commissionsPerWeek) {
    const plan = planFor(accepted, gig.brief, style, tally.commissions);
    if (plan !== null) {
      const review = playFlipToReview(accepted, gig.id, plan);
      return [delivered(accepted, review), { ...tally, commissions: tally.commissions + 1 }];
    }
  }
  if (tally.own < style.ownPerWeek) {
    const plan = planFor(accepted, null, style, 7);
    if (plan !== null) {
      const review = playFlipToReview(accepted, null, plan);
      return [delivered(accepted, review), { ...tally, own: tally.own + 1 }];
    }
  }
  return [settleStories(reduce(accepted, { type: "workShift" })), tally];
}

export function playUntil(
  state: GameState,
  style: PlayerStyle,
  stop: (state: GameState) => boolean,
  lastDay: number,
): GameState {
  let current = state;
  let tally: WeekTally = { commissions: 0, own: 0 };
  while (!stop(current) && current.calendar.day <= lastDay) {
    const [next, after] = playDay(current, style, tally);
    current = next;
    tally = after;
  }
  return current;
}
