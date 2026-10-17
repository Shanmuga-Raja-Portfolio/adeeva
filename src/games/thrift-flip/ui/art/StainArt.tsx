import { seedFromText, seededUnit } from "../../../../ui/art/seedFromText";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { stainGrid, type Stain } from "../../core";

export interface StainArtProps {
  readonly stain: Stain;
  readonly seed: string;
  readonly cleanShares: readonly number[];
  readonly scrubbing: boolean;
  readonly reducedMotion: boolean;
}

function blob(stain: Stain, seed: number): string {
  const points = 9;
  const corners = Array.from({ length: points }, (_, index) => {
    const angle = (index / points) * Math.PI * 2;
    const wobble = 0.74 + seededUnit(seed, index) * 0.26;
    return [
      stain.cx + Math.cos(angle) * stain.radius * wobble,
      stain.cy + Math.sin(angle) * stain.radius * wobble,
    ];
  });
  const mid = (a: number[] | undefined, b: number[] | undefined) => [
    ((a?.[0] ?? 0) + (b?.[0] ?? 0)) / 2,
    ((a?.[1] ?? 0) + (b?.[1] ?? 0)) / 2,
  ];
  const start = mid(corners[points - 1], corners[0]);
  const curves = corners.map((corner, index) => {
    const end = mid(corner, corners[(index + 1) % points]);
    return `Q${corner[0]?.toFixed(2)} ${corner[1]?.toFixed(2)} ${end[0]?.toFixed(2)} ${end[1]?.toFixed(2)}`;
  });
  return `M${start[0]?.toFixed(2)} ${start[1]?.toFixed(2)} ${curves.join(" ")} Z`;
}

export function StainArt({ stain, seed, cleanShares, scrubbing, reducedMotion }: StainArtProps) {
  const id = useSvgId("stain");
  const numeric = seedFromText(seed);
  const shape = blob(stain, numeric);
  const { rows, cols } = stainGrid(stain.cells);
  const size = stain.radius * 2;
  const cellWidth = size / cols;
  const cellHeight = size / rows;
  const left = stain.cx - stain.radius;
  const top = stain.cy - stain.radius;
  return (
    <g className="tf-stain" data-stain={stain.id}>
      <defs>
        <radialGradient id={`${id}-tea`} cx="0.45" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#b98450" stopOpacity={0.42} />
          <stop offset="0.7" stopColor="#9a6634" stopOpacity={0.62} />
          <stop offset="0.92" stopColor="#7a4a22" stopOpacity={0.85} />
          <stop offset="1" stopColor="#6b4423" stopOpacity={0.55} />
        </radialGradient>
        <radialGradient id={`${id}-suds`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="0.8" stopColor="#d6f1ff" stopOpacity={0.55} />
          <stop offset="1" stopColor="#f6d6f0" stopOpacity={0.9} />
        </radialGradient>
        <radialGradient id={`${id}-soft`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <mask
          id={`${id}-mask`}
          maskUnits="userSpaceOnUse"
          x={left - stain.radius}
          y={top - stain.radius}
          width={size + stain.radius * 2}
          height={size + stain.radius * 2}
        >
          {cleanShares.map((share, index) => (
            <circle
              key={index}
              className="tf-stain__cell"
              cx={left + ((index % cols) + 0.5) * cellWidth}
              cy={top + (Math.floor(index / cols) + 0.5) * cellHeight}
              r={Math.max(cellWidth, cellHeight) * 1.05}
              fill={`url(#${id}-soft)`}
              style={{ opacity: 1 - share }}
            />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <path d={shape} fill={`url(#${id}-tea)`} />
        {Array.from({ length: 5 }, (_, index) => {
          const angle = seededUnit(numeric, index + 300) * Math.PI * 2;
          const reach = stain.radius * seededUnit(numeric, index + 320) * 0.5;
          const r = stain.radius * (0.16 + seededUnit(numeric, index + 340) * 0.16);
          return (
            <ellipse
              key={`pool-${index}`}
              cx={stain.cx + Math.cos(angle) * reach}
              cy={stain.cy + Math.sin(angle) * reach}
              rx={r}
              ry={r * 0.72}
              fill="#5c3517"
              opacity={0.22}
            />
          );
        })}
        <path d={shape} fill="none" stroke="#5c3517" strokeWidth={0.9} opacity={0.6} />
        <path
          d={shape}
          fill="none"
          stroke="#8a5a2b"
          strokeWidth={1.4}
          opacity={0.18}
          transform={`translate(0.4 0.5)`}
        />
        {Array.from({ length: 5 }, (_, index) => {
          const angle = seededUnit(numeric, index + 200) * Math.PI * 2;
          const reach = stain.radius * (1.02 + seededUnit(numeric, index + 220) * 0.18);
          return (
            <circle
              key={index}
              cx={stain.cx + Math.cos(angle) * reach}
              cy={stain.cy + Math.sin(angle) * reach}
              r={0.25 + seededUnit(numeric, index + 240) * 0.45}
              fill="#7a4e26"
              opacity={0.6}
            />
          );
        })}
      </g>
      {cleanShares.every((share) => share >= 1) ? (
        <g className={reducedMotion ? "tf-sparkle" : "tf-sparkle tf-sparkle--pop"}>
          <path
            d={`M${stain.cx} ${stain.cy - 4} l1.2 2.8 l2.8 1.2 l-2.8 1.2 l-1.2 2.8 l-1.2 -2.8 l-2.8 -1.2 l2.8 -1.2 Z`}
            fill="#fffbe6"
            stroke="#f6d36b"
            strokeWidth={0.4}
          />
        </g>
      ) : null}
      {scrubbing && !reducedMotion
        ? Array.from({ length: 7 }, (_, index) => (
            <circle
              key={index}
              className="tf-bubble"
              cx={stain.cx + (seededUnit(numeric, index + 40) - 0.5) * stain.radius * 1.6}
              cy={stain.cy + (seededUnit(numeric, index + 80) - 0.5) * stain.radius * 1.4}
              r={0.8 + seededUnit(numeric, index + 120) * 1.6}
              fill={`url(#${id}-suds)`}
              style={{ animationDelay: `${index * 90}ms` }}
            />
          ))
        : null}
    </g>
  );
}
