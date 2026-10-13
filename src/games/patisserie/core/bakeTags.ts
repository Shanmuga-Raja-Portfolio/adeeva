import type { StyleTag } from "../../../engine/styleTag";
import { designFilling, designMixes } from "./bakeNeeds";
import type { BakeRun } from "./bakeRun";
import { fillingById, productById, toppingById } from "./catalog";

export function bakeTags(run: BakeRun): StyleTag[] {
  const { design } = run;
  if (design.productId === null) return [];
  const filling = run.purpose.kind === "order" ? designFilling(design) : null;
  const all: StyleTag[] = [
    ...productById(design.productId).tags,
    ...designMixes(design).flatMap((mix) => mix.tags),
    ...(filling === null ? [] : fillingById(filling).tags),
    ...run.toppings.flatMap((placed) => toppingById(placed.toppingId).tags),
  ];
  return [...new Set(all)];
}
