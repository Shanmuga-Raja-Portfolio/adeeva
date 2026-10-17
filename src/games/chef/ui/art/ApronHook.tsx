import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

export function ApronHook({ colour }: { readonly colour: string }) {
  const id = useSvgId("ck-apron");
  const cloth = `${id}-cloth`;
  return (
    <svg viewBox="0 0 80 100" className="ck-apron-hook" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={cloth} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={darken(colour, 0.22)} />
          <stop offset="0.35" stopColor={lighten(colour, 0.12)} />
          <stop offset="0.7" stopColor={colour} />
          <stop offset="1" stopColor={darken(colour, 0.28)} />
        </linearGradient>
      </defs>
      <ellipse cx={42} cy={94} rx={24} ry={4} fill="#3a2a1a" opacity={0.18} />
      <rect x={12} y={3} width={56} height={12} rx={4} fill="#8a5a2e" />
      <rect x={12} y={3} width={56} height={4} rx={2} fill="#b07a44" />
      <circle cx={40} cy={9} r={3.2} fill="#f2c46b" stroke="#8a5a14" strokeWidth={1} />
      <path
        d="M40 12 V22 Q40 28 34 28"
        stroke="#8f9ba1"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M30 24 Q40 34 50 24" stroke="#f4efe4" strokeWidth={3} fill="none" />
      <path
        d="M30 26 H50 L52 40 Q62 42 64 50 L60 88 Q40 94 20 88 L16 50 Q18 42 28 40 Z"
        fill={`url(#${cloth})`}
        stroke="#1c1220"
        strokeOpacity={0.3}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M16 52 Q8 60 10 72 M64 52 Q72 60 70 72"
        stroke={darken(colour, 0.2)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <rect x={27} y={58} width={26} height={17} rx={3} fill="#ffffff" opacity={0.28} />
      <rect
        x={27}
        y={58}
        width={26}
        height={17}
        rx={3}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.2}
        strokeDasharray="2 2"
        opacity={0.7}
      />
      <path d="M22 50 Q40 56 58 50" stroke="#ffffff" strokeWidth={2} opacity={0.45} fill="none" />
      <path d="M33 30 V86" stroke="#ffffff" strokeWidth={1.2} opacity={0.18} />
    </svg>
  );
}
