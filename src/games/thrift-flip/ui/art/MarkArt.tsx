import { colourById, type ColourId } from "../../../../engine/palette";
import { darken, lighten } from "../../../../ui/art/colourMix";
import type { MarkId } from "../../content/finish";

export interface MarkArtProps {
  readonly markId: MarkId;
  readonly colour: ColourId | null;
}

const DOTS: readonly (readonly [number, number, number])[] = [
  [-12, -6, 5],
  [2, -10, 4],
  [13, -2, 5.5],
  [-4, 4, 6],
  [10, 11, 4],
  [-14, 10, 3.5],
  [3, 15, 3],
];

export function MarkArt({ markId, colour }: MarkArtProps) {
  if (markId === "mend-cross") {
    return (
      <g className="tf-mark" strokeLinecap="round">
        {[-14, 0, 14].map((x) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <path
              d="M-5 -7 L5 7 M5 -7 L-5 7"
              stroke="#2b2230"
              strokeOpacity={0.25}
              strokeWidth={3.4}
              transform="translate(0.8 1.2)"
            />
            <path d="M-5 -7 L5 7 M5 -7 L-5 7" stroke="#e8553a" strokeWidth={2.6} />
            <path d="M-5 -7 L5 7" stroke="#ffb59d" strokeWidth={0.8} />
          </g>
        ))}
      </g>
    );
  }
  const base = colour === null ? "#f08a3c" : colourById(colour).hex;
  return (
    <g className="tf-mark">
      {DOTS.map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x + 0.6} cy={y + 1} r={r} fill={darken(base, 0.45)} opacity={0.25} />
          <circle cx={x} cy={y} r={r} fill={base} stroke={darken(base, 0.25)} strokeWidth={0.6} />
          <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.32} fill={lighten(base, 0.7)} opacity={0.8} />
        </g>
      ))}
    </g>
  );
}
