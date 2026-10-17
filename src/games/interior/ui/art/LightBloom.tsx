import type { Point } from "../../../../engine/geometry/point";

export interface BloomSpot {
  readonly point: Point;
  readonly warm: boolean;
  readonly wall: boolean;
  readonly strength: number;
}

const TONES = {
  warm: { core: "#fff6d6", mid: "#ffd98a", edge: "#f7b955" },
  cool: { core: "#f4fbff", mid: "#c9e9ff", edge: "#9fd3f5" },
} as const;

export function BloomDefs({ id }: { readonly id: string }) {
  return (
    <>
      {(["warm", "cool"] as const).map((tone) => (
        <g key={tone}>
          <radialGradient id={`${id}-bloom-${tone}`}>
            <stop offset="0" stopColor={TONES[tone].mid} stopOpacity={0.5} />
            <stop offset="0.3" stopColor={TONES[tone].mid} stopOpacity={0.26} />
            <stop offset="0.65" stopColor={TONES[tone].edge} stopOpacity={0.08} />
            <stop offset="1" stopColor={TONES[tone].edge} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`${id}-bulb-${tone}`}>
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset="0.4" stopColor={TONES[tone].core} stopOpacity={0.75} />
            <stop offset="1" stopColor={TONES[tone].mid} stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`${id}-wash-${tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={TONES[tone].mid} stopOpacity={0.05} />
            <stop offset="0.3" stopColor={TONES[tone].mid} stopOpacity={0.32} />
            <stop offset="1" stopColor={TONES[tone].edge} stopOpacity={0} />
          </linearGradient>
        </g>
      ))}
    </>
  );
}

export function LightBloom({
  spots,
  unit,
  id,
}: {
  readonly spots: readonly BloomSpot[];
  readonly unit: number;
  readonly id: string;
}) {
  return (
    <g pointerEvents="none">
      {spots.map((spot, index) => {
        const tone = spot.warm ? "warm" : "cool";
        const [x, y] = spot.point;
        const halo = unit * (1.1 + spot.strength * 0.45);
        return (
          <g key={index}>
            {spot.wall ? (
              <path
                d={`M${x - unit * 0.16} ${y - unit * 0.7} L${x + unit * 0.16} ${y - unit * 0.7} L${x + unit * 0.62} ${y + unit * 1.15} L${x - unit * 0.62} ${y + unit * 1.15} Z`}
                fill={`url(#${id}-wash-${tone})`}
              />
            ) : null}
            <ellipse cx={x} cy={y} rx={halo} ry={halo * 0.88} fill={`url(#${id}-bloom-${tone})`} />
            <circle cx={x} cy={y} r={unit * 0.2} fill={`url(#${id}-bulb-${tone})`} />
          </g>
        );
      })}
    </g>
  );
}
