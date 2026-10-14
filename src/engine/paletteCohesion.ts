import { average } from "./average";

function overlap<T extends string>(a: readonly T[], b: readonly T[]): number {
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  return a.filter((colour) => b.includes(colour)).length / union.size;
}

export function paletteCohesion<T extends string>(palettes: readonly (readonly T[])[]): number {
  const pairs = palettes.flatMap((first, index) =>
    palettes.slice(index + 1).map((second) => overlap(first, second)),
  );
  return average(pairs);
}
