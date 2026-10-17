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

const SMALL_TRIM = 24;

export function FinishArt({ item, x, y, rotation, scale, selected = false }: FinishArtProps) {
  if (item.kind === "trim") {
    const extent = TRIM_EXTENT[item.trimId];
    const small = Math.max(extent.width, extent.height) < SMALL_TRIM;
    return (
      <g>
        {small ? (
          <g transform={`translate(${x} ${y}) scale(${scale})`}>
            <circle r={Math.max(extent.width, extent.height) * 0.78} fill="#fffaf0" opacity={0.7} />
            <circle
              r={Math.max(extent.width, extent.height) * 0.78}
              fill="none"
              stroke="#3b2a1c"
              strokeOpacity={0.35}
              strokeWidth={1.4}
            />
          </g>
        ) : null}
        <TrimArt trimId={item.trimId} x={x} y={y} rotation={rotation} scale={scale} selected={selected} />
      </g>
    );
  }
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
