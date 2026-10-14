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

function RunningMend() {
  return (
    <g className="tf-mark" strokeLinecap="round">
      {[-12, 0, 12].map((y) => (
        <path key={y} d={`M-18 ${y} h7 m4 0 h7 m4 0 h7`} stroke="#3f5d84" strokeWidth={2.6} />
      ))}
    </g>
  );
}

function WovenDarn() {
  return (
    <g className="tf-mark" strokeLinecap="round">
      <rect x={-15} y={-13} width={30} height={26} rx={6} fill="#2b2230" opacity={0.12} />
      {[-10, -5, 0, 5, 10].map((x) => (
        <path key={`v${x}`} d={`M${x} -12 V12`} stroke="#3f8f6e" strokeWidth={2.2} />
      ))}
      {[-8, -3, 2, 7].map((y, index) => (
        <path
          key={`h${y}`}
          d={`M-13 ${y} H13`}
          stroke="#f6d36b"
          strokeWidth={2.2}
          strokeDasharray={index % 2 === 0 ? "5 5" : "0 5 5 0"}
        />
      ))}
    </g>
  );
}

function LeafStamp({ base }: { readonly base: string }) {
  return (
    <g className="tf-mark">
      {[
        [-9, -4, -30],
        [8, 6, 25],
        [-2, 10, 0],
      ].map(([x, y, angle]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <path d="M0 -11 C 8 -6 8 6 0 11 C -8 6 -8 -6 0 -11 Z" fill={base} opacity={0.88} />
          <path d="M0 -9 V9" stroke={lighten(base, 0.6)} strokeWidth={1} />
        </g>
      ))}
    </g>
  );
}

export function MarkArt({ markId, colour }: MarkArtProps) {
  if (markId === "mend-running") return <RunningMend />;
  if (markId === "mend-darn") return <WovenDarn />;
  if (markId === "stamp-leaf")
    return <LeafStamp base={colour === null ? "#3f8f6e" : colourById(colour).hex} />;
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
