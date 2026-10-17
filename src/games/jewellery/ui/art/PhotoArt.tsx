import type { PlacedPose } from "../../../../engine/placedPose";
import type { BackdropId } from "../../content/lookbookBackdrop";
import type { PropId } from "../../content/lookbookProp";
import { PIECE_BOX, type PieceSource } from "../../core";
import { BackdropArt } from "./BackdropArt";
import { PiecePreview } from "./PiecePreview";
import { PropArt } from "./PropArt";

export interface PhotoProp extends PlacedPose {
  readonly propId: PropId;
}

interface PhotoArtProps {
  readonly backdrop: BackdropId;
  readonly props: readonly PhotoProp[];
  readonly piece: PieceSource;
  readonly light: number;
  readonly lampAngle?: number | null | undefined;
  readonly twinkle?: boolean | undefined;
}

export function propTransform(prop: PlacedPose): string {
  return `translate(${prop.x} ${prop.y}) rotate(${prop.rotation}) scale(${prop.scale})`;
}

function Sparkle({
  x,
  y,
  size,
  opacity,
}: {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly opacity: number;
}) {
  const w = size * 0.2;
  return (
    <path
      d={`M${x} ${y - size} Q${x + w} ${y - w} ${x + size} ${y} Q${x + w} ${y + w} ${x} ${y + size} Q${x - w} ${y + w} ${x - size} ${y} Q${x - w} ${y - w} ${x} ${y - size} Z`}
      fill="#ffffff"
      opacity={opacity}
    />
  );
}

export function PhotoArt({
  backdrop,
  props,
  piece,
  light,
  lampAngle = null,
  twinkle = false,
}: PhotoArtProps) {
  const cx = PIECE_BOX.x + PIECE_BOX.width / 2;
  const cy = PIECE_BOX.y + PIECE_BOX.height / 2;
  const angle = lampAngle === null ? null : ((lampAngle - 90) * Math.PI) / 180;
  return (
    <g>
      <BackdropArt backdrop={backdrop} />
      {angle !== null ? (
        <path
          d={`M${cx + Math.cos(angle) * 170} ${cy + Math.sin(angle) * 170} L${cx + Math.cos(angle + 1.57) * 60} ${cy + Math.sin(angle + 1.57) * 60} L${cx + Math.cos(angle - 1.57) * 60} ${cy + Math.sin(angle - 1.57) * 60} Z`}
          fill="#fff6d8"
          opacity={0.12 + 0.25 * light}
        />
      ) : null}
      {[...props]
        .sort((a, b) => a.layer - b.layer)
        .map((prop, index) => (
          <g key={`${prop.propId}-${index}`} transform={propTransform(prop)}>
            <PropArt propId={prop.propId} />
          </g>
        ))}
      <svg x={PIECE_BOX.x} y={PIECE_BOX.y} width={PIECE_BOX.width} height={PIECE_BOX.height}>
        <PiecePreview source={piece} title={null} velvet={false} twinkle={twinkle} />
      </svg>
      <circle cx={cx} cy={cy - 6} r={20 + 46 * light} fill="#fff6d8" opacity={0.08 + 0.3 * light} />
      <Sparkle x={cx + 26} y={cy - 30} size={4 + 16 * light} opacity={0.25 + 0.75 * light} />
      <Sparkle x={cx - 30} y={cy + 12} size={2 + 9 * light} opacity={0.2 + 0.7 * light} />
    </g>
  );
}
