import type { ColourId } from "../../../engine/palette";
import { average } from "../../../engine/average";

function overlap(a: readonly ColourId[], b: readonly ColourId[]): number {
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  return a.filter((colour) => b.includes(colour)).length / union.size;
}

export function paletteCohesion(palettes: readonly (readonly ColourId[])[]): number {
  const pairs = palettes.flatMap((first, index) =>
    palettes.slice(index + 1).map((second) => overlap(first, second)),
  );
  return average(pairs);
}
