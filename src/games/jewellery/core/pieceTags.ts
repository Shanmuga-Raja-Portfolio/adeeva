import { JEWEL_TAGS, type JewelTag } from "../content/jewelTag";
import type { OptionId } from "../content/partOption";
import { extraById, finishById, metalById, optionById, productById, stoneById } from "./catalog";
import type { PieceSource } from "./pieceSource";

export function pieceTags(source: PieceSource): JewelTag[] {
  const product = productById(source.productId);
  const optionIds = Object.values(source.options).filter((id): id is OptionId => id !== undefined);
  const found = new Set<JewelTag>([
    ...product.tags,
    ...optionIds.flatMap((id) => optionById(id).tags),
    ...(source.metalId === null ? [] : metalById(source.metalId).tags),
    ...(source.stoneId === null || product.seats.length === 0 ? [] : stoneById(source.stoneId).tags),
    ...finishById(source.finish).tags,
    ...(source.chain === null ? [] : extraById(source.chain).tags),
    ...source.charms.flatMap((charm) =>
      charm.shape === null ? extraById(charm.charmId).tags : optionById(charm.shape).tags,
    ),
  ]);
  return JEWEL_TAGS.filter((tag) => found.has(tag));
}
