import { COLOURS, type ColourId } from "../../../engine/palette";
import { STYLE_TAGS, type StyleTag } from "../../../engine/styleTag";
import { findById, markById, materialById, patchById, trimById } from "./catalog";
import { placedAreaByFind } from "./cutCommit";
import { designTags } from "./flipPieces";
import type { FinishItem, FlipRun } from "./flipRun";
import type { OwnedFind } from "./ownedFind";

function ordered(tags: readonly StyleTag[]): StyleTag[] {
  const present = new Set(tags);
  return STYLE_TAGS.filter((tag) => present.has(tag));
}

export function finishTags(item: FinishItem): readonly StyleTag[] {
  if (item.kind === "trim") return trimById(item.trimId).tags;
  if (item.kind === "patch") return [...patchById(item.patchId).tags, ...item.scrap.tags];
  return markById(item.markId).tags;
}

export function finishColour(item: FinishItem): ColourId | null {
  if (item.kind === "patch") return item.scrap.colour;
  if (item.kind === "mark") return item.colour;
  return null;
}

export function mainFind(run: FlipRun): OwnedFind | null {
  const areas = placedAreaByFind(run);
  return run.finds.reduce<OwnedFind | null>((best, owned) => {
    if (best === null) return owned;
    return (areas[owned.id] ?? 0) > (areas[best.id] ?? 0) ? owned : best;
  }, null);
}

export function flipTags(run: FlipRun): StyleTag[] {
  const findTags = run.finds.flatMap((owned) => {
    const find = findById(owned.findId);
    return [...find.tags, ...materialById(find.material).tags];
  });
  const finishes = run.finishes.flatMap((finish) => finishTags(finish.item));
  return ordered([...designTags(run.design), ...findTags, ...finishes]);
}

export function flipColours(run: FlipRun): ColourId[] {
  const present = new Set<ColourId>([
    ...run.finds.map((owned) => findById(owned.findId).colour),
    ...run.finishes.flatMap((finish) => {
      const colour = finishColour(finish.item);
      return colour === null ? [] : [colour];
    }),
  ]);
  return COLOURS.map((colour) => colour.id).filter((id) => present.has(id));
}
