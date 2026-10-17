import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface GarmentRackProps {
  readonly x: number;
  readonly y: number;
}

interface Hanging {
  readonly dx: number;
  readonly colour: string;
  readonly d: string;
}

const HANGING: readonly Hanging[] = [
  {
    dx: 40,
    colour: "#9fd0ee",
    d: "M-22 20 L-30 34 C-30 60 -24 90 -20 104 L20 104 C24 90 30 60 30 34 L22 20 C10 28 -10 28 -22 20 Z",
  },
  {
    dx: 110,
    colour: "#e98aa6",
    d: "M-20 20 L-26 34 C-24 52 -18 64 -16 74 C-34 120 -46 150 -52 176 C-18 186 18 186 52 176 C46 150 34 120 16 74 C18 64 24 52 26 34 L20 20 C8 28 -8 28 -20 20 Z",
  },
  {
    dx: 190,
    colour: "#f3d36b",
    d: "M-24 20 L-34 30 L-44 64 L-32 68 L-26 52 C-26 80 -24 110 -22 128 L22 128 C24 110 26 80 26 52 L32 68 L44 64 L34 30 L24 20 C12 30 -12 30 -24 20 Z",
  },
  {
    dx: 262,
    colour: "#b9a7dc",
    d: "M-18 20 L-24 34 C-24 50 -20 60 -18 66 C-30 104 -36 134 -38 160 C-12 168 12 168 38 160 C36 134 30 104 18 66 C20 60 24 50 24 34 L18 20 C8 26 -8 26 -18 20 Z",
  },
];

export function GarmentRack({ x, y }: GarmentRackProps) {
  const id = useSvgId("rack");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`${id}-pole`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8e8a98" />
          <stop offset="0.4" stopColor="#f4f2f7" />
          <stop offset="1" stopColor="#77737f" />
        </linearGradient>
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#1c1220" stopOpacity={0.22} />
        </linearGradient>
      </defs>
      <ellipse cx={150} cy={286} rx={170} ry={12} fill="#2b2230" opacity={0.1} />
      <rect x={-6} y={0} width={8} height={280} rx={3} fill={`url(#${id}-pole)`} />
      <rect x={298} y={0} width={8} height={280} rx={3} fill={`url(#${id}-pole)`} />
      <rect x={-10} y={-4} width={320} height={9} rx={4} fill={`url(#${id}-pole)`} />
      <path d="M-24 282 L22 282 M278 282 L324 282" stroke="#77737f" strokeWidth={6} strokeLinecap="round" />
      {HANGING.map((item) => (
        <g key={item.dx} transform={`translate(${item.dx} 0)`}>
          <path d="M0 -2 C-6 2 -6 8 0 10 L-22 22 L22 22 Z" fill="none" stroke="#8a6a4a" strokeWidth={2.4} />
          <path d={item.d} fill={item.colour} stroke={darken(item.colour, 0.3)} strokeWidth={1.4} />
          <path d={item.d} fill={`url(#${id}-fold)`} />
          <path
            d="M-6 40 C-8 70 -10 100 -12 130 M8 40 C10 70 12 100 14 128"
            stroke={darken(item.colour, 0.25)}
            strokeWidth={1.4}
            fill="none"
            opacity={0.4}
          />
          <path
            d="M-14 30 C-6 34 6 34 14 30"
            stroke={lighten(item.colour, 0.5)}
            strokeWidth={2}
            fill="none"
            opacity={0.8}
          />
        </g>
      ))}
    </g>
  );
}
