import type { FabricDef } from "../../../content/fabric";
import type { PartCategory } from "../../../content/garmentPart";
import type { DressFabrics, DressParts } from "../../art/DressLook";
import { DressPreview } from "../../art/DressPreview";

export interface DressThumbProps {
  readonly parts: DressParts;
  readonly fabrics: DressFabrics;
  readonly focus: PartCategory;
}

const FOCUS_WINDOW: Readonly<Record<PartCategory, { top: number; height: number }>> = {
  neckline: { top: 104, height: 150 },
  bodice: { top: 128, height: 230 },
  sleeves: { top: 124, height: 280 },
  skirt: { top: 250, height: 420 },
};

const FOCUS_FABRICS: Readonly<Record<PartCategory, readonly PartCategory[]>> = {
  neckline: ["neckline", "bodice"],
  bodice: ["bodice"],
  sleeves: ["sleeves"],
  skirt: ["skirt"],
};

function plain(fabric: FabricDef | undefined): FabricDef | undefined {
  return fabric === undefined ? undefined : { ...fabric, print: "solid" };
}

function focusFabrics(fabrics: DressFabrics, focus: PartCategory): DressFabrics {
  const shown = FOCUS_FABRICS[focus];
  return {
    bodice: shown.includes("bodice") ? plain(fabrics.bodice) : undefined,
    neckline: shown.includes("neckline") ? plain(fabrics.neckline) : undefined,
    sleeves: shown.includes("sleeves") ? plain(fabrics.sleeves) : undefined,
    skirt: shown.includes("skirt") ? plain(fabrics.skirt) : undefined,
  };
}

export function DressThumb({ parts, fabrics, focus }: DressThumbProps) {
  const frame = FOCUS_WINDOW[focus];
  const scale = 100 / frame.height;
  return (
    <span className="ad-dress-thumb" aria-hidden="true">
      <span className="ad-dress-thumb__frame">
        <span
          className="ad-dress-thumb__inner"
          style={{
            width: `${400 * scale}%`,
            left: `${50 - 200 * scale}%`,
            top: `${-frame.top * scale}%`,
          }}
        >
          <DressPreview parts={parts} fabrics={focusFabrics(fabrics, focus)} figure="form" title="" />
        </span>
      </span>
    </span>
  );
}
