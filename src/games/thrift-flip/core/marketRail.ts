import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import { BOUTIQUE_FIND_IDS } from "../content/boutiqueFind";
import { CONDITIONS, type ConditionGrade } from "../content/condition";
import { FINDS, type FindDef, type FindId } from "../content/find";
import { FIND_FIT } from "../content/findFit";
import { briefFitKeys, type Brief } from "./brief";
import { conditionById, findById, recipeById } from "./catalog";
import { designFor } from "./design";
import type { GameState, RailSlot } from "./gameState";

export const RAIL_SIZE = 6;

export function unlockedFinds(state: Pick<GameState, "reputation" | "profile">): FindDef[] {
  return FINDS.filter(
    (find) =>
      state.reputation >= find.minReputation &&
      (state.profile.career === "boutique" || !BOUTIQUE_FIND_IDS.some((id) => id === find.id)),
  );
}

export function findFitsKey(findId: FindId, key: string): boolean {
  return FIND_FIT[findId].includes(key);
}

export function findSuitsBrief(findId: FindId, brief: Brief): boolean {
  const find = findById(findId);
  if (brief.avoidMaterials.includes(find.material) || brief.avoidColours.includes(find.colour)) return false;
  return briefFitKeys(brief).some((key) => {
    const { recipeId } = designFor(key);
    if (recipeId === null || !findFitsKey(findId, key)) return false;
    return !recipeById(recipeId).blockedMaterials.includes(find.material);
  });
}

export function slotPrice(findId: FindId, grade: ConditionGrade): number {
  return Math.max(1, Math.round(findById(findId).price * conditionById(grade).priceMultiplier));
}

export function rollGrade(rng: RngState): [ConditionGrade, RngState] {
  const total = CONDITIONS.reduce((sum, condition) => sum + condition.weight, 0);
  const [roll, next] = drawInt(rng, 1, total);
  let running = 0;
  for (const condition of CONDITIONS) {
    running += condition.weight;
    if (roll <= running) return [condition.id, next];
  }
  return ["loved", next];
}

function openBriefs(state: GameState): Brief[] {
  return [...state.gigs.offers.map((offer) => offer.brief), ...state.gigs.active.map((gig) => gig.brief)];
}

function guaranteeFits(
  picked: readonly FindDef[],
  pool: readonly FindDef[],
  briefs: readonly Brief[],
  rng: RngState,
): [FindDef[], RngState] {
  const rail = [...picked];
  const protectedSlots = new Set<number>();
  let state = rng;
  for (const brief of briefs) {
    const fitting = rail.findIndex(
      (find, index) => !protectedSlots.has(index) && findSuitsBrief(find.id, brief),
    );
    if (fitting !== -1) {
      protectedSlots.add(fitting);
      continue;
    }
    const candidates = pool.filter((find) => !rail.includes(find) && findSuitsBrief(find.id, brief));
    const open = rail.map((_, index) => index).filter((index) => !protectedSlots.has(index));
    if (candidates.length === 0 || open.length === 0) continue;
    const [[swapIn], afterCandidate] = drawDistinct(state, candidates, 1);
    const [[slot], afterSlot] = drawDistinct(afterCandidate, open, 1);
    state = afterSlot;
    if (swapIn === undefined || slot === undefined) continue;
    rail[slot] = swapIn;
    protectedSlots.add(slot);
  }
  return [rail, state];
}

export function rollRail(state: GameState): GameState {
  const pool = unlockedFinds(state);
  const [picked, afterPick] = drawDistinct(state.rng, pool, Math.min(RAIL_SIZE, pool.length));
  const [finds, afterGuarantee] = guaranteeFits(picked, pool, openBriefs(state), afterPick);
  let rng = afterGuarantee;
  const rail: RailSlot[] = finds.map((find, index) => {
    const [grade, afterGrade] = rollGrade(rng);
    rng = afterGrade;
    return {
      id: `rail-${state.calendar.day}-${index + 1}`,
      findId: find.id,
      grade,
      price: slotPrice(find.id, grade),
      sold: false,
    };
  });
  return { ...state, rail, rng };
}
