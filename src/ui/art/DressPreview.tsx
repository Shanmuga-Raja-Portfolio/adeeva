import type { ReactNode } from "react";
import type { GarmentSlot } from "../../content/garmentSlot";
import { CroquisArms, CroquisBody, DEFAULT_SKIN, DOLL_VIEWBOX } from "./Croquis";
import { DressBodyLayer, DressFabricDefs, DressSleeveLayer } from "./DressGarment";
import type { DressFabrics, DressParts, PlacedTrim } from "./DressLook";
import { SlotHighlight } from "./SlotHighlight";
import { TrimLayer } from "./TrimLayer";
import { useSvgId } from "./useSvgId";

export interface DressPreviewProps {
  parts: DressParts;
  fabrics: DressFabrics;
  trims?: readonly PlacedTrim[] | undefined;
  skinTone?: string | undefined;
  highlightSlot?: GarmentSlot | undefined;
  selectedTrimId?: string | undefined;
  title?: string | undefined;
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
  className,
  children,
}: DressPreviewProps) {
  const idBase = useSvgId("dress");
  return (
    <svg className={className} viewBox={DOLL_VIEWBOX} role="img" aria-label={title}>
      <DressFabricDefs idBase={idBase} fabrics={fabrics} />
      <CroquisBody skinTone={skinTone} />
      <DressBodyLayer idBase={idBase} parts={parts} fabrics={fabrics} />
      <CroquisArms skinTone={skinTone} />
      <DressSleeveLayer idBase={idBase} parts={parts} fabrics={fabrics} />
      <TrimLayer trims={trims} selectedId={selectedTrimId} />
      {highlightSlot ? <SlotHighlight slot={highlightSlot} /> : null}
      {children}
    </svg>
  );
}
