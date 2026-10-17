import { CHAIN_IDS, CHARM_IDS, type ChainId, type CharmId } from "../content/extra";
import type { JewelTag } from "../content/jewelTag";
import { METALS } from "../content/metal";
import { OPTIONS, type OptionId, type OptionSlot } from "../content/partOption";
import { STONES } from "../content/stone";
import type { Brief } from "./brief";
import { nextRandom } from "../../../engine/rng";
import { productById } from "./catalog";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { GOOD_PLAN, playRunTo, settleStories, type PiecePlan } from "./testPlaythrough";

export interface BotSkill {
  readonly cutOffset: number;
  readonly cutSpread: number;
  readonly overTicks: number;
  readonly overSpread: number;
  readonly clawTravel: number;
  readonly slipChance: number;
}

export const DECENT_SKILL: BotSkill = {
  cutOffset: 0.2,
  cutSpread: 0.35,
  overTicks: 0,
  overSpread: 150,
  clawTravel: 0.92,
  slipChance: 0.2,
};

function missingTags(have: readonly JewelTag[], wanted: readonly JewelTag[]): JewelTag[] {
  return wanted.filter((tag) => !have.includes(tag));
}

export function botPlan(state: GameState, brief: Brief, skill: BotSkill, seed: number): PiecePlan {
  const [steady, afterSteady] = nextRandom(seed);
  const [slip] = nextRandom(afterSteady);
  const slipped = slip < skill.slipChance;
  const product = productById(brief.productId);
  let missing = slipped ? [] : missingTags(product.tags, brief.requiredTags);
  const options: Partial<Record<OptionSlot, OptionId>> = {};
  for (const slot of product.slots) {
    const choices = OPTIONS.filter((option) => option.slot === slot);
    const best = choices.find((option) => option.tags.some((tag) => missing.includes(tag))) ?? choices[0];
    if (best === undefined) continue;
    options[slot] = best.id;
    missing = missingTags(best.tags, missing);
  }
  const metals = METALS.filter(
    (metal) =>
      state.reputation >= metal.minReputation &&
      (slipped || !brief.avoidMetals.includes(metal.id)) &&
      metal.price <= 12,
  );
  const metal =
    metals.find((entry) => entry.tags.some((tag) => missing.includes(tag))) ??
    metals.find((entry) => entry.tags.includes("classic")) ??
    metals[0];
  missing = missingTags(metal?.tags ?? [], missing);
  const stones = STONES.filter(
    (stone) => state.reputation >= stone.minReputation && !brief.avoidColours.includes(stone.colour),
  );
  const stone =
    stones.find((entry) => entry.tags.some((tag) => missing.includes(tag))) ??
    stones.find((entry) => brief.favouredColours.includes(entry.colour)) ??
    stones[0];
  const chain: ChainId | null =
    brief.requiredExtras
      .map((need) => need.extraId)
      .find((id): id is ChainId => CHAIN_IDS.some((chain) => chain === id)) ??
    product.holder?.choices[0] ??
    null;
  const charms: CharmId[] = brief.requiredExtras.flatMap((need) =>
    CHARM_IDS.some((id) => id === need.extraId)
      ? Array.from({ length: need.count }, () => need.extraId as CharmId)
      : [],
  );
  return {
    ...GOOD_PLAN,
    options,
    metalId: metal?.id ?? "copper",
    stoneId: product.seats.length > 0 ? (stone?.id ?? "sky-glass") : null,
    cutOffset: skill.cutOffset + skill.cutSpread * steady,
    overTicks: Math.round(skill.overTicks + skill.overSpread * steady),
    clawTravel: skill.clawTravel,
    chain,
    cordColour: chain === "silk-cord" || chain === "beaded-cord" || chain === "velvet-ribbon" ? "sky" : null,
    charms: slipped ? [] : charms,
  };
}

function workOrder(state: GameState, plan: PiecePlan): GameState {
  try {
    return playRunTo(state, plan, "review");
  } catch {
    return playRunTo(state, { ...plan, cutOffset: 0 }, "review");
  }
}

export function botDay(state: GameState, skill: BotSkill): GameState {
  let current = settleStories(state);
  for (const offer of current.gigs.offers)
    if (current.gigs.active.length < 3) current = reduce(current, { type: "acceptOffer", offerId: offer.id });
  const gig = [...current.gigs.active].sort((a, b) => a.brief.deadlineDay - b.brief.deadlineDay)[0];
  if (gig !== undefined && current.calendar.hoursLeft >= 8) {
    const started = reduce(current, { type: "startOrder", gigId: gig.id });
    if (started !== current && started.activeRun !== null) {
      const plan = botPlan(started, gig.brief, skill, started.activeRun.seed);
      const reviewed = workOrder(started, plan);
      current = settleStories(reduce(reviewed, { type: "deliver" }));
    }
  }
  if (current.activeRun !== null && current.activeRun.stage !== "done")
    current = reduce(current, { type: "abandonRun" });
  return settleStories(reduce(current, { type: "endDay" }));
}
