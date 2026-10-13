import type { PartCategory } from "../../../content/garmentPart";
import type { DressFabrics, DressParts } from "../../art/DressLook";
import { DressPreview } from "../../art/DressPreview";

export interface DressThumbProps {
  readonly parts: DressParts;
  readonly fabrics: DressFabrics;
  readonly focus: PartCategory;
  readonly skinTone?: string | undefined;
}

const FOCUS_WINDOW: Readonly<Record<PartCategory, { top: number; height: number }>> = {
  neckline: { top: 90, height: 190 },
  bodice: { top: 120, height: 230 },
  sleeves: { top: 120, height: 260 },
  skirt: { top: 240, height: 420 },
};

export function DressThumb({ parts, fabrics, focus, skinTone }: DressThumbProps) {
  const frame = FOCUS_WINDOW[focus];
  const scale = 100 / frame.height;
  return (
    <span className="ad-dress-thumb" aria-hidden="true">
      <span
        className="ad-dress-thumb__inner"
        style={{
          width: `${400 * scale}%`,
          left: `${50 - 200 * scale}%`,
          top: `${-frame.top * scale}%`,
        }}
      >
        <DressPreview parts={parts} fabrics={fabrics} skinTone={skinTone} title="" />
      </span>
    </span>
  );
}
