import type { ReactNode } from "react";

interface MusicBoxPlinthProps {
  readonly x: number;
  readonly y: number;
  readonly lid: number;
  readonly wind: number;
  readonly rise: number;
  readonly notes: boolean;
  readonly children?: ReactNode;
}

const NOTE_SPOTS = [
  [-60, -40],
  [50, -70],
  [-20, -110],
  [70, -130],
] as const;

export function MusicBoxPlinth({ x, y, lid, wind, rise, notes, children }: MusicBoxPlinthProps) {
  const open = Math.min(1, Math.max(0, lid));
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={96} ry={12} fill="#000000" opacity={0.3} />
      <g transform={`translate(0 ${-70 - rise * 90})`} opacity={open > 0.2 ? 1 : 0}>
        <rect x={-6} y={0} width={12} height={rise * 90 + 10} fill="#c9a227" />
        <ellipse cx={0} cy={0} rx={40} ry={9} fill="#e8c27a" stroke="#8f6e10" strokeWidth={2} />
        <g transform="translate(0 -6)">{children}</g>
      </g>
      <rect x={-86} y={-70} width={172} height={70} rx={8} fill="#7a2f3f" stroke="#3a1420" strokeWidth={3} />
      <rect
        x={-78}
        y={-62}
        width={156}
        height={54}
        rx={6}
        fill="none"
        stroke="#e8c27a"
        strokeWidth={2}
        opacity={0.8}
      />
      <path
        d="M-60 -36 q10 -14 20 0 t20 0 t20 0 t20 0 t20 0 t20 0"
        fill="none"
        stroke="#e8c27a"
        strokeWidth={2}
      />
      <circle cx={0} cy={-36} r={6} fill="#f6d27a" stroke="#8f6e10" strokeWidth={1.5} />
      <g transform={`translate(-86 -70) rotate(${-110 * open})`}>
        <rect x={0} y={-16} width={172} height={18} rx={6} fill="#8f3a4c" stroke="#3a1420" strokeWidth={3} />
        <rect x={66} y={-12} width={40} height={8} rx={4} fill="#e8c27a" />
      </g>
      <g transform={`translate(96 -36) rotate(${wind * 720})`}>
        <rect x={-3} y={-3} width={14} height={6} fill="#c9a227" />
        <path
          d="M10 -12 C24 -12 24 12 10 12 C14 6 14 -6 10 -12 Z"
          fill="#d9b23c"
          stroke="#8f6e10"
          strokeWidth={1.5}
        />
      </g>
      {notes
        ? NOTE_SPOTS.map(([nx, ny], index) => (
            <text
              key={index}
              x={nx}
              y={ny - 70}
              className="jb-music-note"
              style={{ animationDelay: `${index * 0.35}s` }}
              fill="#fff3c8"
              fontSize={28}
              aria-hidden="true"
            >
              {index % 2 === 0 ? "♪" : "♫"}
            </text>
          ))
        : null}
    </g>
  );
}
