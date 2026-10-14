import type { WoodTag } from "../content/woodTag";
import { extraById, finishById, partOptionById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";

const CUSHION_TAG: WoodTag = "cosy";

export function pieceTags(run: CommissionRun): WoodTag[] {
  const { options, woodId } = run.design;
  const tags: WoodTag[] = [
    ...Object.values(options).flatMap((optionId) =>
      optionId === undefined ? [] : partOptionById(optionId).tags,
    ),
    ...(woodId === null ? [] : woodById(woodId).tags),
    ...(run.finish.finishId === null ? [] : finishById(run.finish.finishId).tags),
    ...run.extras.flatMap((placed) => extraById(placed.extraId).tags),
    ...(run.cushion === null ? [] : [CUSHION_TAG]),
  ];
  return [...new Set(tags)];
}
