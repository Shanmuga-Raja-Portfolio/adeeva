import { darken, lighten } from "../../../../ui/art/colourMix";

export interface ShopCatProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly coat: string;
}

export function ShopCat({ x, y, scale, coat }: ShopCatProps) {
  const shade = darken(coat, 0.22);
  const light = lighten(coat, 0.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={66} ry={11} fill="#2a1b10" opacity={0.3} />
      <path d="M-50 -2 Q-62 -40 -14 -46 Q40 -50 52 -14 Q56 2 36 4 L-40 4 Q-52 4 -50 -2 Z" fill={coat} />
      <path d="M0 -46 Q40 -50 52 -14 Q56 2 36 4 L10 4 Q30 -20 0 -46 Z" fill={shade} opacity={0.55} />
      <path
        d="M-30 -40 Q-10 -48 10 -46"
        fill="none"
        stroke={light}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.7}
      />
      <path
        d="M-6 -44 Q-2 -30 -10 -20 M12 -44 Q16 -30 8 -18 M28 -38 Q30 -26 24 -14"
        fill="none"
        stroke={shade}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M44 -6 Q70 -4 64 -24 Q58 -38 46 -30"
        fill="none"
        stroke={coat}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <path d="M58 -32 Q52 -36 46 -30" fill="none" stroke={shade} strokeWidth={11} strokeLinecap="round" />
      <ellipse cx={-42} cy={-14} rx={24} ry={20} fill={coat} />
      <path d="M-60 -26 L-58 -48 L-44 -32 Z M-36 -32 L-26 -48 L-24 -24 Z" fill={coat} />
      <path d="M-57 -30 L-56 -42 L-48 -33 Z M-33 -32 L-27 -42 L-27 -28 Z" fill="#f2a7b4" />
      <path
        d="M-52 -14 Q-48 -10 -44 -14 M-38 -14 Q-34 -10 -30 -14"
        fill="none"
        stroke="#3b2a1c"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path d="M-43 -6 l-2 2 l2 1 l2 -1 Z" fill="#e57a8f" />
      <path
        d="M-60 -4 H-74 M-60 -1 L-72 3 M-26 -4 H-12 M-26 -1 L-14 3"
        stroke="#fff8ec"
        strokeWidth={1.2}
        opacity={0.8}
      />
      <path
        d="M-52 -26 Q-46 -32 -38 -30"
        fill="none"
        stroke={light}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.7}
      />
      <path d="M-30 4 Q-20 -6 -8 4 Z" fill={light} opacity={0.8} />
    </g>
  );
}
