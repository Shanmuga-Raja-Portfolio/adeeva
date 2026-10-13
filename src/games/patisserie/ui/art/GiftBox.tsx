import type { ReactNode } from "react";

export interface GiftBoxProps {
  readonly ribbon: string;
  readonly children: ReactNode;
}

const CONFETTI = ["#f4a259", "#4b5aa6", "#a9c98b", "#e2b93b", "#e88aa3", "#9fd0ee"];
const SCALLOPS = Array.from({ length: 14 }, (_, index) => 64 + index * 20);

export function GiftBox({ ribbon, children }: GiftBoxProps) {
  return (
    <div className="pa-gift">
      <div className="pa-gift__confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            style={{
              background: CONFETTI[index % CONFETTI.length],
              left: `${10 + ((index * 37) % 80)}%`,
              animationDelay: `${0.4 + (index % 6) * 0.08}s`,
              transform: `rotate(${index * 40}deg)`,
            }}
          />
        ))}
      </div>
      <div className="pa-gift__bake">{children}</div>
      <svg viewBox="0 0 400 400" className="pa-gift__box" aria-hidden="true" focusable="false">
        <path d="M54 262 H346 L336 384 Q200 396 64 384 Z" fill="#fff4de" stroke="#e2c08e" strokeWidth={3} />
        <path d="M54 262 H346 L343 300 H57 Z" fill="#fde6cf" />
        {SCALLOPS.map((x) => (
          <path key={x} d={`M${x - 10} 262 q10 12 20 0`} fill="#fffaf0" stroke="#e2c08e" strokeWidth={2} />
        ))}
        <rect x={186} y={262} width={28} height={128} fill={ribbon} />
        <path d="M60 330 H340" stroke={ribbon} strokeWidth={14} opacity={0.85} />
        <g transform="translate(110 352)">
          <path d="M0 -12 A12 12 0 1 0 8 9 A9 9 0 1 1 0 -12 Z" fill="#e2b93b" />
          <path
            d="M10 -12 l1.5 3.2 3.5 0.5 -2.5 2.4 0.6 3.5 -3.1 -1.7 -3.1 1.7 0.6 -3.5 -2.5 -2.4 3.5 -0.5 Z"
            fill="#4b5aa6"
          />
        </g>
      </svg>
      <svg viewBox="0 0 400 200" className="pa-gift__lid" aria-hidden="true" focusable="false">
        <rect x={44} y={120} width={312} height={52} rx={6} fill="#fffaf0" stroke="#e2c08e" strokeWidth={3} />
        <rect x={186} y={120} width={28} height={52} fill={ribbon} />
        <path d="M200 120 C150 60 110 110 196 122 Z M200 120 C250 60 290 110 204 122 Z" fill={ribbon} />
        <circle cx={200} cy={120} r={12} fill={ribbon} />
        <path
          d="M196 128 L176 176 M204 128 L226 176"
          stroke={ribbon}
          strokeWidth={10}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
