import { ownEntry } from "../../../engine/ownEntry";
import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { recordWithout } from "../../../engine/recordWithout";
import type { GameState } from "./gameState";
import { bestLightCell, canMountAt, type PlacedLight } from "./lighting";
import { runRoom } from "./runRoom";
import type { MakeoverRun } from "./makeoverRun";

export function placedLights(run: MakeoverRun, except: number | null = null): PlacedLight[] {
  return run.plan.lights.flatMap((lightId, index) => {
    const place = ownEntry(run.lightPlaces, String(index));
    return place === undefined || index === except ? [] : [{ lightId, col: place.col, row: place.row }];
  });
}

export function canPlaceLight(run: MakeoverRun, index: number, col: number, row: number): boolean {
  const lightId = run.plan.lights[index];
  if (lightId === undefined || !Number.isInteger(col) || !Number.isInteger(row)) return false;
  return canMountAt(runRoom(run), run.plan.pieces, placedLights(run, index), lightId, [col, row]);
}

export function placeLight(state: GameState, index: number, col: number, row: number): GameState {
  return updateActiveRun(state, "light", (run) => {
    if (!Number.isInteger(index) || !canPlaceLight(run, index, col, row)) return null;
    const current = ownEntry(run.lightPlaces, String(index));
    if (current !== undefined && current.col === col && current.row === row) return null;
    return { ...run, lightPlaces: { ...run.lightPlaces, [String(index)]: { col, row } } };
  });
}

export function liftLight(state: GameState, index: number): GameState {
  return updateActiveRun(state, "light", (run) =>
    Number.isInteger(index) && Object.hasOwn(run.lightPlaces, String(index))
      ? { ...run, lightPlaces: recordWithout(run.lightPlaces, String(index)) }
      : null,
  );
}

export function showMeLight(state: GameState): GameState {
  return updateActiveRun(state, "light", (run) => {
    const index = run.plan.lights.findIndex(
      (_, position) => !Object.hasOwn(run.lightPlaces, String(position)),
    );
    const lightId = run.plan.lights[index];
    if (lightId === undefined) return null;
    const cell = bestLightCell(runRoom(run), run.plan.pieces, placedLights(run), lightId);
    if (cell === null) return null;
    return {
      ...run,
      lightAssisted: true,
      lightPlaces: { ...run.lightPlaces, [String(index)]: { col: cell[0], row: cell[1] } },
    };
  });
}

export function lightIssues(run: MakeoverRun): string[] {
  return placedLights(run).length === 0 ? ["Place at least one light."] : [];
}
