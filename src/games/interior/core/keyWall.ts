import { KEY_IDS, KEYS, VERDICTS, type KeyId } from "../content/openHouseKey";
import { PLOT_IDS } from "../content/plot";
import type { KeyWall } from "./larkspur";

export const EMPTY_KEY_WALL: KeyWall = Object.fromEntries(PLOT_IDS.map((id) => [id, null])) as KeyWall;

export function keyFor(overall: number): KeyId {
  const earned = [...KEYS].reverse().find((key) => overall >= key.minimum);
  return earned?.id ?? "welcome";
}

export function keyRank(keyId: KeyId): number {
  return KEY_IDS.indexOf(keyId);
}

export function atLeast(keyId: KeyId | null, floor: KeyId): boolean {
  return keyId !== null && keyRank(keyId) >= keyRank(floor);
}

export function betterKey(current: KeyId | null, earned: KeyId): KeyId {
  return current !== null && keyRank(current) >= keyRank(earned) ? current : earned;
}

export function verdictFor(overall: number): string {
  return VERDICTS.find(([floor]) => overall >= floor)?.[1] ?? "Warmly welcomed";
}

export function isStreetOfHomes(wall: KeyWall): boolean {
  const all = PLOT_IDS.every((id) => atLeast(wall[id], "silver"));
  return all && PLOT_IDS.some((id) => atLeast(wall[id], "gold"));
}

export function isEveryGold(wall: KeyWall): boolean {
  return PLOT_IDS.every((id) => atLeast(wall[id], "gold"));
}
