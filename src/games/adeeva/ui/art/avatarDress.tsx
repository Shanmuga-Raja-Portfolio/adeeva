import type { AvatarGarment } from "../../../../ui/art/avatar/Avatar";
import { DressBodyLayer, DressFabricDefs, DressSleeveLayer } from "./DressGarment";
import type { DressFabrics, DressParts, PlacedTrim } from "./DressLook";
import { TrimLayer } from "./TrimLayer";

export interface AvatarDress {
  parts: DressParts;
  fabrics: DressFabrics;
  trims?: readonly PlacedTrim[] | undefined;
}

export function dressGarment(dress: AvatarDress): AvatarGarment {
  return {
    defs: (idBase) => <DressFabricDefs idBase={idBase} fabrics={dress.fabrics} />,
    body: (idBase) => <DressBodyLayer idBase={idBase} parts={dress.parts} fabrics={dress.fabrics} />,
    sleeves: (idBase) => (
      <>
        <DressSleeveLayer idBase={idBase} parts={dress.parts} fabrics={dress.fabrics} />
        <TrimLayer trims={dress.trims ?? []} />
      </>
    ),
  };
}
