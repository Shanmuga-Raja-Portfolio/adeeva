import { seededUnit } from "../../../../ui/art/seedFromText";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface CelebrationBurstProps {
  readonly className?: string | undefined;
}

const RAYS = Array.from({ length: 16 }, (_, index) => index);
const COLOURS = ["#f08a3c", "#7b7fd1", "#f6d36b", "#e57a8f", "#8fcfb2", "#5fb0d6"];
const SEED = 5821;

interface Bit {
  readonly x: number;
  readonly y: number;
  readonly turn: number;
  readonly colour: string;
  readonly shape: "strip" | "dot" | "curl";
  readonly size: number;
  readonly delay: number;
  readonly depth: "far" | "mid" | "near";
}

const BITS: readonly Bit[] = Array.from({ length: 34 }, (_, index) => {
  const ring = 0.55 + seededUnit(SEED, index * 5) * 0.45;
  const angle = seededUnit(SEED, index * 5 + 1) * Math.PI * 2;
  const pick = seededUnit(SEED, index * 5 + 2);
  const layer = seededUnit(SEED, index * 7 + 11);
  const depth = layer < 0.3 ? "far" : layer > 0.86 ? "near" : "mid";
  const scale = depth === "far" ? 0.62 : depth === "near" ? 1.5 : 1;
  return {
    x: 200 + Math.cos(angle) * 190 * ring,
    y: 200 + Math.sin(angle) * 190 * ring,
    turn: Math.round(seededUnit(SEED, index * 5 + 3) * 180 - 90),
    colour: COLOURS[index % COLOURS.length] ?? "#f08a3c",
    shape: pick < 0.5 ? "strip" : pick < 0.78 ? "dot" : "curl",
    size: (0.7 + seededUnit(SEED, index * 5 + 4) * 0.7) * scale,
    delay: (index % 7) * 0.35,
    depth,
  };
});

const SPARKS: readonly (readonly [number, number, number])[] = [
  [70, 120, 1.1],
  [330, 140, 1.3],
  [60, 290, 0.8],
  [345, 310, 1],
  [200, 52, 0.9],
  [120, 360, 0.7],
];

function BitShape({ bit }: { readonly bit: Bit }) {
  if (bit.shape === "dot")
    return (
      <g>
        <circle r={5} fill={bit.colour} />
        <circle cx={-1.6} cy={-1.6} r={1.8} fill="#ffffff" opacity={0.55} />
      </g>
    );
  if (bit.shape === "curl")
    return (
      <path
        d="M-10 0 q5 -8 10 0 t10 0"
        fill="none"
        stroke={bit.colour}
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  return (
    <g>
      <path d="M-5 -9 L5 -7 L5 9 L-5 7 Z" fill={bit.colour} />
      <path d="M-5 -9 L0 -8 L0 8 L-5 7 Z" fill="#ffffff" opacity={0.3} />
    </g>
  );
}

export function CelebrationBurst({ className }: CelebrationBurstProps) {
  const id = useSvgId("burst");
  return (
    <svg
      className={className ? `tf-burst-art ${className}` : "tf-burst-art"}
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fffbe6" stopOpacity={1} />
          <stop offset="0.45" stopColor="#fff3c4" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fff3c4" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-far`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={1.4} />
        </filter>
        <filter id={`${id}-near`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={2.2} />
        </filter>
        <linearGradient id={`${id}-trail`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.7} />
        </linearGradient>
      </defs>
      <g className="tf-burst-art__rays">
        {RAYS.map((index) => (
          <path
            key={index}
            d="M200 200 L188 -60 L212 -60 Z"
            fill={index % 2 === 0 ? "#ffffff" : "#c9f0dc"}
            opacity={0.55}
            transform={`rotate(${index * 22.5} 200 200)`}
          />
        ))}
      </g>
      <circle cx={200} cy={210} r={170} fill={`url(#${id}-glow)`} />
      {BITS.map((bit, index) => (
        <g
          key={index}
          transform={`translate(${bit.x.toFixed(1)} ${bit.y.toFixed(1)})`}
          filter={bit.depth === "mid" ? undefined : `url(#${id}-${bit.depth})`}
          opacity={bit.depth === "far" ? 0.6 : bit.depth === "near" ? 0.85 : 1}
        >
          <g className="tf-burst-art__bit" style={{ animationDelay: `${bit.delay}s` }}>
            <rect
              x={-2}
              y={-34 * bit.size}
              width={4}
              height={26 * bit.size}
              rx={2}
              fill={`url(#${id}-trail)`}
            />
            <g transform={`rotate(${bit.turn}) scale(${bit.size.toFixed(2)})`}>
              <BitShape bit={bit} />
            </g>
          </g>
        </g>
      ))}
      {SPARKS.map(([x, y, scale]) => (
        <path
          key={`${x}-${y}`}
          className="tf-burst-art__spark"
          transform={`translate(${x} ${y}) scale(${scale})`}
          d="M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z"
          fill="#fffbe6"
          stroke="#f6d36b"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
