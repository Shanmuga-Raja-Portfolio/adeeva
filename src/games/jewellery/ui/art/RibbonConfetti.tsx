import { seededUnit } from "../../../../ui/art/seedFromText";

interface RibbonConfettiProps {
  readonly className?: string | undefined;
  readonly seed: number;
}

const PIECES = 46;
const COLOURS = ["#e8a33d", "#f6d27a", "#d0587e", "#3fa9a6", "#fff3c8", "#b9a7dc"] as const;

export function RibbonConfetti({ className, seed }: RibbonConfettiProps) {
  return (
    <svg className={className} viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: PIECES }, (_, index) => {
        const x = 12 + seededUnit(seed, index * 4) * 576;
        const y = 8 + seededUnit(seed, index * 4 + 1) ** 1.6 * 300;
        const turn = Math.round(seededUnit(seed, index * 4 + 2) * 360);
        const kind = index % 3;
        const colour = COLOURS[index % COLOURS.length] ?? "#e8a33d";
        const delay = Math.round(seededUnit(seed, index * 4 + 3) * 600);
        return (
          <g key={index} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <g className="jb-confetti" style={{ animationDelay: `${delay}ms` }}>
              <g transform={`rotate(${turn})`}>
                {kind === 0 ? (
                  <rect x={-5} y={-2} width={10} height={4} rx={1} fill={colour} />
                ) : kind === 1 ? (
                  <path
                    d="M-6 0 Q-3 -4 0 0 T6 0"
                    fill="none"
                    stroke={colour}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                  />
                ) : (
                  <path d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z" fill={colour} />
                )}
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
