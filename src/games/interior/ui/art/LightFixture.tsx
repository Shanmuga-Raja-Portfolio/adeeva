import type { LightId } from "../../content/light";

interface LightFixtureProps {
  readonly lightId: LightId;
  readonly x: number;
  readonly y: number;
  readonly unit: number;
  readonly drop?: number | undefined;
}

const INK = "#3b2a33";

export function LightFixture({ lightId, x, y, unit, drop = 0 }: LightFixtureProps) {
  const u = unit;
  const line = Math.max(1, u * 0.035);
  switch (lightId) {
    case "paper-pendant":
    case "dome-pendant": {
      const paper = lightId === "paper-pendant";
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d={`M0 ${-drop} L0 0`} stroke={INK} strokeWidth={line * 0.7} />
          <circle cx={0} cy={u * 0.22} r={u * 0.42} fill={paper ? "#fff3c4" : "#d6f0ff"} opacity={0.5} />
          {paper ? (
            <g>
              <circle cx={0} cy={u * 0.2} r={u * 0.22} fill="#fffaf0" stroke={INK} strokeWidth={line} />
              <path
                d={`M${-u * 0.21} ${u * 0.14} Q0 ${u * 0.22} ${u * 0.21} ${u * 0.14} M${-u * 0.2} ${u * 0.27} Q0 ${u * 0.35} ${u * 0.2} ${u * 0.27}`}
                fill="none"
                stroke="#e2d1bb"
                strokeWidth={line * 0.6}
              />
            </g>
          ) : (
            <g>
              <path
                d={`M${-u * 0.24} ${u * 0.3} Q${-u * 0.24} 0 0 0 Q${u * 0.24} 0 ${u * 0.24} ${u * 0.3} Z`}
                fill="#bfe3f6"
                stroke={INK}
                strokeWidth={line}
              />
              <circle cx={0} cy={u * 0.3} r={u * 0.07} fill="#ffffff" />
            </g>
          )}
        </g>
      );
    }
    case "arc-lamp":
      return (
        <g transform={`translate(${x} ${y})`}>
          <ellipse cx={0} cy={0} rx={u * 0.2} ry={u * 0.06} fill="#c9a227" stroke={INK} strokeWidth={line} />
          <path
            d={`M0 0 L0 ${-u * 1.3} Q0 ${-u * 1.75} ${u * 0.45} ${-u * 1.7}`}
            fill="none"
            stroke="#9a7a14"
            strokeWidth={line * 1.6}
            strokeLinecap="round"
          />
          <circle cx={u * 0.48} cy={-u * 1.45} r={u * 0.4} fill="#fff1b8" opacity={0.45} />
          <path
            d={`M${u * 0.26} ${-u * 1.52} Q${u * 0.48} ${-u * 1.82} ${u * 0.7} ${-u * 1.52} Z`}
            fill="#c9a227"
            stroke={INK}
            strokeWidth={line}
          />
        </g>
      );
    case "clip-lamp":
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect
            x={-u * 0.12}
            y={-u * 0.06}
            width={u * 0.24}
            height={u * 0.06}
            rx={u * 0.02}
            fill="#2a8c91"
            stroke={INK}
            strokeWidth={line * 0.8}
          />
          <path
            d={`M0 ${-u * 0.06} L${-u * 0.12} ${-u * 0.4} L${u * 0.06} ${-u * 0.58}`}
            fill="none"
            stroke="#2a8c91"
            strokeWidth={line * 1.4}
            strokeLinecap="round"
          />
          <circle cx={u * 0.18} cy={-u * 0.46} r={u * 0.26} fill="#e6f7ff" opacity={0.5} />
          <path
            d={`M${u * 0.02} ${-u * 0.64} L${u * 0.26} ${-u * 0.56} L${u * 0.16} ${-u * 0.4} Z`}
            fill="#2a8c91"
            stroke={INK}
            strokeWidth={line}
          />
        </g>
      );
    case "brass-sconce":
      return (
        <g transform={`translate(${x} ${y})`}>
          <circle cx={0} cy={-u * 0.1} r={u * 0.38} fill="#fff1b8" opacity={0.45} />
          <rect
            x={-u * 0.05}
            y={-u * 0.04}
            width={u * 0.1}
            height={u * 0.2}
            rx={u * 0.03}
            fill="#c9a227"
            stroke={INK}
            strokeWidth={line * 0.8}
          />
          <path
            d={`M${-u * 0.16} ${-u * 0.02} L${u * 0.16} ${-u * 0.02} L${u * 0.1} ${-u * 0.26} L${-u * 0.1} ${-u * 0.26} Z`}
            fill="#f2c86a"
            stroke={INK}
            strokeWidth={line}
          />
        </g>
      );
    case "firefly-string":
      return (
        <g transform={`translate(${x} ${y})`}>
          <path
            d={`M${-u * 0.6} 0 Q0 ${u * 0.28} ${u * 0.6} 0`}
            fill="none"
            stroke="#5b4f60"
            strokeWidth={line * 0.6}
          />
          {[-0.45, -0.22, 0, 0.22, 0.45].map((share) => (
            <g key={share}>
              <circle
                cx={share * u}
                cy={u * 0.12 * (1 - Math.abs(share) * 1.6) + u * 0.04}
                r={u * 0.1}
                fill="#ffe27a"
                opacity={0.35}
              />
              <circle
                cx={share * u}
                cy={u * 0.12 * (1 - Math.abs(share) * 1.6) + u * 0.04}
                r={u * 0.045}
                fill="#ffd34d"
              />
            </g>
          ))}
        </g>
      );
  }
}
