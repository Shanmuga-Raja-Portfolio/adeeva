import { seededUnit } from "./seedFromText";

export interface PetalFallProps {
  t: number;
  colours: readonly string[];
  width?: number | undefined;
  height?: number | undefined;
}

const PETALS = 34;
const SEED = 613;
const SIDE_MARGIN = 120;

export function PetalFall({ t, colours, width = 1600, height = 940 }: PetalFallProps) {
  const fallScale = height / 940;
  return (
    <g className="ad-show__petals">
      {Array.from({ length: PETALS }, (_, index) => {
        const delay = seededUnit(SEED, index * 5) * 0.45;
        const local = t - delay;
        if (local <= 0) return null;
        const speed = 0.8 + seededUnit(SEED, index * 5 + 1) * 0.7;
        const x =
          SIDE_MARGIN +
          seededUnit(SEED, index * 5 + 2) * (width - 2 * SIDE_MARGIN) +
          Math.sin(local * 9 + index) * 30;
        const y = -40 + local * 1000 * speed * fallScale;
        if (y > height) return null;
        const turn = local * 540 * (seededUnit(SEED, index * 5 + 3) - 0.5);
        const size = 9 + seededUnit(SEED, index * 5 + 4) * 9;
        const colour = colours[index % Math.max(1, colours.length)] ?? "#f2c4c9";
        return (
          <ellipse
            key={index}
            cx={0}
            cy={0}
            rx={size}
            ry={size * 0.55}
            fill={colour}
            opacity={0.88}
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(1)}) scale(1 ${(0.5 + 0.5 * Math.abs(Math.cos(local * 7 + index))).toFixed(3)})`}
          />
        );
      })}
    </g>
  );
}
