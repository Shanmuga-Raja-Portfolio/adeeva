import type { MetalLook } from "./metalLook";

interface ClawProngProps {
  readonly id: string;
  readonly metal: MetalLook;
}

export function ClawProng({ id, metal }: ClawProngProps) {
  return (
    <g>
      <path
        d="M-0.8 -1.5 L0.9 -1.5 L0.7 1.3 Q0.05 2.2 -0.6 1.3 Z"
        fill="#1c1220"
        opacity={0.35}
        transform="translate(0.25 0.3)"
      />
      <path
        d="M-0.95 -1.8 L0.95 -1.8 L0.62 1.1 Q0 2 -0.62 1.1 Z"
        className="jb-claw__prong"
        fill={`url(#${id}-prong)`}
        stroke={metal.line}
        strokeWidth={0.16}
      />
      <path
        d="M-0.42 -1.5 L-0.26 0.9"
        stroke="#ffffff"
        strokeOpacity={0.75}
        strokeWidth={0.18}
        strokeLinecap="round"
      />
    </g>
  );
}
