import { cappedAccuracy } from "../../../engine/assistCap";
import { average } from "../../../engine/average";
import { recordFollow, type FollowProgress } from "../../../engine/followRecord";
import { nextRandom } from "../../../engine/rng";
import type { Dish, DishDef } from "../content/dish";
import { SAVOURY_JAR, type JarId, type TastePoint } from "../content/seasoning";
import { jarById } from "./catalog";
import { isValidChopRecord, quickChopItems, scoreChop, type ChopRecord } from "./chop";
import { cardFor } from "./dishDiary";
import type { GameState } from "./gameState";
import { DRIP_FACTOR, GHOST_SCORE, scorePlate } from "./plate";
import { scoreSimmer, simmerBounds } from "./simmer";
import { quickSizzle, scoreSizzle, type SizzleRecord } from "./sizzle";
import { cuisineJars, dishTasteStart, isValidTasteRecord, scoreTaste, type TasteState } from "./taste";
import { tasteMemoryFor } from "./tasteMemory";
import { toleranceFor } from "./tolerance";

export const QUICK_SIMMER_LAPS = 1;

export type QuickRecord =
  | { readonly kind: "chop"; readonly items: readonly ChopRecord[] }
  | { readonly kind: "sizzle"; readonly record: SizzleRecord }
  | { readonly kind: "simmer"; readonly follow: FollowProgress }
  | {
      readonly kind: "taste";
      readonly pinches: readonly JarId[];
      readonly tastes: number;
      readonly assisted: boolean;
    }
  | { readonly kind: "plate"; readonly wiped: boolean };

export interface QuickScore {
  readonly accuracy: number;
  readonly assisted: boolean;
}

export interface QuickTasteStart {
  readonly start: TasteState;
  readonly helper: boolean;
}

function drift(seed: number, ticketIndex: number, dishIndex: number, dish: DishDef): TastePoint {
  const options: TastePoint[] = [
    [0, 0],
    ...cuisineJars(dish.cuisine)
      .filter((jar) => jar !== SAVOURY_JAR)
      .map((jar): TastePoint => [-jarById(jar).vector[0], -jarById(jar).vector[1]]),
  ];
  const [roll] = nextRandom((seed + ticketIndex * 977 + dishIndex * 131) | 0);
  return options[Math.floor(roll * options.length)] ?? [0, 0];
}

export function quickTasteStart(
  state: GameState,
  seed: number,
  ticketIndex: number,
  dishIndex: number,
  dish: Dish,
): QuickTasteStart | null {
  if (dish.taste === null) return null;
  const memory = tasteMemoryFor(state.tasteMemory, dish.id);
  if (memory === null) return { start: dishTasteStart(dish.taste), helper: true };
  const shift = drift(seed, ticketIndex, dishIndex, dish);
  return {
    start: { point: [memory.point[0] + shift[0], memory.point[1] + shift[1]], savoury: memory.savoury },
    helper: false,
  };
}

export function scoreQuick(
  state: GameState,
  dish: Dish,
  record: QuickRecord,
  tasteStart: QuickTasteStart | null,
): QuickScore | null {
  switch (record.kind) {
    case "chop": {
      const items = quickChopItems(dish.chop);
      if (items.length === 0 || record.items.length !== items.length) return null;
      if (
        !items.every((item, index) => {
          const entry = record.items[index];
          return entry !== undefined && isValidChopRecord(item, entry);
        })
      )
        return null;
      const scores = items.map((item, index) =>
        scoreChop(
          item,
          record.items[index] ?? { offsets: [], assisted: false },
          toleranceFor(state, "chop"),
          state.profile.difficulty,
        ),
      );
      return {
        accuracy: average(scores.map((score) => score.accuracy)),
        assisted: scores.some((score) => score.assisted),
      };
    }
    case "sizzle": {
      if (dish.sizzle === null) return null;
      const result = scoreSizzle(quickSizzle(dish.sizzle), record.record, toleranceFor(state, "sizzle"));
      return result === null ? null : { accuracy: result.accuracy, assisted: result.assisted };
    }
    case "simmer": {
      if (dish.simmer === null) return null;
      const follow = recordFollow(undefined, record.follow, simmerBounds(QUICK_SIMMER_LAPS));
      if (follow === null) return null;
      const result = scoreSimmer(dish.simmer, QUICK_SIMMER_LAPS, follow);
      return { accuracy: result.accuracy, assisted: result.assisted };
    }
    case "taste": {
      if (dish.taste === null || tasteStart === null) return null;
      const jars = cuisineJars(dish.cuisine);
      const taste = { pinches: record.pinches, tastes: record.tastes, assisted: record.assisted };
      if (!isValidTasteRecord(taste, jars)) return null;
      const result = scoreTaste(
        dish.taste,
        jars,
        tasteStart.start,
        taste,
        toleranceFor(state, "taste"),
        state.profile.difficulty === "relaxed",
      );
      return { accuracy: result.accuracy, assisted: result.assisted };
    }
    case "plate": {
      if (typeof record.wiped !== "boolean") return null;
      const card = cardFor(state.platingCards, dish.id);
      if (card === null)
        return {
          accuracy: cappedAccuracy(GHOST_SCORE * (record.wiped ? 1 : DRIP_FACTOR), false),
          assisted: false,
        };
      const result = scorePlate(
        dish,
        {
          components: card.components,
          plateColour: card.plateColour,
          wiped: record.wiped,
          assisted: card.assisted,
        },
        toleranceFor(state, "plate"),
      );
      return { accuracy: result.accuracy, assisted: card.assisted };
    }
  }
}
