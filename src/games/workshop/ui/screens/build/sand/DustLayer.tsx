import { seededUnit } from "../../../../../../ui/art/seedFromText";
import { MAX_PASSES, SAND_CANVAS, SAND_COLUMNS, SAND_ROWS } from "../../../../core";

interface DustLayerProps {
  readonly id: string;
  readonly passes: readonly number[];
  readonly seed: number;
}

const CELL_W = SAND_CANVAS.width / SAND_COLUMNS;
const CELL_H = SAND_CANVAS.height / SAND_ROWS;
const SPECKS = 16;
const BLEED = 4;
const SPECK_COLOURS = ["#c9b28b", "#fbf5e8", "#b59c74", "#efe2c8"];
const SPARKLE = "M0 -5 Q0.9 -0.9 5 0 Q0.9 0.9 0 5 Q-0.9 0.9 -5 0 Q-0.9 -0.9 0 -5 Z";

function left(passes: number): number {
  return Math.max(0, (MAX_PASSES - passes) / MAX_PASSES);
}

export function DustLayer({ id, passes, seed }: DustLayerProps) {
  return (
    <g pointerEvents="none">
      <defs>
        <filter id={`${id}-soft`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={2.6} />
        </filter>
        <clipPath id={`${id}-board`}>
          <rect width={SAND_CANVAS.width} height={SAND_CANVAS.height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-board)`}>
        <g filter={`url(#${id}-soft)`}>
          {passes.map((count, cell) => (
            <rect
              key={cell}
              x={(cell % SAND_COLUMNS) * CELL_W - BLEED}
              y={Math.floor(cell / SAND_COLUMNS) * CELL_H - BLEED}
              width={CELL_W + BLEED * 2}
              height={CELL_H + BLEED * 2}
              rx={8}
              fill="#ece1ca"
              opacity={left(count) * 0.88}
              className="ww-sand-bench__dust"
            />
          ))}
        </g>
        {passes.map((count, cell) => {
          const share = left(count);
          if (share === 0) return null;
          const x0 = (cell % SAND_COLUMNS) * CELL_W;
          const y0 = Math.floor(cell / SAND_COLUMNS) * CELL_H;
          return (
            <g key={`specks-${cell}`} opacity={share} className="ww-sand-bench__dust">
              {Array.from({ length: SPECKS }, (_, index) => (
                <circle
                  key={index}
                  cx={x0 - 2 + seededUnit(seed + cell * 31, index) * (CELL_W + 4)}
                  cy={y0 - 2 + seededUnit(seed + cell * 31, index + 50) * (CELL_H + 4)}
                  r={0.4 + seededUnit(seed + cell * 31, index + 100) * 1.3}
                  fill={SPECK_COLOURS[index % SPECK_COLOURS.length]}
                />
              ))}
            </g>
          );
        })}
        {passes.map((count, cell) => {
          if (count < MAX_PASSES) return null;
          const x0 = (cell % SAND_COLUMNS) * CELL_W;
          const y0 = Math.floor(cell / SAND_COLUMNS) * CELL_H;
          const sx = x0 + 8 + seededUnit(seed + cell, 7) * (CELL_W - 16);
          const sy = y0 + 8 + seededUnit(seed + cell, 9) * (CELL_H - 16);
          if (seededUnit(seed + cell, 13) < 0.45) return null;
          return (
            <path
              key={`silk-${cell}`}
              d={SPARKLE}
              transform={`translate(${sx.toFixed(1)} ${sy.toFixed(1)}) scale(${(0.55 + seededUnit(seed + cell, 11) * 0.4).toFixed(2)})`}
              fill="#fffdf2"
              className="ww-sand-bench__sparkle"
            />
          );
        })}
      </g>
    </g>
  );
}
