import type { JewelColour } from "../content/jewelColour";
import type { JewelTag } from "../content/jewelTag";
import type { PieceLook } from "./pieceLook";

export const STALL_BOX_SIZE = 6;

export interface StallPiece {
  readonly id: string;
  readonly look: PieceLook;
  readonly quality: number;
  readonly tags: readonly JewelTag[];
  readonly colours: readonly JewelColour[];
  readonly madeDay: number;
}

export function stallBoxFull(box: readonly StallPiece[]): boolean {
  return box.length >= STALL_BOX_SIZE;
}
