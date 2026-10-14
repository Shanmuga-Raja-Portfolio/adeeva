import type { ExtraId } from "../../content/extra";

const OUTLINE = "#2f2622";

interface ExtraArtProps {
  readonly extraId: ExtraId;
  readonly woodHex: string;
  readonly plaque: string;
}

function Brass({ r }: { r: number }) {
  return (
    <g>
      <circle r={r} fill="#d9a92b" stroke={OUTLINE} strokeWidth={2} />
      <circle r={r * 0.55} cx={-r * 0.25} cy={-r * 0.25} fill="#f7dc7a" />
      <circle r={r * 0.18} cx={-r * 0.35} cy={-r * 0.4} fill="#fff6d0" />
    </g>
  );
}

export function ExtraArt({ extraId, woodHex, plaque }: ExtraArtProps) {
  switch (extraId) {
    case "brass-knob":
      return <Brass r={10} />;
    case "wood-knob":
      return (
        <g>
          <circle r={10} fill={woodHex} stroke={OUTLINE} strokeWidth={2} />
          <path d="M-6 -2 Q0 -6 6 -2 M-6 3 Q0 0 6 3" stroke={OUTLINE} strokeOpacity={0.35} fill="none" />
        </g>
      );
    case "leather-pull":
      return (
        <g>
          <path d="M-14 -6 Q0 18 14 -6" fill="none" stroke="#7a4a2a" strokeWidth={6} strokeLinecap="round" />
          <path
            d="M-14 -6 Q0 18 14 -6"
            fill="none"
            stroke={OUTLINE}
            strokeWidth={1.5}
            strokeDasharray="2 3"
          />
          <circle cx={-14} cy={-6} r={4} fill="#d9a92b" stroke={OUTLINE} strokeWidth={1.5} />
          <circle cx={14} cy={-6} r={4} fill="#d9a92b" stroke={OUTLINE} strokeWidth={1.5} />
        </g>
      );
    case "coat-hook":
      return (
        <g>
          <rect
            x={-5}
            y={-14}
            width={10}
            height={8}
            rx={2}
            fill="#3a3a40"
            stroke={OUTLINE}
            strokeWidth={1.5}
          />
          <path d="M0 -6 V6 Q0 14 8 12" fill="none" stroke="#3a3a40" strokeWidth={5} strokeLinecap="round" />
          <path
            d="M0 -6 V6 Q0 14 8 12"
            fill="none"
            stroke="#8a8a96"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </g>
      );
    case "brass-hinge":
      return (
        <g>
          <rect
            x={-14}
            y={-8}
            width={28}
            height={16}
            rx={2}
            fill="#d9a92b"
            stroke={OUTLINE}
            strokeWidth={2}
          />
          <line x1={0} y1={-8} x2={0} y2={8} stroke={OUTLINE} strokeWidth={2} />
          <circle cx={-7} cy={0} r={2} fill={OUTLINE} />
          <circle cx={7} cy={0} r={2} fill={OUTLINE} />
        </g>
      );
    case "name-plaque":
      return (
        <g>
          <rect
            x={-30}
            y={-11}
            width={60}
            height={22}
            rx={5}
            fill="#f4ecd8"
            stroke={OUTLINE}
            strokeWidth={2}
          />
          <text
            y={4}
            textAnchor="middle"
            fontSize={plaque.length > 8 ? 9 : 11}
            fontWeight={700}
            fontFamily='"Rockwell", "Roboto Slab", Georgia, serif'
            fill="#4a6378"
          >
            {plaque}
          </text>
        </g>
      );
    case "star-stencil":
      return (
        <path
          d="M0 -13 L3.8 -4 L13 -4 L5.6 2 L8.4 11.5 L0 6 L-8.4 11.5 L-5.6 2 L-13 -4 L-3.8 -4 Z"
          fill="#f2c230"
          stroke={OUTLINE}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      );
    case "leaf-carving":
      return (
        <g>
          <path d="M-14 6 Q-6 -14 14 -10 Q10 8 -14 6 Z" fill="none" stroke={OUTLINE} strokeWidth={2.4} />
          <path d="M-12 5 Q0 -2 12 -9" fill="none" stroke={OUTLINE} strokeWidth={1.4} />
        </g>
      );
  }
}
