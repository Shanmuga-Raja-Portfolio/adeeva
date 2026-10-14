import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { DOLL_VIEWBOX } from "../../../../ui/art/avatar/Croquis";

interface BenchAvatarProps {
  readonly look: AvatarLook;
  readonly title: string;
  readonly className?: string | undefined;
}

export function BenchAvatar({ look, title, className }: BenchAvatarProps) {
  return (
    <svg className={className} viewBox={DOLL_VIEWBOX} role="img" aria-label={title}>
      <AvatarFigure look={look} mood="happy" />
      <g aria-hidden="true">
        <path
          d="M168 214 Q200 206 232 214 L246 470 Q200 486 154 470 Z"
          fill="#7a5236"
          stroke="#4a2f1c"
          strokeWidth={2}
          opacity={0.94}
        />
        <path
          d="M172 226 Q200 220 228 226"
          fill="none"
          stroke="#e8a33d"
          strokeOpacity={0.6}
          strokeWidth={2}
          strokeDasharray="3 4"
        />
        <rect
          x={180}
          y={300}
          width={40}
          height={30}
          rx={5}
          fill="#553620"
          stroke="#e8a33d"
          strokeOpacity={0.5}
        />
        <path
          d="M188 300 L188 290 M200 300 L200 286 M212 300 L212 292"
          stroke="#c7ccd4"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(200 81) scale(1.08)" aria-hidden="true">
        <path
          d="M-34 -22 C-26 -46 -10 -52 0 -52 C10 -52 26 -46 34 -22"
          fill="none"
          stroke="#1f4e5a"
          strokeWidth={4.4}
          strokeLinecap="round"
        />
        <circle cx={34} cy={-20} r={4} fill="#b88a2a" />
        <path d="M34 -20 L26 -6" stroke="#b88a2a" strokeWidth={3} strokeLinecap="round" />
        <circle cx={22} cy={0} r={8.5} fill="#d9eef2" fillOpacity={0.55} stroke="#b88a2a" strokeWidth={3} />
        <path d="M18 -4 Q20 -6 23 -6" fill="none" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" />
      </g>
    </svg>
  );
}
