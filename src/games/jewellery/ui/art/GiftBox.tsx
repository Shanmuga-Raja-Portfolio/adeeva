import { useSvgId } from "../../../../ui/art/useSvgId";

export interface GiftBoxProps {
  readonly open: boolean;
  readonly ribbon?: string | undefined;
}

export function GiftBox({ open, ribbon = "#e8a33d" }: GiftBoxProps) {
  const id = useSvgId("jb-gift");
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-box`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f6d7b" />
          <stop offset="1" stopColor="#133540" />
        </linearGradient>
        <radialGradient id={`${id}-velvet`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#6a3d6e" />
          <stop offset="1" stopColor="#2f1832" />
        </radialGradient>
      </defs>
      <ellipse cx={120} cy={226} rx={104} ry={10} fill="#000" opacity={0.25} />
      {open ? (
        <g transform="translate(120 70) rotate(-12) translate(-120 -70)">
          <rect
            x={28}
            y={18}
            width={184}
            height={40}
            rx={8}
            fill={`url(#${id}-box)`}
            stroke="#0c1f25"
            strokeWidth={2}
          />
          <rect x={110} y={18} width={20} height={40} fill={ribbon} />
        </g>
      ) : null}
      <rect
        x={20}
        y={110}
        width={200}
        height={110}
        rx={10}
        fill={`url(#${id}-box)`}
        stroke="#0c1f25"
        strokeWidth={2}
      />
      <rect x={32} y={110} width={176} height={40} rx={6} fill={`url(#${id}-velvet)`} />
      <rect x={110} y={150} width={20} height={70} fill={ribbon} />
      <path d="M20 180 L220 180" stroke={ribbon} strokeWidth={12} />
      {!open ? (
        <g>
          <rect
            x={14}
            y={96}
            width={212}
            height={36}
            rx={8}
            fill={`url(#${id}-box)`}
            stroke="#0c1f25"
            strokeWidth={2}
          />
          <rect x={110} y={96} width={20} height={36} fill={ribbon} />
          <path
            d="M120 96 C96 70 82 94 120 96 C158 94 144 70 120 96 Z"
            fill={ribbon}
            stroke="#b8741c"
            strokeWidth={1.5}
          />
        </g>
      ) : null}
    </g>
  );
}
