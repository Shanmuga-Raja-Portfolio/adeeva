import type { FurnitureId } from "../../content/furniture";
import { furnitureById } from "../../core";
import { FurnitureSprite } from "./FurnitureSprite";
import { roomHex } from "./roomHex";

interface FurniturePreviewProps {
  readonly furnitureId: FurnitureId;
  readonly soft: string;
  readonly className?: string | undefined;
}

const UNIT = 26;

export function FurniturePreview({ furnitureId, soft, className }: FurniturePreviewProps) {
  const def = furnitureById(furnitureId);
  const width = def.width * UNIT * 0.92;
  const height = UNIT * 2.5;
  return (
    <svg
      className={className}
      viewBox={`${-Math.max(width, UNIT * 2) / 2 - 6} ${-height} ${Math.max(width, UNIT * 2) + 12} ${height + 6}`}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <FurnitureSprite
        furnitureId={furnitureId}
        x={0}
        y={0}
        width={width}
        unit={UNIT}
        fill={def.colour === "soft" ? soft : roomHex(def.colour)}
        soft={soft}
      />
    </svg>
  );
}
