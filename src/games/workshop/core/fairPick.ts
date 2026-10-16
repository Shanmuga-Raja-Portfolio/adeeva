import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { idNumber } from "../../../engine/idNumber";
import type { FairThemeDef } from "../content/fairTheme";
import { SEASON_DAYS } from "../content/season";
import { fairBoothByNumber } from "./catalog";
import type { GameState } from "./gameState";
import { FAIR_SEASON_DAY } from "./seasonCalendar";
import type { FloorSet, ShowroomState } from "./showroomState";

export function setNumber(setId: string): number {
  return idNumber(setId, "set");
}

export function fairWindowStart(showroom: ShowroomState): number {
  return showroom.seasonNumber === 1 ? 0 : showroom.seasonStartDay - SEASON_DAYS + FAIR_SEASON_DAY - 1;
}

export function fairEligibleSets(state: GameState): FloorSet[] {
  const { showroom, fair } = state;
  if (showroom === null || fair === null) return [];
  const booth = fairBoothByNumber(fair.booth);
  const from = fairWindowStart(showroom);
  return showroom.floor.filter(
    (set) =>
      set.madeDay >= from &&
      !Object.hasOwn(fair.rosettesBySet, set.setId) &&
      set.pieces.length >= booth.minPieces &&
      set.pieces.length <= booth.maxPieces,
  );
}

export function themeMatches(set: FloorSet, theme: FairThemeDef): number {
  return theme.tags.filter((tag) => set.stats.tags.includes(tag)).length;
}

export function bramsPick(state: GameState, theme: FairThemeDef): FloorSet | null {
  const ranked = [...fairEligibleSets(state)].sort(
    (a, b) =>
      themeMatches(b, theme) - themeMatches(a, theme) ||
      b.stats.quality - a.stats.quality ||
      setNumber(b.setId) - setNumber(a.setId),
  );
  return ranked[0] ?? null;
}

export function pickCheck(state: GameState, setId: string): ActionCheck {
  const fair = state.fair;
  if (state.career !== "showroom" || fair === null) return actionCheck(["Open the showroom first."]);
  if (fair.result !== null) return actionCheck(["This season's Fair is done."]);
  if (state.showroom?.rested === true) return actionCheck(["The shop is resting this season."]);
  if (!fairEligibleSets(state).some((set) => set.setId === setId))
    return actionCheck(["Pick a new set that fits the booth."]);
  return actionCheck([]);
}

export function pickFairSet(state: GameState, setId: string): GameState {
  const fair = state.fair;
  const showroom = state.showroom;
  if (fair === null || showroom === null || fair.pickSetId === setId || !pickCheck(state, setId).ok)
    return state;
  return {
    ...state,
    fair: { ...fair, pickSetId: setId },
    showroom: { ...showroom, salePick: showroom.salePick === setId ? null : showroom.salePick },
  };
}
