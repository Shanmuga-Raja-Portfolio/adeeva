import type { ProductId } from "../content/product";
import type { CollectionState } from "./collectionState";
import type { GameState } from "./gameState";
import { popupDone } from "./launchStatus";
import type { PieceLook } from "./pieceLook";

export interface LaunchedSlot {
  readonly look: PieceLook;
  readonly foundHome: boolean;
}

export function launchKeepsakeId(pieceId: string, seasonNumber: number): string {
  return `${pieceId}-launch-${seasonNumber}`;
}

export function launchedSlot(
  state: Pick<GameState, "launch" | "keepsakes">,
  collection: CollectionState,
  productId: ProductId,
): LaunchedSlot | null {
  const result = state.launch?.result;
  if (result === undefined || result === null || !popupDone(state, collection)) return null;
  for (const pieceId of result.plan.order) {
    const keepsake = state.keepsakes.find(
      (entry) => entry.id === launchKeepsakeId(pieceId, result.seasonNumber),
    );
    if (keepsake === undefined || keepsake.look.productId !== productId) continue;
    return { look: keepsake.look, foundHome: !collection.drawer.some((piece) => piece.id === pieceId) };
  }
  return null;
}
