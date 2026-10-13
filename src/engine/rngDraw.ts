import { nextRandom, type RngState } from "./rng";

export function drawInt(rng: RngState, min: number, max: number): [number, RngState] {
  const [roll, next] = nextRandom(rng);
  return [min + Math.floor(roll * (max - min + 1)), next];
}

export function drawItem<T>(rng: RngState, items: readonly T[]): [T, RngState] {
  const [index, next] = drawInt(rng, 0, items.length - 1);
  const item = items[index];
  if (item === undefined) throw new Error("Cannot draw from an empty list");
  return [item, next];
}

export function drawDistinct<T>(rng: RngState, items: readonly T[], count: number): [T[], RngState] {
  const pool = [...items];
  const picked: T[] = [];
  let state = rng;
  while (picked.length < count && pool.length > 0) {
    const [index, next] = drawInt(state, 0, pool.length - 1);
    state = next;
    picked.push(...pool.splice(index, 1));
  }
  return [picked, state];
}
