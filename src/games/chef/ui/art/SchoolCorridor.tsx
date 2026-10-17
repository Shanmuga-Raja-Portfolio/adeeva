import { useSvgId } from "../../../../ui/art/useSvgId";
import { CUISINES, type CuisineId } from "../../content/cuisine";
import { MentorDoor, type CorridorIds } from "./MentorDoor";

export interface SchoolCorridorProps {
  readonly today?: CuisineId | undefined;
}

const ROW = "translate(600 448) scale(0.92) translate(-600 -448)";

const VANISH: readonly [number, number] = [600, 250];

function plankAt(x: number, y: number): number {
  const share = (600 - y) / (600 - VANISH[1]);
  return x + (VANISH[0] - x) * share;
}

export function SchoolCorridor({ today }: SchoolCorridorProps) {
  const id = useSvgId("ck-corridor");
  const ids: CorridorIds = {
    leafShade: `${id}-leaf`,
    sign: `${id}-sign`,
    spill: `${id}-spill`,
    inside: `${id}-inside`,
    halo: `${id}-halo`,
  };
  const wall = `${id}-wall`;
  const floor = `${id}-floor`;
  const pool = `${id}-pool`;
  const rug = `${id}-rug`;
  return (
    <g>
      <defs>
        <linearGradient id={wall} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf1dc" />
          <stop offset="1" stopColor="#ecd6ae" />
        </linearGradient>
        <linearGradient id={floor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8743f" />
          <stop offset="1" stopColor="#c99a62" />
        </linearGradient>
        <radialGradient id={pool} cx="0.5" cy="0.25" r="0.75">
          <stop offset="0" stopColor="#fff1c4" stopOpacity={0.95} />
          <stop offset="0.45" stopColor="#ffd88a" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffd88a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={rug} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a3524" />
          <stop offset="1" stopColor="#c4502e" />
        </linearGradient>
        <linearGradient id={ids.leafShade} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#1c1220" stopOpacity={0.32} />
        </linearGradient>
        <linearGradient id={ids.sign} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="1" stopColor="#f1e4c8" />
        </linearGradient>
        <linearGradient id={ids.spill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe6a6" stopOpacity={0.85} />
          <stop offset="1" stopColor="#ffe6a6" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={ids.inside} cx="0.5" cy="0.4" r="0.75">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.6" stopColor="#ffd88a" />
          <stop offset="1" stopColor="#e9a94a" />
        </radialGradient>
        <radialGradient id={ids.halo} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe2a0" stopOpacity={0.85} />
          <stop offset="1" stopColor="#ffe2a0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect y={-150} width={1200} height={150} fill="#e4cb9c" />
      {[-150, -110, -70, -30].map((y) => (
        <path key={y} d={`M0 ${y} H1200`} stroke="#c9a77a" strokeWidth={3} opacity={0.6} />
      ))}
      {[180, 600, 1020].map((x) => (
        <g key={x}>
          <path d={`M${x} -150 V-40`} stroke="#6f5034" strokeWidth={3} />
          <ellipse cx={x} cy={-4} rx={90} ry={40} fill={`url(#${ids.halo})`} opacity={0.7} />
          <path d={`M${x - 26} -16 Q${x} -58 ${x + 26} -16 Z`} fill="#c48a2a" />
          <ellipse cx={x} cy={-16} rx={22} ry={6} fill="#fff4cc" />
        </g>
      ))}
      <rect width={1200} height={600} fill={`url(#${wall})`} />
      <rect width={1200} height={56} fill="#d9bf92" />
      <rect y={52} width={1200} height={14} fill="#c9a77a" />
      <rect y={64} width={1200} height={4} fill="#8a6a44" opacity={0.6} />
      {[96, 264, 432, 600, 768, 936, 1104].map((x, index) => (
        <ellipse
          key={x}
          cx={x}
          cy={250}
          rx={84}
          ry={170}
          fill={`url(#${pool})`}
          opacity={index % 2 === 0 ? 0.75 : 0.5}
        />
      ))}
      <path
        d="M-10 84 Q150 112 300 84 T600 84 T900 84 T1210 84"
        fill="none"
        stroke="#6f5034"
        strokeWidth={2}
      />
      {Array.from({ length: 24 }, (_, index) => {
        const x = index * 50 + 12;
        const phase = ((x + 10) % 300) / 300;
        const y = 84 + Math.sin(phase * Math.PI) * 26;
        const flag = CUISINES[index % CUISINES.length];
        return (
          <path
            key={index}
            d={`M${x - 12} ${y} L${x + 12} ${y} L${x} ${y + 24} Z`}
            fill={index % 2 === 0 ? (flag?.accent ?? "#d9472b") : "#fffaf0"}
            opacity={0.92}
          />
        );
      })}
      <rect y={368} width={1200} height={82} fill="#c08a52" />
      <rect y={362} width={1200} height={10} fill="#8a6a44" />
      {Array.from({ length: 12 }, (_, index) => (
        <rect
          key={index}
          x={index * 100 + 12}
          y={384}
          width={76}
          height={50}
          rx={4}
          fill="none"
          stroke="#a3713e"
          strokeWidth={3}
        />
      ))}
      {[264, 432, 600, 768, 936].map((x) => (
        <g key={x} transform={ROW}>
          <path d={`M${x} 236 v-18 h14`} stroke="#8a5a14" strokeWidth={4} fill="none" />
          <path
            d={`M${x - 4} 210 L${x + 30} 210 L${x + 24} 186 L${x + 2} 186 Z`}
            fill="#f6d690"
            stroke="#c48a2a"
            strokeWidth={2}
          />
          <ellipse cx={x + 13} cy={210} rx={16} ry={4} fill="#fff4cc" />
        </g>
      ))}
      <rect y={450} width={1200} height={150} fill={`url(#${floor})`} />
      {Array.from({ length: 17 }, (_, index) => {
        const x = -600 + index * 150;
        return (
          <path
            key={index}
            d={`M${x} 600 L${plankAt(x, 452)} 452`}
            stroke="#8a5a2e"
            strokeWidth={2.5}
            opacity={0.55}
          />
        );
      })}
      {[466, 488, 518, 556].map((y) => (
        <path key={y} d={`M0 ${y} H1200`} stroke="#8a5a2e" strokeWidth={2} opacity={0.35} />
      ))}
      <path d="M90 496 H1110 L1170 572 H30 Z" fill={`url(#${rug})`} opacity={0.92} />
      <path
        d="M104 504 H1096 L1146 564 H54 Z"
        fill="none"
        stroke="#f2c46b"
        strokeWidth={3}
        strokeDasharray="14 8"
        opacity={0.85}
      />
      <rect y={444} width={1200} height={10} fill="#6f5034" />
      <g transform={ROW}>
        {CUISINES.map((cuisine, index) => (
          <MentorDoor
            key={cuisine.id}
            cuisine={cuisine}
            cx={180 + index * 168}
            today={cuisine.id === today}
            ids={ids}
          />
        ))}
      </g>
    </g>
  );
}
