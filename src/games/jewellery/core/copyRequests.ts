import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import { OFFER_LIFETIME_DAYS } from "../../../engine/gigBoard";
import { POPUP_VISITORS } from "../content/popupVisitor";
import type { JewelTag } from "../content/jewelTag";
import type { Brief } from "./brief";
import { difficultyById, productById, stoneById } from "./catalog";
import type { CollectionPiece } from "./collectionState";
import type { GameState } from "./gameState";
import type { PendingCopy } from "./launchState";
import { queueStoryTrigger } from "./storyQueue";

export const MAX_COPY_REQUESTS = 2;
const HEARTS_PER_REQUEST = 2;
const COPY_FEE = 1.2;
const BUDGET_SPARE = 10;
const COPY_DAYS: readonly [number, number] = [5, 7];
const COPY_MIN_QUALITY = 70;

export interface HeartTally {
  readonly pieceId: string;
  readonly hearts: number;
  readonly need: number;
  readonly sold: boolean;
}

export function spareHearts(tallies: readonly HeartTally[]): number {
  return tallies.reduce(
    (sum, tally) => sum + (tally.sold ? Math.max(0, tally.hearts - tally.need) : tally.hearts),
    0,
  );
}

export function copyRequestCount(tallies: readonly HeartTally[]): number {
  return Math.min(MAX_COPY_REQUESTS, Math.floor(spareHearts(tallies) / HEARTS_PER_REQUEST));
}

export function mostLoved(tallies: readonly HeartTally[]): string | null {
  return (
    tallies.reduce<HeartTally | null>(
      (best, tally) => (best === null || tally.hearts > best.hearts ? tally : best),
      null,
    )?.pieceId ?? null
  );
}

function stonesCost(piece: CollectionPiece): number {
  const stoneId = piece.look.stoneId;
  return stoneId === null ? 0 : stoneById(stoneId).price * productById(piece.look.productId).seats.length;
}

export function copyRequestsFor(
  piece: CollectionPiece,
  count: number,
  tag: JewelTag,
  fair: number,
  rng: RngState,
): [PendingCopy[], RngState] {
  const [visitors, afterVisitors] = drawDistinct(
    rng,
    POPUP_VISITORS.map((visitor) => visitor.id),
    count,
  );
  let next = afterVisitors;
  const copies = visitors.map((visitorId): PendingCopy => {
    const [days, afterDays] = drawInt(next, COPY_DAYS[0], COPY_DAYS[1]);
    next = afterDays;
    return {
      visitorId,
      pieceId: piece.id,
      productId: piece.look.productId,
      options: piece.look.options,
      metalId: piece.look.metalId,
      stoneId: piece.look.stoneId,
      colours: piece.colours,
      tag,
      fee: Math.round(COPY_FEE * fair),
      budget: piece.spend + stonesCost(piece) + BUDGET_SPARE,
      days,
    };
  });
  return [copies, next];
}

function copyBrief(copy: PendingCopy, day: number, bonus: number): Brief {
  return {
    clientId: copy.visitorId,
    occasion: `One more ${productById(copy.productId).name}, like the window piece`,
    productId: copy.productId,
    deadlineDay: day + copy.days,
    budget: copy.budget,
    fee: copy.fee,
    requiredTags: [copy.tag],
    favouredColours: copy.colours,
    avoidColours: [],
    avoidMetals: [],
    requiredExtras: [],
    minQuality: COPY_MIN_QUALITY + bonus,
    preset: { options: copy.options, metalId: copy.metalId, stoneId: copy.stoneId },
  };
}

export function pinCopyRequests(state: GameState): GameState {
  const launch = state.launch;
  if (launch === null || launch.pendingCopies.length === 0) return state;
  const day = state.calendar.day;
  const bonus = difficultyById(state.profile.difficulty).minQualityBonus;
  let number = state.gigs.nextGigNumber;
  const offers = launch.pendingCopies.map((copy) => {
    const offer = {
      id: `gig-${number}`,
      clientId: copy.visitorId,
      brief: copyBrief(copy, day, bonus),
      expiresDay: day + OFFER_LIFETIME_DAYS,
    };
    number += 1;
    return offer;
  });
  const pinned: GameState = {
    ...state,
    gigs: { ...state.gigs, offers: [...state.gigs.offers, ...offers], nextGigNumber: number },
    launch: { ...launch, pendingCopies: [] },
  };
  return queueStoryTrigger(pinned, "copy-request");
}
