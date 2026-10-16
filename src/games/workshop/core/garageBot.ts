import type { ColourId } from "../../../engine/palette";
import { PAINT_COLOURS, FINISHES } from "../content/finish";
import { PART_OPTIONS, type PartOptionId, type PartSlot } from "../content/partOption";
import { WOODS } from "../content/wood";
import type { WoodTag } from "../content/woodTag";
import type { Brief } from "./brief";
import { productById } from "./catalog";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { BIRDHOUSE_PLAN, playToReview, settleStories, type PiecePlan } from "./testPlaythrough";

function covers(tags: readonly WoodTag[], wanted: readonly WoodTag[]): WoodTag[] {
  return wanted.filter((tag) => !tags.includes(tag));
}

export function briefPlan(state: GameState, brief: Brief, joinOffsetShare: number): PiecePlan {
  const productId = brief.products[0] ?? "birdhouse";
  const product = productById(productId);
  let missing = [...brief.requiredTags];
  const options: Partial<Record<PartSlot, PartOptionId>> = {};
  for (const slot of product.slots) {
    const choices = PART_OPTIONS.filter((option) => option.slot === slot);
    const best = choices.find((option) => option.tags.some((tag) => missing.includes(tag))) ?? choices[0];
    if (best === undefined) continue;
    options[slot] = best.id;
    missing = covers(best.tags, missing);
  }
  const woods = WOODS.filter(
    (wood) =>
      state.reputation >= wood.minReputation && !brief.avoidWoods.includes(wood.id) && wood.price <= 8,
  );
  const wood = woods.find((entry) => entry.tags.some((tag) => missing.includes(tag))) ?? woods[0];
  missing = covers(wood?.tags ?? [], missing);
  const finish = FINISHES.find((entry) => entry.tags.some((tag) => missing.includes(tag))) ?? FINISHES[0];
  const favouredPaint = brief.favouredColours.find((colour): colour is ColourId =>
    PAINT_COLOURS.some((paint) => paint === colour),
  );
  return {
    ...BIRDHOUSE_PLAN,
    productId,
    options,
    woodId: wood?.id ?? "pine",
    joinOffsetShare,
    finishId: finish?.id ?? "clear-oil",
    paint: finish?.needsPaint === true ? (favouredPaint ?? "sky") : null,
    extras: brief.requiredExtras.flatMap((need) => Array.from({ length: need.count }, () => need.extra)),
  };
}

export function botDay(state: GameState, joinOffsetShare: number): GameState {
  let current = settleStories(reduce(state, { type: "setAside" }));
  const offer = current.gigs.offers[0];
  if (offer !== undefined && current.gigs.active.length < 3)
    current = reduce(current, { type: "acceptOffer", offerId: offer.id });
  const gig = current.gigs.active[0];
  if (gig !== undefined) {
    const reviewed = playToReview(current, gig.id, briefPlan(current, gig.brief, joinOffsetShare), (kind) =>
      kind === "comb" ? 2 : 3,
    );
    current = settleStories(reduce(reduce(reviewed, { type: "deliver" }), { type: "setAside" }));
  }
  return settleStories(reduce(current, { type: "endDay" }));
}
