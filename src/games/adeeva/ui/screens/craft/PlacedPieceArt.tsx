import type { PointerEventHandler } from "react";
import type { FabricDef } from "../../../content/fabric";
import type { PatternPieceDef } from "../../../content/garmentPart";
import { placedPolygon, type Rotation } from "../../../core";
import { PatternPieceShape, type PatternPieceState } from "../../art/PatternPieceShape";
import { artOffset } from "./pieceGeometry";

export interface PlacedPieceArtProps {
  readonly piece: PatternPieceDef;
  readonly fabric: FabricDef | undefined;
  readonly x: number;
  readonly y: number;
  readonly rotation: Rotation;
  readonly state: PatternPieceState;
  readonly showLabel?: boolean | undefined;
  readonly className?: string | undefined;
  readonly onPointerDown?: PointerEventHandler<SVGGElement> | undefined;
  readonly onPointerMove?: PointerEventHandler<SVGGElement> | undefined;
  readonly onPointerUp?: PointerEventHandler<SVGGElement> | undefined;
  readonly onPointerCancel?: PointerEventHandler<SVGGElement> | undefined;
}

export function PlacedPieceArt({
  piece,
  fabric,
  x,
  y,
  rotation,
  state,
  showLabel = true,
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: PlacedPieceArtProps) {
  const offset = artOffset(piece.shape, rotation);
  const outline = placedPolygon(piece.shape, { x, y, rotation });
  return (
    <g
      className={className}
      data-piece-id={piece.id}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <g transform={`translate(${x + offset.x} ${y + offset.y})`}>
        <PatternPieceShape
          piece={piece}
          rotation={rotation}
          fabric={fabric}
          state={state}
          showLabel={showLabel}
        />
      </g>
      <polygon
        className="ad-placed-piece__hit"
        points={outline.map(([px, py]) => `${px},${py}`).join(" ")}
        fill="transparent"
      />
    </g>
  );
}
