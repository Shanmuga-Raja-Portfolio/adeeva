import type { StyleTag } from "../../../engine/styleTag";
import type { FairThemeDef } from "../content/fairTheme";
import type { BakeBookEntry } from "./bakeBook";
import { fillingById, mixById, productById, toppingById } from "./catalog";
import type { GameState } from "./gameState";

export const SIDE_PLATES = 2;
export const STAR_BAND_FLOOR: Readonly<Record<number, number>> = { 5: 90, 4: 75, 3: 55, 2: 35, 1: 0 };

export function entryTags(entry: BakeBookEntry): StyleTag[] {
  const tags: StyleTag[] = [
    ...productById(entry.productId).tags,
    ...entry.mixIds.flatMap((id) => mixById(id).tags),
    ...(entry.fillingId === null ? [] : fillingById(entry.fillingId).tags),
    ...entry.toppings.flatMap((placed) => toppingById(placed.toppingId).tags),
  ];
  return [...new Set(tags)];
}

export function entryQuality(entry: BakeBookEntry): number {
  return entry.quality ?? STAR_BAND_FLOOR[entry.stars] ?? 0;
}

export function sidePlateOptions(state: GameState): BakeBookEntry[] {
  const fair = state.fair;
  if (fair === null) return [];
  return state.bakeBook.filter(
    (entry) => entry.runId !== fair.entry?.runId && !fair.shownRunIds.includes(entry.runId),
  );
}

function themeFit(entry: BakeBookEntry, theme: FairThemeDef): [number, number] {
  const tags = entryTags(entry);
  return [
    theme.tags.filter((tag) => tags.includes(tag)).length,
    entry.colours.filter((colour) => theme.palette.includes(colour)).length,
  ];
}

export function ottisPicks(state: GameState, theme: FairThemeDef): string[] {
  const options = sidePlateOptions(state).map((entry, index) => ({
    entry,
    index,
    fit: themeFit(entry, theme),
  }));
  const ranked = [...options].sort((a, b) => b.fit[0] - a.fit[0] || b.fit[1] - a.fit[1] || b.index - a.index);
  return ranked.slice(0, SIDE_PLATES).map((option) => option.entry.runId);
}
