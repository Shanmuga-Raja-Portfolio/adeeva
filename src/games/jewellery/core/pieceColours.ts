import { JEWEL_COLOURS, type JewelColour } from "../content/jewelColour";
import { extraById, metalById, productById, stoneById } from "./catalog";
import type { PieceSource } from "./pieceSource";

export function pieceColours(source: PieceSource): JewelColour[] {
  const product = productById(source.productId);
  const found = new Set<JewelColour>();
  if (source.metalId !== null) found.add(metalById(source.metalId).tone);
  if (source.stoneId !== null && product.seats.length > 0) found.add(stoneById(source.stoneId).colour);
  if (source.finish === "antique") found.add("charcoal");
  if (source.finish === "two-tone") found.add("gold");
  if (source.glaze !== null) found.add(source.glaze);
  if (source.chain !== null) {
    const holder = extraById(source.chain).colour;
    if (holder === "cord" && source.cordColour !== null) found.add(source.cordColour);
    else if (holder !== "cord" && holder !== "metal") found.add(holder);
  }
  for (const charm of source.charms) {
    const colour = extraById(charm.charmId).colour;
    if (colour !== "metal" && colour !== "cord") found.add(colour);
  }
  return JEWEL_COLOURS.map((colour) => colour.id).filter((id) => found.has(id));
}
