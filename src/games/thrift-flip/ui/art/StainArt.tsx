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
        {Array.from({ length: stain.cells }, (_, index) => (
          <clipPath key={index} id={`${id}-${index}`}>
            <rect
              x={left + (index % cols) * cellWidth}
              y={top + Math.floor(index / cols) * cellHeight}
              width={cellWidth}
              height={cellHeight}
            />
          </clipPath>
        ))}
      </defs>
      {cleanShares.map((share, index) => (
        <g
          key={index}
          clipPath={`url(#${id}-${index})`}
          className="tf-stain__cell"
          style={{ opacity: 1 - share }}
        >
          <path d={shape} fill="#8a6136" opacity={0.5} />
          <path
            d={shape}
            fill="none"
            stroke="#6b4423"
            strokeWidth={0.6}
            opacity={0.4}
            transform={`translate(0.3 0.4)`}
          />
        </g>
      ))}
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
              style={{ animationDelay: `${index * 90}ms` }}
            />
          ))
        : null}
    </g>
  );
}
