import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import type { AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import type { AvatarMood } from "../../../../ui/art/avatar/AvatarFace";
import { DOLL_VIEWBOX } from "../../../../ui/art/avatar/Croquis";

interface DesignerAvatarProps {
  readonly look: AvatarLook;
  readonly title: string;
  readonly mood?: AvatarMood | undefined;
  readonly pose?: AvatarPose | undefined;
  readonly className?: string | undefined;
}

const STURDY = "translate(200 0) scale(1.18 1) translate(-200 0)";

const FLECKS = [
  { x: 178, y: 262, r: 5, c: "#c8664a" },
  { x: 214, y: 290, r: 4, c: "#3c6aa8" },
  { x: 190, y: 338, r: 6, c: "#f6d77a" },
  { x: 222, y: 372, r: 4, c: "#7d8a4a" },
  { x: 172, y: 404, r: 5, c: "#b9a7dc" },
] as const;

export function DesignerAvatar({ look, title, mood = "happy", pose, className }: DesignerAvatarProps) {
  return (
    <svg className={className} viewBox={DOLL_VIEWBOX} role="img" aria-label={title}>
      <g transform={STURDY}>
        <AvatarFigure look={look} mood={mood} pose={pose} />
        <g aria-hidden="true">
          <path
            d="M166 228 Q200 220 234 228 L244 468 Q200 482 156 468 Z"
            fill="#f4ecd8"
            stroke="#6b5a4a"
            strokeWidth={2}
            opacity={0.96}
          />
          <path d="M180 300 L220 300 L218 334 L182 334 Z" fill="#e9c7b8" stroke="#6b5a4a" strokeWidth={1.6} />
          <path
            d="M190 300 L190 288 M202 300 L202 282"
            stroke="#3c6aa8"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <path d="M210 300 L214 286" stroke="#c8664a" strokeWidth={4} strokeLinecap="round" />
          {FLECKS.map((fleck) => (
            <circle
              key={`${fleck.x}-${fleck.y}`}
              cx={fleck.x}
              cy={fleck.y}
              r={fleck.r}
              fill={fleck.c}
              opacity={0.9}
            />
          ))}
        </g>
        <g transform="translate(200 81) scale(1.08)" aria-hidden="true">
          <g transform="translate(30 -6) rotate(-62)">
            <rect
              x={-3}
              y={-22}
              width={6}
              height={36}
              rx={1.5}
              fill="#f6d77a"
              stroke="#6b4f12"
              strokeWidth={1}
            />
            <path d="M-3 14 L0 22 L3 14 Z" fill="#e9c7b8" stroke="#6b4f12" strokeWidth={1} />
            <rect x={-3} y={-26} width={6} height={5} rx={1.5} fill="#f2c4c9" />
          </g>
        </g>
      </g>
    </svg>
  );
}
