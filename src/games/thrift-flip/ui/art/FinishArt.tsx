import { TRIM_EXTENT, TrimArt } from "../../../adeeva/ui/art/TrimArt";
import type { FinishItem, FinishPose } from "../../core";
import { MarkArt } from "./MarkArt";
import { PATCH_SIZE, PatchArt } from "./PatchArt";

export interface FinishArtProps extends FinishPose {
  readonly item: FinishItem;
  readonly selected?: boolean | undefined;
}

export function finishExtent(item: FinishItem): { readonly width: number; readonly height: number } {
  if (item.kind === "trim") return TRIM_EXTENT[item.trimId];
  if (item.kind === "patch") return { width: PATCH_SIZE, height: PATCH_SIZE };
  return item.markId === "mend-cross" ? { width: 44, height: 20 } : { width: 40, height: 34 };
}

export function FinishArt({ item, x, y, rotation, scale, selected = false }: FinishArtProps) {
  if (item.kind === "trim")
    return <TrimArt trimId={item.trimId} x={x} y={y} rotation={rotation} scale={scale} selected={selected} />;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
      {selected ? (
        <circle r={PATCH_SIZE * 0.68} fill="none" stroke="#f08a3c" strokeWidth={2} strokeDasharray="4 3" />
      ) : null}
      {item.kind === "patch" ? (
        <PatchArt patchId={item.patchId} cloth={item.scrap} />
      ) : (
        <MarkArt markId={item.markId} colour={item.colour} />
      )}
    </g>
  );
}
