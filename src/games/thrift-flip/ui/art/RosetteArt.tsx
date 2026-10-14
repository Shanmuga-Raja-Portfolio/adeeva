import type { RosetteId } from "../../content/rosette";

export interface RosetteArtProps {
  readonly rosette: RosetteId;
  readonly size?: number | undefined;
  readonly title?: string | undefined;
  readonly className?: string | undefined;
}

const TONES: Readonly<
  Record<RosetteId, { readonly outer: string; readonly inner: string; readonly tail: string }>
> = {
  "gold-thread": { outer: "#e9b93c", inner: "#fff1b8", tail: "#c9a227" },
  "silver-thread": { outer: "#b9c2cf", inner: "#f4f6fa", tail: "#8d97a6" },
  "copper-thread": { outer: "#d98a56", inner: "#fbe0cc", tail: "#b0663a" },
  "thank-you-ribbon": { outer: "#8fcfb2", inner: "#fde4cf", tail: "#7b7fd1" },
};

export function RosetteArt({ rosette, size = 96, title, className }: RosetteArtProps) {
  const tone = TONES[rosette];
  const petals = Array.from({ length: 16 }, (_, index) => index);
  return (
    <svg
      className={className}
      viewBox="-60 -60 120 150"
      width={size}
      height={(size * 150) / 120}
      role={title === undefined ? undefined : "img"}
      aria-label={title}
      aria-hidden={title === undefined ? true : undefined}
    >
      <path d="M-18 20 L-34 86 L-20 78 L-10 90 L4 26 Z" fill={tone.tail} />
      <path d="M18 20 L34 86 L20 78 L10 90 L-4 26 Z" fill={tone.tail} opacity={0.85} />
      {petals.map((index) => (
        <ellipse
          key={index}
          cx={0}
          cy={-38}
          rx={11}
          ry={20}
          fill={index % 2 === 0 ? tone.outer : tone.inner}
          stroke={tone.tail}
          strokeWidth={1}
          transform={`rotate(${index * 22.5})`}
        />
      ))}
      <circle r={30} fill={tone.inner} stroke={tone.outer} strokeWidth={5} />
      <circle r={22} fill="none" stroke={tone.tail} strokeWidth={1.6} strokeDasharray="3 3" />
      <path
        d="M0 -12 C 6 -12 10 -6 6 0 C 2 6 0 10 0 12 C 0 10 -2 6 -6 0 C -10 -6 -6 -12 0 -12 Z"
        fill={tone.tail}
        opacity={0.8}
      />
    </svg>
  );
}
