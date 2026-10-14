import type { ReactNode } from "react";
import type { DecorId } from "../../content/decor";

interface StallFrontProps {
  readonly decor: readonly DecorId[];
  readonly cloth: string;
  readonly sign: string;
  readonly strolling: boolean;
  readonly children?: ReactNode;
}

const SHOPPERS = [
  { x: 60, height: 150, hue: "#3b2740", delay: 0 },
  { x: 700, height: 136, hue: "#2a1d2c", delay: 1.4 },
  { x: 170, height: 124, hue: "#4b2a4f", delay: 2.6 },
] as const;

export function StallFront({ decor, cloth, sign, strolling, children }: StallFrontProps) {
  return (
    <svg viewBox="0 0 800 420" className="jb-stall-front" role="img" aria-label="Your Market Day stall">
      <rect width={800} height={420} fill="#3b2740" />
      <rect y={330} width={800} height={90} fill="#553620" />
      {decor.includes("velvet-awning") ? (
        <g>
          <path d="M120 40 L680 40 L700 96 L100 96 Z" fill={cloth} />
          <path
            d="M100 96 Q128 116 156 96 Q184 116 212 96 Q240 116 268 96 Q296 116 324 96 Q352 116 380 96 Q408 116 436 96 Q464 116 492 96 Q520 116 548 96 Q576 116 604 96 Q632 116 660 96 Q688 116 700 96"
            fill={cloth}
            stroke="#e8a33d"
            strokeWidth={3}
          />
        </g>
      ) : (
        <path d="M120 60 L680 60" stroke="#7a5236" strokeWidth={10} />
      )}
      <rect x={130} y={96} width={14} height={240} fill="#7a5236" />
      <rect x={656} y={96} width={14} height={240} fill="#7a5236" />
      {decor.includes("lantern-string") ? (
        <g>
          <path d="M140 110 Q400 160 660 110" fill="none" stroke="#2a1c30" strokeWidth={2} />
          {[0.15, 0.32, 0.5, 0.68, 0.85].map((t) => {
            const x = 140 + t * 520;
            const y = 110 + Math.sin(Math.PI * t) * 46;
            return (
              <g key={t} transform={`translate(${x} ${y})`} className="jb-sway">
                <circle r={20} fill="#ffd27a" opacity={0.25} />
                <path
                  d="M-8 0 Q0 -4 8 0 L9 16 Q0 22 -9 16 Z"
                  fill="#f2b35a"
                  stroke="#5a2f17"
                  strokeWidth={1.2}
                />
              </g>
            );
          })}
        </g>
      ) : null}
      <rect x={150} y={250} width={500} height={86} rx={8} fill="#7a5236" stroke="#3e2716" strokeWidth={3} />
      <rect
        x={170}
        y={196}
        width={460}
        height={70}
        rx={14}
        fill={cloth}
        stroke="#e8a33d"
        strokeOpacity={0.6}
        strokeWidth={2}
        strokeDasharray="4 5"
      />
      {decor.includes("mirror-easel") ? (
        <g transform="translate(600 150)">
          <path d="M-14 50 L0 0 L14 50" stroke="#7a5236" strokeWidth={4} fill="none" />
          <ellipse cx={0} cy={10} rx={22} ry={28} fill="#d9eef2" stroke="#b88a2a" strokeWidth={5} />
          <path d="M-10 0 Q-4 -10 6 -12" stroke="#ffffff" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      <g transform="translate(400 300)">
        <rect
          x={-150}
          y={-14}
          width={300}
          height={28}
          rx={6}
          fill="#fff8ea"
          stroke="#b8741c"
          strokeWidth={2}
        />
        <text
          textAnchor="middle"
          y={6}
          fontSize={16}
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fill="#4b2a4f"
        >
          {sign}
        </text>
      </g>
      {SHOPPERS.map((shopper) => (
        <g
          key={shopper.x}
          className={strolling ? "jb-shopper" : undefined}
          style={{ animationDelay: `${shopper.delay}s` }}
        >
          <g transform={`translate(${shopper.x} ${330 - shopper.height})`} fill={shopper.hue} opacity={0.85}>
            <circle cx={0} cy={14} r={14} />
            <path d={`M-20 ${shopper.height} L-16 34 Q0 26 16 34 L20 ${shopper.height} Z`} />
          </g>
        </g>
      ))}
      {children}
    </svg>
  );
}
