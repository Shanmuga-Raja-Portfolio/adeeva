import { useSvgId } from "../../../../ui/art/useSvgId";

interface JoiningLampProps {
  readonly warmth: number;
  readonly over: boolean;
  readonly flicker: boolean;
}

export function JoiningLamp({ warmth, over, flicker }: JoiningLampProps) {
  const id = useSvgId("jb-lamp");
  const glow = over ? "#f0782e" : "#ffd27a";
  return (
    <g aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.2" r="0.8">
          <stop offset="0" stopColor={glow} stopOpacity={0.15 + warmth * 0.8} />
          <stop offset="0.55" stopColor={glow} stopOpacity={warmth * 0.35} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b4f12" />
          <stop offset="0.35" stopColor="#f8e39a" />
          <stop offset="0.7" stopColor="#b88a2a" />
          <stop offset="1" stopColor="#6b4f12" />
        </linearGradient>
      </defs>
      <path d="M150 0 L150 34" stroke="#3e2716" strokeWidth={4} />
      <path
        d={`M60 230 L240 230 L190 70 L110 70 Z`}
        fill={`url(#${id}-glow)`}
        className={flicker ? "jb-lamp-glow" : undefined}
      />
      <path d="M104 74 Q150 26 196 74 Z" fill={`url(#${id}-brass)`} stroke="#553620" strokeWidth={2} />
      <rect x={136} y={30} width={28} height={12} rx={4} fill="#553620" />
      <ellipse
        cx={150}
        cy={74}
        rx={46}
        ry={7}
        fill={over ? "#ffb27a" : "#fff2c8"}
        opacity={0.4 + warmth * 0.6}
      />
      <ellipse cx={150} cy={74} rx={46} ry={7} fill="none" stroke="#553620" strokeWidth={2} />
    </g>
  );
}
