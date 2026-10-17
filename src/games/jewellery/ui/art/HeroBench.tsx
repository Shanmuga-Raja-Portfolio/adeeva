import { useSvgId } from "../../../../ui/art/useSvgId";

interface HeroBenchProps {
  readonly className?: string | undefined;
}

const BEADS = ["#e8763d", "#3fa9a6", "#f6d27a", "#d0587e", "#b9a7dc", "#ffffff", "#1f4e5a"] as const;

export function HeroBench({ className }: HeroBenchProps) {
  const id = useSvgId("jb-hero-bench");
  return (
    <svg className={className} viewBox="0 -70 300 176" overflow="visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8733f" />
          <stop offset="1" stopColor="#5e3a1f" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c08a55" />
          <stop offset="0.6" stopColor="#d9a46a" />
          <stop offset="1" stopColor="#a8733f" />
        </linearGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff0b8" stopOpacity={0.85} />
          <stop offset="1" stopColor="#fff0b8" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c8" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff3c8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <ellipse cx={150} cy={102} rx={150} ry={7} fill="#1c1018" opacity={0.45} />
      <path d="M222 -34 L182 34 L118 34 Z" fill={`url(#${id}-beam)`} />
      <rect
        x={10}
        y={40}
        width={280}
        height={62}
        rx={6}
        fill={`url(#${id}-wood)`}
        stroke="#3e2716"
        strokeWidth={2}
      />
      {[0, 1].map((drawer) => (
        <g key={drawer}>
          <rect
            x={26 + drawer * 134}
            y={58}
            width={114}
            height={30}
            rx={4}
            fill="#8a5d3e"
            stroke="#3e2716"
            strokeWidth={1.5}
          />
          <path
            d={`M${30 + drawer * 134} 61 L${136 + drawer * 134} 61`}
            stroke="#c99a6e"
            strokeOpacity={0.6}
          />
          <circle cx={83 + drawer * 134} cy={73} r={4.5} fill="#e8c27a" stroke="#7a5212" strokeWidth={1.2} />
        </g>
      ))}
      <path d="M0 26 L300 26 L292 42 L8 42 Z" fill={`url(#${id}-top)`} stroke="#3e2716" strokeWidth={2} />
      <path d="M6 28 L294 28" stroke="#ffe2a6" strokeOpacity={0.7} strokeWidth={1.5} />
      <ellipse cx={150} cy={32} rx={70} ry={9} fill={`url(#${id}-pool)`} />
      <path d="M126 32 L142 46 L158 46 L174 32 Z" fill="#c99a6e" stroke="#3e2716" strokeWidth={1.5} />
      <path d="M148 32 L150 40 L152 32" fill="#3e2716" />
      <rect x={40} y={18} width={62} height={12} rx={4} fill="#1f4e5a" stroke="#133540" strokeWidth={1.5} />
      {BEADS.map((colour, index) => (
        <g key={colour}>
          <circle cx={48 + index * 8} cy={24} r={3.4} fill={colour} />
          <circle cx={47 + index * 8} cy={22.8} r={1} fill="#ffffff" opacity={0.85} />
        </g>
      ))}
      <path d="M196 30 L250 22 L250 30 Z" fill="#c7ccd4" stroke="#535a66" strokeWidth={1.2} />
      <path d="M200 28 L246 23" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={1} />
      <g transform="translate(150 6)">
        <path d="M-14 22 L14 22 L8 16 L-8 16 Z" fill="#4b2a4f" />
        <path d="M0 16 L0 -6" stroke="#c9a227" strokeWidth={2} />
        <path d="M-10 -12 Q0 2 10 -12" fill="none" stroke="#e8c27a" strokeWidth={1.4} />
        <circle cy={-2} r={6} fill="#d9b23c" stroke="#664e08" strokeWidth={1.2} />
        <circle cy={-2} r={2.6} fill="#c0392b" />
        <path d="M8 -16 L9.5 -11.5 L14 -10 L9.5 -8.5 L8 -4 L6.5 -8.5 L2 -10 L6.5 -11.5 Z" fill="#ffffff" />
      </g>
      <path
        d="M268 26 L268 18 L262 -30 L236 -50"
        fill="none"
        stroke="#2f2a33"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M268 26 L268 18 L262 -30 L236 -50"
        fill="none"
        stroke="#6a6470"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <rect x={256} y={20} width={26} height={8} rx={3} fill="#2f2a33" />
      <path d="M214 -62 L250 -40 L240 -26 L206 -48 Z" fill="#1f4e5a" stroke="#133540" strokeWidth={2} />
      <ellipse cx={223} cy={-37} rx={18} ry={5} transform="rotate(32 223 -37)" fill="#fff3c8" />
    </svg>
  );
}
