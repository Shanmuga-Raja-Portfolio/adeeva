import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

function Hand({ skin }: { readonly skin: string }) {
  const edge = darken(skin, 0.32);
  return (
    <g>
      <path d="M-17 -40 L17 -40 L15 0 L-15 0 Z" fill="#f7f4ee" stroke="#c9c2b4" strokeWidth={1.5} />
      <path d="M-15 -6 H15" stroke="#d9d2c4" strokeWidth={3} />
      <path
        d="M-15 2 Q-18 18 -14 34 Q0 41 14 34 Q18 18 15 2 Q0 -3 -15 2 Z"
        fill={skin}
        stroke={edge}
        strokeWidth={1.5}
      />
      <path
        d="M-13 12 Q0 16 13 12 M-13 21 Q0 25 13 21 M-12 29 Q0 33 12 29"
        stroke={edge}
        strokeWidth={1.3}
        fill="none"
        opacity={0.55}
        strokeLinecap="round"
      />
      <path d="M-14 4 Q-25 4 -24 14 Q-22 22 -12 20" fill={skin} stroke={edge} strokeWidth={1.5} />
      <path d="M-8 4 Q0 2 8 4" stroke={lighten(skin, 0.35)} strokeWidth={2} opacity={0.6} fill="none" />
    </g>
  );
}

export function ChefKnife({ hand, moving }: { readonly hand: string; readonly moving: boolean }) {
  const id = useSvgId("ck-knife");
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef2f4" />
          <stop offset="0.45" stopColor="#c3ccd0" />
          <stop offset="0.62" stopColor="#dfe5e8" />
          <stop offset="1" stopColor="#9aa6ac" />
        </linearGradient>
        <linearGradient id={`${id}-bolster`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d8a91" />
          <stop offset="0.4" stopColor="#eef3f4" />
          <stop offset="1" stopColor="#6d7a81" />
        </linearGradient>
        <linearGradient id={`${id}-bevel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d2d6" />
          <stop offset="1" stopColor="#f7fafb" />
        </linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a2416" />
          <stop offset="0.45" stopColor="#7a4a2a" />
          <stop offset="1" stopColor="#2e1c10" />
        </linearGradient>
      </defs>
      <ellipse cx={4} cy={142} rx={54} ry={7} fill="#3b2410" opacity={0.28} />
      <rect x={-10} y={-6} width={20} height={50} rx={8} fill={`url(#${id}-wood)`} />
      <path d="M-6 -2 V40" stroke="#ffffff" strokeWidth={2} opacity={0.18} strokeLinecap="round" />
      {[6, 20, 34].map((y) => (
        <circle key={y} cx={0} cy={y} r={2.8} fill="#e8ecee" stroke="#5f6c73" strokeWidth={0.8} />
      ))}
      <path
        d="M-13 42 H13 L15 52 H-15 Z"
        fill={`url(#${id}-bolster)`}
        stroke="#4f5b61"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path
        d="M-48 52 H44 Q48 52 48 56 V110 Q48 126 30 128 L-40 128 Q-50 126 -50 116 V56 Q-50 52 -48 52 Z"
        fill={`url(#${id}-steel)`}
        stroke="#4f5b61"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M-49 56 H47 V61 H-49 Z" fill="#5f6c73" opacity={0.5} />
      <path
        d="M-49 108 Q0 112 47 104 Q47 125 30 127 L-40 127 Q-49 125 -49 116 Z"
        fill={`url(#${id}-bevel)`}
        opacity={0.95}
      />
      <path
        d="M-48 120 Q-46 127 -38 127 L30 127 Q44 125 47 112"
        stroke="#ffffff"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M-34 62 L-20 62 L-44 104 L-49 104 L-49 88 Z" fill="#ffffff" opacity={0.5} />
      <path d="M-12 62 L-6 62 L-30 104 L-36 104 Z" fill="#ffffff" opacity={0.3} />
      <circle cx={34} cy={70} r={6.5} fill="#2e3a40" opacity={0.75} />
      <path d="M28.5 68 A6 6 0 0 1 38 65" stroke="#ffffff" strokeWidth={1.4} fill="none" opacity={0.7} />
      <Hand skin={hand} />
      {moving ? (
        <path
          d="M-60 62 q-7 22 0 44 M58 62 q7 22 0 44 M-70 74 q-4 12 0 22 M68 74 q4 12 0 22"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.55}
        />
      ) : null}
    </g>
  );
}
