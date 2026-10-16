import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { autoSpots, rugsFor } from "./floorArrange";
import type { GameState } from "./gameState";
import type { FloorMode, ShowroomState } from "./showroomState";

export const BASE_BAYS = 2;
export const FLOOR_FULL = "The floor is full. Open House is on day 7.";

export function bayCount(state: Pick<GameState, "upgrades">): number {
  return BASE_BAYS + (state.upgrades.includes("hand-cart") ? 1 : 0);
}

export function freeBay(showroom: ShowroomState, bays: number): number | null {
  for (let bay = 0; bay < bays; bay += 1) if (!showroom.floor.some((set) => set.bay === bay)) return bay;
  return null;
}

export function floorCheck(state: GameState): ActionCheck {
  const showroom = state.showroom;
  if (showroom === null) return actionCheck(["Open the showroom first."]);
  return actionCheck(freeBay(showroom, bayCount(state)) === null ? [FLOOR_FULL] : []);
}

export function markFloorSet(state: GameState, setId: string, mode: FloorMode): GameState {
  const showroom = state.showroom;
  const set = showroom?.floor.find((entry) => entry.setId === setId);
  if (showroom === null || set === undefined || set.mode === mode) return state;
  return {
    ...state,
    showroom: {
      ...showroom,
      floor: showroom.floor.map((entry) => (entry.setId === setId ? { ...entry, mode } : entry)),
      salePick: mode === "show" && showroom.salePick === setId ? null : showroom.salePick,
    },
  };
}

export function pickOpenHouse(state: GameState, setId: string): GameState {
  const showroom = state.showroom;
  const set = showroom?.floor.find((entry) => entry.setId === setId);
  if (showroom === null || set === undefined || set.mode !== "sale" || showroom.salePick === setId)
    return state;
  if (state.fair?.pickSetId === setId && state.fair.result === null) return state;
  return { ...state, showroom: { ...showroom, salePick: setId } };
}

export function relaidFloor(showroom: ShowroomState, bays: number): ShowroomState {
  const rugs = rugsFor(bays);
  return {
    ...showroom,
    floor: showroom.floor.map((set) => {
      const rug = rugs[set.bay];
      if (rug === undefined) return set;
      const spots = autoSpots(
        set.pieces.map((piece) => piece.productId),
        rug,
      );
      return {
        ...set,
        pieces: set.pieces.map((piece, index) => ({ ...piece, spot: spots[index] ?? piece.spot })),
      };
    }),
  };
}
