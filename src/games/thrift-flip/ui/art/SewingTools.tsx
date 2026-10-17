export interface ToolPlacement {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export interface SpoolProps extends ToolPlacement {
  readonly thread?: string | undefined;
}

export function Spool({ x, y, scale, thread = "#e57a8f" }: SpoolProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0.6} cy={14} rx={12} ry={3.4} fill="#3b2a1c" opacity={0.22} />
      <rect x={-11} y={-14} width={22} height={4} rx={1.6} fill="#c79a66" />
      <rect x={-11} y={9} width={22} height={4} rx={1.6} fill="#b0844f" />
      <rect x={-8} y={-10} width={16} height={19} fill={thread} />
      {[-7, -3, 1, 5].map((line) => (
        <path
          key={line}
          d={`M-8 ${line} L8 ${line + 2}`}
          stroke="#ffffff"
          strokeOpacity={0.35}
          strokeWidth={1}
        />
      ))}
      <rect x={-8} y={-10} width={4} height={19} fill="#ffffff" opacity={0.22} />
      <path d="M8 2 Q16 6 13 14 Q10 20 18 22" fill="none" stroke={thread} strokeWidth={1.1} />
    </g>
  );
}

export function Pincushion({ x, y, scale }: ToolPlacement) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={1} cy={11} rx={15} ry={4} fill="#3b2a1c" opacity={0.22} />
      <path d="M-14 2 Q-15 -12 0 -13 Q15 -12 14 2 Q13 11 0 11 Q-13 11 -14 2 Z" fill="#e8553a" />
      <path
        d="M0 -13 Q-2 0 0 11 M-12 -6 Q-5 0 -8 10 M12 -6 Q5 0 8 10"
        stroke="#b83a22"
        strokeWidth={1}
        fill="none"
      />
      <path
        d="M-8 -11 Q-2 -14 4 -12"
        stroke="#ffffff"
        strokeOpacity={0.5}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-4 -16 L-6 -13 M0 -15 L4 -24 M6 -9 L12 -18 M-9 -6 L-14 -15"
        stroke="#9aa0aa"
        strokeWidth={0.9}
      />
      <circle cx={4} cy={-24} r={1.8} fill="#f6d36b" />
      <circle cx={12} cy={-18} r={1.8} fill="#8fcfb2" />
      <circle cx={-14} cy={-15} r={1.8} fill="#7b7fd1" />
      <path d="M-4 -18 L-6 -13" stroke="#9aa0aa" strokeWidth={0.9} />
      <circle cx={-4} cy={-18} r={1.8} fill="#ffffff" />
      <path d="M-6 11 Q0 16 6 11 L6 14 Q0 18 -6 14 Z" fill="#4f8a3a" />
    </g>
  );
}

export function SeamRipper({ x, y, scale }: ToolPlacement) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(-28)`}>
      <ellipse cx={4} cy={8} rx={34} ry={4} fill="#3b2a1c" opacity={0.2} />
      <path d="M-30 -4 Q-34 0 -30 4 L-4 5 L-4 -5 Z" fill="#7b7fd1" />
      <path d="M-30 -4 L-4 -5 L-4 -2 L-30 -1 Z" fill="#ffffff" opacity={0.35} />
      <rect x={-5} y={-4} width={6} height={8} rx={1.5} fill="#c9ccd3" />
      <path d="M1 -1.2 L22 -1.2 Q28 -1.2 28 -6 L30 -6 Q30 1.6 22 1.4 L1 1.4 Z" fill="#9aa0aa" />
      <path d="M1 -1.2 L22 -1.2" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={0.8} />
      <circle cx={22.5} cy={-0.2} r={1.6} fill="#e8553a" />
    </g>
  );
}
