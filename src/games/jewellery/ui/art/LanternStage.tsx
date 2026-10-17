import type { ReactNode } from "react";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { PaperLantern } from "./PaperLantern";

interface LanternStageProps {
  readonly dusk: string;
  readonly lights: number;
  readonly lantern: string;
  readonly children?: ReactNode;
}

const ROWS = [
  { y: 70, sag: 34, count: 9 },
  { y: 130, sag: 30, count: 11 },
  { y: 186, sag: 26, count: 13 },
] as const;

export function LanternStage({ dusk, lights, lantern, children }: LanternStageProps) {
  const id = useSvgId("jb-stage");
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dusk} />
          <stop offset="0.7" stopColor="#5a3a5e" />
          <stop offset="1" stopColor="#8a5a6a" />
        </linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8733f" />
          <stop offset="1" stopColor="#5e3a1f" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe6a8" stopOpacity={0.6} />
          <stop offset="1" stopColor="#ffe6a8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1200} height={640} fill={`url(#${id}-sky)`} />
      <g stroke="#2a1c30" strokeWidth={6} fill="none" opacity={0.75}>
        <path d="M0 260 Q600 -120 1200 260" />
        <path d="M0 300 Q600 -40 1200 300" strokeWidth={3} />
        {Array.from({ length: 11 }, (_, index) => {
          const x = 60 + index * 108;
          return <path key={index} d={`M${x} 320 L${600 + (x - 600) * 0.35} 0`} strokeWidth={3} />;
        })}
      </g>
      <g fill="#2a1c30" opacity={0.9}>
        {Array.from({ length: 7 }, (_, index) => {
          const x = index * 180 - 20;
          return (
            <path key={index} d={`M${x} 520 L${x} 330 Q${x + 80} 270 ${x + 160} 330 L${x + 160} 520 Z`} />
          );
        })}
      </g>
      {children}
      {ROWS.map((row, rowIndex) => {
        const lit = Math.min(1, Math.max(0, lights * ROWS.length - rowIndex));
        return (
          <g key={row.y} opacity={0.55 + 0.45 * lit}>
            <path
              d={`M-10 ${row.y - 20} Q600 ${row.y + row.sag * 2 - 20} 1210 ${row.y - 20}`}
              fill="none"
              stroke="#2a1c30"
              strokeWidth={2}
            />
            {Array.from({ length: row.count }, (_, index) => {
              const t = (index + 0.5) / row.count;
              const x = t * 1200;
              const y = row.y + Math.sin(Math.PI * t) * row.sag;
              return (
                <g key={index}>
                  {lit > 0.5 ? <circle cx={x} cy={y} r={30} fill={`url(#${id}-glow)`} /> : null}
                  <PaperLantern x={x} y={y} size={22 - rowIndex * 2} hex={lit > 0.5 ? lantern : null} />
                </g>
              );
            })}
          </g>
        );
      })}
      <rect x={0} y={520} width={1200} height={120} fill="#3a2433" />
      <path d="M200 470 L1000 470 L1040 540 L160 540 Z" fill={`url(#${id}-wood)`} />
      <path d="M200 470 L1000 470" stroke="#e8c27a" strokeWidth={3} opacity={0.6} />
      <path
        d={`M160 540 ${Array.from({ length: 22 }, (_, index) => `Q${180 + index * 40} 566 ${200 + index * 40} 540`).join(" ")}`}
        fill="#7a2f3f"
        stroke="#4b1a28"
        strokeWidth={2}
      />
      {Array.from({ length: 9 }, (_, index) => (
        <path
          key={index}
          d={`M${240 + index * 90} 474 L${220 + index * 95} 538`}
          stroke="#5e3a1f"
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
    </g>
  );
}
