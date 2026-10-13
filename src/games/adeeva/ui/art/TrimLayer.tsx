import { PlacedLayer } from "../../../../ui/art/PlacedLayer";
import type { PlacedTrim } from "./DressLook";
import { TrimArt } from "./TrimArt";

export interface TrimLayerProps {
  trims: readonly PlacedTrim[];
  selectedId?: string | undefined;
}

export function TrimLayer({ trims, selectedId }: TrimLayerProps) {
  return (
    <PlacedLayer
      items={trims}
      className="ad-trim-layer"
      render={(trim) => (
        <TrimArt
          trimId={trim.trimId}
          x={trim.x}
          y={trim.y}
          rotation={trim.rotation}
          scale={trim.scale}
          selected={trim.id === selectedId}
        />
      )}
    />
  );
}
