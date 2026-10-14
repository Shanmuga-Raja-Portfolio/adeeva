import type { ExtraId, ExtraNeed } from "../content/extra";
import { productById } from "./catalog";
import type { CommissionRun } from "./commissionRun";

interface ExtraTally {
  readonly extra: ExtraId;
  readonly needed: number;
  readonly placed: number;
}

export function requiredExtras(run: CommissionRun): ExtraNeed[] {
  const product = run.design.productId === null ? [] : productById(run.design.productId).extras;
  const needs = new Map<ExtraId, number>();
  for (const need of [...run.brief.requiredExtras, ...product])
    needs.set(need.extra, Math.max(needs.get(need.extra) ?? 0, need.count));
  return [...needs].map(([extra, count]) => ({ extra, count }));
}

export function extraTallies(run: CommissionRun): ExtraTally[] {
  return requiredExtras(run).map((need) => ({
    extra: need.extra,
    needed: need.count,
    placed: run.extras.filter((placed) => placed.extraId === need.extra).length,
  }));
}
