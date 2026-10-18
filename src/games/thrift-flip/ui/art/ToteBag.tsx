import { darken, lighten } from "../../../../ui/art/colourMix";

export interface ToteBagProps {
  readonly x: number;
  readonly y: number;
  readonly colour: string;
  readonly flip: boolean;
}

export function ToteBag({ x, y, colour, flip }: ToteBagProps) {
  const deep = darken(colour, 0.22);
  const light = lighten(colour, 0.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} pointerEvents="none">
      <path d="M-14 4 C-16 -16 10 -18 12 4" fill="none" stroke={deep} strokeWidth={5} strokeLinecap="round" />
      <path
        d="M-30 2 L28 2 L36 86 C36 92 32 96 26 96 L-28 96 C-34 96 -38 92 -38 86 Z"
        fill={colour}
        stroke={deep}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <path d="M-30 2 L28 2 L29 12 L-31 12 Z" fill={deep} opacity={0.35} />
      <path d="M8 14 L14 92 L26 92 C30 92 33 89 33 85 L27 14 Z" fill={deep} opacity={0.22} />
      <path d="M-26 18 L-30 84" stroke={light} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
      <circle cx={-2} cy={50} r={12} fill={light} opacity={0.7} />
      <path d="M-8 50 L-2 56 L8 44" fill="none" stroke={deep} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}
