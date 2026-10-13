import type { PlacedTrim } from "./DressLook";
import { TrimArt } from "./TrimArt";

export interface TrimLayerProps {
  trims: readonly PlacedTrim[];
  selectedId?: string | undefined;
}

export function TrimLayer({ trims, selectedId }: TrimLayerProps) {
  const ordered = [...trims].sort((a, b) => a.layer - b.layer);
  return (
    <g className="ad-trim-layer">
      {ordered.map((trim) => (
        <TrimArt
          key={trim.id}
          trimId={trim.trimId}
          x={trim.x}
          y={trim.y}
          rotation={trim.rotation}
          scale={trim.scale}
          selected={trim.id === selectedId}
        />
      ))}
    </g>
  );
}
