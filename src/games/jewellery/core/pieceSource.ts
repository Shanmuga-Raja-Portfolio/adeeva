import type { ChainId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { GlazeColour } from "../content/jewelColour";
import type { MetalId } from "../content/metal";
import type { ProductId } from "../content/product";
import type { StoneId } from "../content/stone";
import type { StoneTint } from "../content/stoneTint";
import type { DesignOptions, PieceLook, PlacedCharm } from "./pieceLook";
import type { PieceRun } from "./pieceRun";

export interface PieceSource {
  readonly productId: ProductId;
  readonly options: DesignOptions;
  readonly metalId: MetalId | null;
  readonly stoneId: StoneId | null;
  readonly stoneTint?: StoneTint | null | undefined;
  readonly finish: FinishId;
  readonly glaze: GlazeColour | null;
  readonly chain: ChainId | null;
  readonly cordColour: GlazeColour | null;
  readonly charms: readonly PlacedCharm[];
}

export function runSource(run: PieceRun): PieceSource {
  return {
    productId: run.design.productId,
    options: run.design.options,
    metalId: run.design.metalId,
    stoneId: run.design.stoneId,
    finish: run.display.finish,
    glaze: run.display.glaze,
    chain: run.display.chain,
    cordColour: run.display.cordColour,
    charms: run.display.charms,
  };
}

export function runLook(run: PieceRun): PieceLook | null {
  const { metalId } = run.design;
  if (metalId === null) return null;
  return {
    productId: run.design.productId,
    options: run.design.options,
    metalId,
    stoneId: run.design.stoneId,
    stoneTint: null,
    finish: run.display.finish,
    glaze: run.display.glaze,
    chain: run.display.chain,
    cordColour: run.display.cordColour,
    charms: run.display.charms,
  };
}
