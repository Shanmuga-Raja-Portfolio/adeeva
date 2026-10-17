import type { AwardId } from "../content/launchAward";
import type { LaunchThemeId } from "../content/launchTheme";
import type { ThemeId } from "../content/marketTheme";
import type { PieceLook } from "./pieceLook";

export const KEEPSAKE_CASE_SIZE = 30;

export type KeepsakeSource =
  | { readonly kind: "order"; readonly clientId: string; readonly happy: boolean }
  | { readonly kind: "market"; readonly themeId: ThemeId; readonly score: number }
  | { readonly kind: "collection"; readonly themeId: LaunchThemeId; readonly award: AwardId };

export interface KeepsakeEntry {
  readonly id: string;
  readonly day: number;
  readonly source: KeepsakeSource;
  readonly look: PieceLook;
  readonly stars: number;
  readonly line: string;
}

export function addKeepsakes(
  keepsakes: readonly KeepsakeEntry[],
  entries: readonly KeepsakeEntry[],
): KeepsakeEntry[] {
  return [...keepsakes, ...entries].slice(-KEEPSAKE_CASE_SIZE);
}
