import type { WoodTag } from "../content/woodTag";
import { extraById, finishById, partOptionById, productById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { runPieces } from "./pieceParts";

const CUSHION_TAG: WoodTag = "cosy";

type TaggedRun = Pick<CommissionRun, "design" | "purpose" | "finish" | "extras" | "cushion">;

export function pieceTags(run: TaggedRun, piece: number | null = null): WoodTag[] {
  const { options, woodId } = run.design;
  const product =
    piece === null ? null : (runPieces(run).find((entry) => entry.index === piece)?.productId ?? null);
  const slots = product === null ? null : productById(product).slots;
  const optionTags = Object.entries(options).flatMap(([slot, optionId]) =>
    optionId === undefined || (slots !== null && !slots.some((entry) => entry === slot))
      ? []
      : partOptionById(optionId).tags,
  );
  const extras = piece === null ? run.extras : run.extras.filter((placed) => placed.piece === piece);
  const cushioned = run.cushion !== null && (product === null || productById(product).seat);
  const tags: WoodTag[] = [
    ...optionTags,
    ...(woodId === null ? [] : woodById(woodId).tags),
    ...(run.finish.finishId === null ? [] : finishById(run.finish.finishId).tags),
    ...extras.flatMap((placed) => extraById(placed.extraId).tags),
    ...(cushioned ? [CUSHION_TAG] : []),
  ];
  return [...new Set(tags)];
}
