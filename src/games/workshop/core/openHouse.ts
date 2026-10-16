import { applyStanding } from "../../../engine/standing";
import { setNumber } from "./fairPick";
import { isOnOwnRug, rugsFor } from "./floorArrange";
import type { GameState } from "./gameState";
import { isOpenHouseDay } from "./seasonCalendar";
import { bayCount } from "./showroomFloor";
import type { FloorSet } from "./showroomState";
import { queueStoryTrigger } from "./storyQueue";

export const SALE_BUZZ = 3;
export const SHOW_BUZZ = 2;
export const RUG_BUZZ = 2;
export const QUIET_OPEN_HOUSE = "A quiet Open House. Visitors loved the smell of fresh wood.";

function savedForFair(state: GameState, set: FloorSet): boolean {
  const fair = state.fair;
  return fair !== null && fair.result === null && fair.pickSetId === set.setId;
}

export function forSaleSets(state: GameState): FloorSet[] {
  const showroom = state.showroom;
  if (showroom === null) return [];
  return showroom.floor
    .filter((set) => set.mode === "sale" && !savedForFair(state, set))
    .sort((a, b) => a.madeDay - b.madeDay || setNumber(a.setId) - setNumber(b.setId));
}

export function openHouseSale(state: GameState): FloorSet | null {
  const candidates = forSaleSets(state);
  const picked = candidates.find((set) => set.setId === state.showroom?.salePick);
  return picked ?? candidates[0] ?? null;
}

export function runOpenHouse(state: GameState, endedDay: number): GameState {
  const showroom = state.showroom;
  if (showroom === null || !isOpenHouseDay(state, endedDay)) return state;
  const sold = openHouseSale(state);
  const rugs = rugsFor(bayCount(state));
  const shown = showroom.floor.filter((set) => set.mode === "show").length;
  const onRugs = showroom.floor.filter((set) => isOnOwnRug(set, rugs)).length;
  const buzz = (sold === null ? 0 : SALE_BUZZ) + SHOW_BUZZ * shown + RUG_BUZZ * onRugs;
  const after: GameState = {
    ...state,
    showroom: {
      ...showroom,
      floor: sold === null ? showroom.floor : showroom.floor.filter((set) => set.setId !== sold.setId),
      salePick: null,
    },
  };
  const paid = applyStanding(after, { coins: sold?.price ?? 0, reputation: 0, buzz });
  return queueStoryTrigger(paid, "first-open-house");
}
