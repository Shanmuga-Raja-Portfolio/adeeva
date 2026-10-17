import { darken, lighten } from "../../../../../ui/art/colourMix";
import { seededUnit } from "../../../../../ui/art/seedFromText";
import type { FloorId } from "../../../content/floor";

export type PieceFinish = "wood" | "cork" | "carpet" | "stone" | "gloss";

const FINISHES: Readonly<Partial<Record<FloorId, PieceFinish>>> = {
  "cork-tiles": "cork",
  "cloud-carpet": "carpet",
  "meadow-carpet": "carpet",
  checkerboard: "gloss",
  "blue-check": "gloss",
};

export function pieceFinish(floorId: FloorId | null, boards: boolean): PieceFinish {
  if (boards) return "wood";
  return (floorId === null ? undefined : FINISHES[floorId]) ?? "stone";
}

interface FloorPieceArtProps {
  readonly width: number;
  readonly height: number;
  readonly fill: string;
  readonly finish: PieceFinish;
  readonly seed?: number | undefined;
}

const INK = "#3b2a33";

function Grain({ width, height, fill, seed }: { width: number; height: number; fill: string; seed: number }) {
  const lines = Math.max(3, Math.round(height / 4));
  const knot = seededUnit(seed, 9);
  return (
    <g fill="none" strokeLinecap="round">
      {Array.from({ length: lines }, (_, index) => {
        const y = ((index + 0.6) / lines) * height;
        const wave = (seededUnit(seed, index) - 0.5) * 2.2;
        return (
          <path
            key={index}
            d={`M1.2 ${y} C${width * 0.3} ${y + wave} ${width * 0.6} ${y - wave} ${width - 1.2} ${y + wave * 0.4}`}
            stroke={index % 2 === 0 ? darken(fill, 0.2) : lighten(fill, 0.22)}
            strokeWidth={0.45}
            strokeOpacity={0.8}
          />
        );
      })}
      <ellipse
        cx={width * (0.2 + knot * 0.6)}
        cy={height * (0.3 + seededUnit(seed, 10) * 0.4)}
        rx={Math.min(3, width * 0.08)}
        ry={Math.min(1.2, height * 0.08)}
        stroke={darken(fill, 0.32)}
        strokeWidth={0.45}
      />
    </g>
  );
}

function Speckles({
  width,
  height,
  fill,
  seed,
  soft,
}: {
  width: number;
  height: number;
  fill: string;
  seed: number;
  soft: boolean;
}) {
  const count = Math.round((width * height) / (soft ? 10 : 14));
  return (
    <g>
      {Array.from({ length: count }, (_, index) => (
        <circle
          key={index}
          cx={1.2 + seededUnit(seed, index * 2) * (width - 2.4)}
          cy={1.2 + seededUnit(seed, index * 2 + 1) * (height - 2.4)}
          r={soft ? 0.5 : 0.25 + seededUnit(seed, index + 50) * 0.45}
          fill={index % 3 === 0 ? lighten(fill, soft ? 0.25 : 0.3) : darken(fill, soft ? 0.1 : 0.28)}
          opacity={soft ? 0.6 : 0.85}
        />
      ))}
    </g>
  );
}

export function FloorPieceArt({ width, height, fill, finish, seed = 1 }: FloorPieceArtProps) {
  const radius = finish === "carpet" ? 2 : 1.2;
  return (
    <g>
      <rect width={width} height={height} rx={radius} fill={fill} />
      {finish === "wood" ? <Grain width={width} height={height} fill={fill} seed={seed} /> : null}
      {finish === "cork" || finish === "carpet" ? (
        <Speckles width={width} height={height} fill={fill} seed={seed} soft={finish === "carpet"} />
      ) : null}
      {finish === "stone" ? (
        <path
          d={`M${width * 0.1} ${height * 0.75} Q${width * 0.4} ${height * 0.55} ${width * 0.55} ${height * 0.7} T${width * 0.92} ${height * 0.35}`}
          fill="none"
          stroke={lighten(fill, 0.35)}
          strokeWidth={0.5}
          opacity={0.8}
        />
      ) : null}
      {finish === "gloss" || finish === "stone" ? (
        <path
          d={`M1.4 ${height * 0.45} L${width * 0.45} 1.4 L${width * 0.7} 1.4 L1.4 ${height * 0.7} Z`}
          fill="#ffffff"
          opacity={0.18}
        />
      ) : null}
      <rect width={width} height={Math.min(2.4, height * 0.16)} rx={radius} fill="#ffffff" opacity={0.2} />
      <rect
        y={height - Math.min(2.4, height * 0.16)}
        width={width}
        height={Math.min(2.4, height * 0.16)}
        rx={radius}
        fill="#1c1220"
        opacity={0.16}
      />
      <path
        d={`M0.7 ${height - radius} L0.7 ${radius}`}
        stroke="#ffffff"
        strokeOpacity={0.35}
        strokeWidth={0.6}
        strokeLinecap="round"
      />
      <path
        d={`M${radius} 0.6 L${width - radius} 0.6`}
        stroke="#ffffff"
        strokeOpacity={0.45}
        strokeWidth={0.7}
        strokeLinecap="round"
      />
      <path
        d={`M${radius} ${height - 0.6} L${width - radius} ${height - 0.6}`}
        stroke={darken(fill, 0.35)}
        strokeOpacity={0.6}
        strokeWidth={0.7}
        strokeLinecap="round"
      />
      <rect width={width} height={height} rx={radius} fill="none" stroke={INK} strokeWidth={0.5} />
    </g>
  );
}
