import { CLIP_SET } from "../content/extra";
import { extraById, finishById, productById, stoneById } from "./catalog";
import type { PieceRun } from "./pieceRun";
import { plannedSizes } from "./sheetPlan";
import { stockPrice } from "./stock";
import { canonicalSizes } from "./supplies";

function metalSpend(run: PieceRun): number {
  const metalId = run.design.metalId;
  if (metalId === null) return 0;
  const planned = plannedSizes(run);
  const sizes = run.consumed ?? (planned.length > 0 ? planned : canonicalSizes(run));
  return sizes.reduce((sum, size) => sum + stockPrice(metalId, size), 0);
}

export function pieceSpend(run: PieceRun): number {
  const product = productById(run.design.productId);
  const stones = run.design.stoneId === null ? 0 : stoneById(run.design.stoneId).price * product.seats.length;
  const chain = run.display.chain === null ? 0 : extraById(run.display.chain).price;
  const charms = run.display.charms.reduce((sum, charm) => sum + extraById(charm.charmId).price, 0);
  return (
    metalSpend(run) +
    stones +
    product.clipSets * CLIP_SET.price +
    finishById(run.display.finish).price +
    chain +
    charms
  );
}
