import type { ReactNode } from "react";
import type { FairMusicId } from "../../content/fairMusic";

export interface MusicIconProps {
  readonly music: FairMusicId;
  readonly size: number;
}

const ICONS: Readonly<Record<FairMusicId, ReactNode>> = {
  "string-trio": (
    <g>
      <path
        d="M14 34 Q6 30 9 22 Q12 17 10 12 Q14 6 20 9 Q26 6 30 12 Q28 17 31 22 Q34 30 26 34 Q20 37 14 34 Z"
        fill="#c98a52"
        stroke="#8e5a2c"
        strokeWidth={1.5}
      />
      <path d="M20 9 V2" stroke="#5a3324" strokeWidth={3} strokeLinecap="round" />
      <path d="M17 26 h6 M18 18 v10 M22 18 v10" stroke="#5a3324" strokeWidth={1.2} />
      <path d="M30 4 L8 38" stroke="#e8d3ad" strokeWidth={2} strokeLinecap="round" />
    </g>
  ),
  "brass-band": (
    <g>
      <path d="M4 18 H24 L36 10 V30 L24 22 H4 Z" fill="#e2b93b" stroke="#a8841a" strokeWidth={1.5} />
      <circle cx={12} cy={14} r={2.4} fill="#f6d77a" stroke="#a8841a" />
      <circle cx={17} cy={14} r={2.4} fill="#f6d77a" stroke="#a8841a" />
      <path d="M8 26 Q14 32 22 26" fill="none" stroke="#a8841a" strokeWidth={2} />
    </g>
  ),
  "music-box": (
    <g>
      <rect x={6} y={14} width={28} height={20} rx={3} fill="#f2c4c9" stroke="#c97a8a" strokeWidth={1.5} />
      <path d="M6 14 L12 6 H28 L34 14" fill="#f7d8e4" stroke="#c97a8a" strokeWidth={1.5} />
      <circle cx={20} cy={24} r={3} fill="#e2b93b" />
      <path d="M34 22 H38 V28" stroke="#8e5a2c" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  ),
  "garden-birdsong": (
    <g>
      <path
        d="M8 26 Q8 14 20 14 Q28 14 30 20 L37 18 L31 24 Q28 32 18 32 Q10 32 8 26 Z"
        fill="#9fc9ea"
        stroke="#4b7aa6"
        strokeWidth={1.5}
      />
      <circle cx={24} cy={19} r={1.6} fill="#3b2620" />
      <path d="M12 24 Q18 20 24 26" fill="none" stroke="#4b7aa6" strokeWidth={1.5} />
      <path d="M30 8 q3 -3 6 0 M34 4 q2 -2 4 0" stroke="#4b7aa6" strokeWidth={1.4} fill="none" />
    </g>
  ),
};

export function MusicIcon({ music, size }: MusicIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {ICONS[music]}
    </svg>
  );
}
