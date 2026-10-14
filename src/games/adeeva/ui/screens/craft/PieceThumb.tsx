import type { PieceOutline } from "../../../content/garmentPart";
import type { Cloth } from "../../../../../ui/art/cloth/Cloth";
import { polygonBounds } from "../../../../../engine/geometry/polygonPlacement";
import type { Rotation } from "../../../../../engine/geometry/rotation";
import { PatternPieceShape } from "../../art/PatternPieceShape";

export interface PieceThumbProps {
  readonly piece: PieceOutline;
  readonly fabric: Cloth | undefined;
  readonly rotation?: Rotation | undefined;
  readonly size?: number | undefined;
  readonly cut?: boolean | undefined;
}

export function PieceThumb({ piece, fabric, rotation = 0, size = 56, cut = false }: PieceThumbProps) {
  const bounds = polygonBounds(piece.shape);
  const span = Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 1.06;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return (
    <svg
      className="ad-piece-thumb"
      width={size}
      height={size}
      viewBox={`${cx - span / 2} ${cy - span / 2} ${span} ${span}`}
      aria-hidden="true"
    >
      <PatternPieceShape
        piece={piece}
        fabric={fabric}
        rotation={rotation}
        state={cut ? "cut" : "idle"}
        showLabel={false}
      />
    </svg>
  );
}
