import type { ExtraId, ExtraNeed } from "../content/extra";
import { productById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { runPieces } from "./pieceParts";

export interface ExtraTally {
  readonly extra: ExtraId;
  readonly needed: number;
  readonly placed: number;
  readonly piece: number | null;
}

type ExtrasRun = Pick<CommissionRun, "design" | "purpose" | "brief" | "extras">;

function mergedNeeds(needs: readonly ExtraNeed[]): ExtraNeed[] {
  const merged = new Map<ExtraId, number>();
  for (const need of needs) merged.set(need.extra, Math.max(merged.get(need.extra) ?? 0, need.count));
  return [...merged].map(([extra, count]) => ({ extra, count }));
}

export function requiredExtras(run: ExtrasRun): ExtraNeed[] {
  const product = run.design.productId === null ? [] : productById(run.design.productId).extras;
  return mergedNeeds([...run.brief.requiredExtras, ...product]);
}

function setTallies(run: ExtrasRun): ExtraTally[] {
  const brief = mergedNeeds(run.brief.requiredExtras).map((need) => ({
    extra: need.extra,
    needed: need.count,
    placed: run.extras.filter((placed) => placed.extraId === need.extra).length,
    piece: null,
  }));
  const pieces = runPieces(run).flatMap((piece) =>
    productById(piece.productId).extras.map((need) => ({
      extra: need.extra,
      needed: need.count,
      placed: run.extras.filter((placed) => placed.extraId === need.extra && placed.piece === piece.index)
        .length,
      piece: piece.index,
    })),
  );
  return [...brief, ...pieces];
}

export function extraTallies(run: ExtrasRun): ExtraTally[] {
  if (run.purpose.kind === "set") return setTallies(run);
  return requiredExtras(run).map((need) => ({
    extra: need.extra,
    needed: need.count,
    placed: run.extras.filter((placed) => placed.extraId === need.extra).length,
    piece: null,
  }));
}

export function productNeedIds(run: ExtrasRun, piece: number): readonly ExtraId[] {
  const found = runPieces(run).find((entry) => entry.index === piece);
  return found === undefined ? [] : productById(found.productId).extras.map((need) => need.extra);
}
