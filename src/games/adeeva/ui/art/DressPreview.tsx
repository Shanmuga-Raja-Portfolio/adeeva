import type { ReactNode } from "react";
import type { GarmentSlot } from "../../content/garmentSlot";
import { PosedArms, type AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import { CroquisArms, CroquisBody, DEFAULT_SKIN, DOLL_VIEWBOX } from "../../../../ui/art/avatar/Croquis";
import { DressBodyLayer, DressFabricDefs, DressSleeveLayer } from "./DressGarment";
import type { DressFabrics, DressParts, PlacedTrim } from "./DressLook";
import { SlotHighlight } from "./SlotHighlight";
import { TrimLayer } from "./TrimLayer";
import { useSvgId } from "../../../../ui/art/useSvgId";

const FORM_LINEN = "#eadcc8";

export interface DressPreviewProps {
  parts: DressParts;
  fabrics: DressFabrics;
  trims?: readonly PlacedTrim[] | undefined;
  skinTone?: string | undefined;
  highlightSlot?: GarmentSlot | undefined;
  selectedTrimId?: string | undefined;
  title?: string | undefined;
  pose?: AvatarPose | undefined;
  figure?: "croquis" | "form" | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

export function DressPreview({
  parts,
  fabrics,
  trims = [],
  skinTone = DEFAULT_SKIN,
  highlightSlot,
  selectedTrimId,
  title = "Dress preview on the croquis",
  pose = "rest",
  figure = "croquis",
  className,
  children,
}: DressPreviewProps) {
  const idBase = useSvgId("dress");
  return (
    <svg className={className} viewBox={DOLL_VIEWBOX} role="img" aria-label={title}>
      <DressFabricDefs idBase={idBase} fabrics={fabrics} />
      {figure === "form" ? (
        <g>
          <CroquisBody skinTone={FORM_LINEN} head="none" baseLayer={false} shoes="flats" />
          <path d="M186 104 Q200 98 214 104 L213 116 Q200 121 187 116 Z" fill="#a07c58" />
          <ellipse cx={200} cy={104} rx={14} ry={4} fill="#c49a70" />
        </g>
      ) : (
        <CroquisBody skinTone={skinTone} shoes="flats" />
      )}
      <DressBodyLayer idBase={idBase} parts={parts} fabrics={fabrics} />
      {figure === "form" ? (
        <DressSleeveLayer idBase={idBase} parts={parts} fabrics={fabrics} />
      ) : (
        <PosedArms pose={pose}>
          <CroquisArms skinTone={skinTone} />
          <DressSleeveLayer idBase={idBase} parts={parts} fabrics={fabrics} />
        </PosedArms>
      )}
      <TrimLayer trims={trims} selectedId={selectedTrimId} />
      {highlightSlot ? <SlotHighlight slot={highlightSlot} /> : null}
      {children}
    </svg>
  );
}
