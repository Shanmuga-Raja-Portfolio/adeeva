import type { StoneTint } from "../content/stoneTint";
import { STONE_TINTS } from "../content/stoneTint";
import type { CollectionPiece } from "./collectionState";

function commonTint(tints: readonly StoneTint[]): StoneTint | null {
  let best: StoneTint | null = null;
  let bestCount = 0;
  for (const tint of STONE_TINTS) {
    const count = tints.filter((entry) => entry === tint).length;
    if (count > bestCount) {
      best = tint;
      bestCount = count;
    }
  }
  return best;
}

export function stoneMatch(pieces: readonly Pick<CollectionPiece, "potStones">[]): number | null {
  const stones = pieces.flatMap((piece) => piece.potStones);
  if (stones.length === 0) return null;
  const types = [...new Set(stones.map((stone) => stone.stoneId))];
  const matched = types.reduce((sum, type) => {
    const tints = stones.filter((stone) => stone.stoneId === type).map((stone) => stone.tint);
    const common = commonTint(tints);
    return sum + tints.filter((tint) => tint === common).length;
  }, 0);
  return matched / stones.length;
}

export function meanShimmer(pieces: readonly Pick<CollectionPiece, "potStones">[]): number | null {
  const stones = pieces.flatMap((piece) => piece.potStones);
  if (stones.length === 0) return null;
  return stones.reduce((sum, stone) => sum + stone.shimmer, 0) / stones.length;
}
