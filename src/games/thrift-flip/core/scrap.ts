import type { ColourId, MaterialId, PrintId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import { MAX_SCRAPS } from "../content/finish";

export interface Scrap {
  readonly id: string;
  readonly name: string;
  readonly colour: ColourId;
  readonly print: PrintId;
  readonly material: MaterialId;
  readonly tags: readonly StyleTag[];
}

export type ScrapSource = Omit<Scrap, "id">;

export function addScraps(
  held: readonly Scrap[],
  sources: readonly ScrapSource[],
  nextNumber: number,
): { readonly scraps: readonly Scrap[]; readonly nextNumber: number } {
  const room = Math.max(0, MAX_SCRAPS - held.length);
  const added = sources
    .slice(0, room)
    .map((source, index) => ({ ...source, id: `scrap-${nextNumber + index}` }));
  return { scraps: [...held, ...added], nextNumber: nextNumber + added.length };
}
