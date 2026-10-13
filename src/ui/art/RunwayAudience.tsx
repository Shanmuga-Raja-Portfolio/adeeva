import { memo } from "react";
import type { ReactNode } from "react";
import { seededUnit } from "./seedFromText";

export interface RunwayAudienceProps {
  rim: string;
  layer: "back" | "front";
}

function Person({
  x,
  y,
  scale,
  variant,
  rim,
}: {
  x: number;
  y: number;
  scale: number;
  variant: number;
  rim: string;
}) {
  const hair: ReactNode =
    variant === 0 ? (
      <circle cx={7} cy={-52} r={7} />
    ) : variant === 1 ? (
      <path d="M-15 -40 C-17 -58 17 -58 15 -40 L16 -18 L-16 -18 Z" />
    ) : variant === 2 ? (
      <>
        <ellipse cx={0} cy={-47} rx={20} ry={4} />
        <rect x={-10} y={-60} width={20} height={14} rx={4} />
      </>
    ) : variant === 3 ? (
      <path d="M-14 -38 C-20 -62 20 -62 14 -38 Q20 -50 12 -54 Q0 -60 -12 -54 Q-20 -50 -14 -38 Z" />
    ) : null;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`}>
      <g fill="#0d0911">
        {hair}
        <circle cx={0} cy={-38} r={12.5} />
        <path d="M-32 6 C-32 -16 -20 -24 0 -24 C20 -24 32 -16 32 6 Z" />
      </g>
      <path
        d="M-22 -18 C-16 -22 -8 -24 0 -24"
        fill="none"
        stroke={rim}
        strokeOpacity={0.4}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M-9 -46 C-6 -50 -2 -51 2 -51"
        fill="none"
        stroke={rim}
        strokeOpacity={0.5}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
}

export const RunwayAudience = memo(function RunwayAudience({ rim, layer }: RunwayAudienceProps) {
  if (layer === "front") {
    return (
      <g aria-hidden="true" opacity={0.95}>
        <Person x={120} y={940} scale={3.2} variant={1} rim={rim} />
        <Person x={330} y={960} scale={2.8} variant={0} rim={rim} />
        <Person x={1290} y={960} scale={2.8} variant={3} rim={rim} />
        <Person x={1490} y={940} scale={3.2} variant={2} rim={rim} />
      </g>
    );
  }
  const people: ReactNode[] = [];
  for (let row = 0; row < 6; row += 1) {
    const y = 470 + row * 78;
    const scale = 0.55 + row * 0.24;
    const halfWidth = 64 + ((y - 400) / 500) * 346;
    for (const side of [-1, 1]) {
      let offset = halfWidth + 40 * scale;
      let seat = 0;
      while (offset < 820) {
        const index = row * 40 + seat * 2 + (side > 0 ? 1 : 0);
        const jitter = (seededUnit(23, index) - 0.5) * 18 * scale;
        people.push(
          <Person
            key={index}
            x={800 + side * (offset + jitter)}
            y={y + (seededUnit(29, index) - 0.5) * 8}
            scale={scale * (0.92 + seededUnit(31, index) * 0.16)}
            variant={Math.floor(seededUnit(37, index) * 5)}
            rim={rim}
          />,
        );
        offset += 68 * scale;
        seat += 1;
      }
    }
  }
  return (
    <g aria-hidden="true" className="ad-runway-audience">
      {people}
    </g>
  );
});
