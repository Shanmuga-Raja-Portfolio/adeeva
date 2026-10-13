export interface ScissorsCursorProps {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly open: number;
  readonly unit: number;
  readonly tone: "idle" | "on" | "off";
}

const BLADE = "M0 0 C -8 -2.2 -22 -4.2 -30 -3.4 L -30 0.6 C -22 0.8 -8 0.6 0 0 Z";

export function ScissorsCursor({ x, y, angle, open, unit, tone }: ScissorsCursorProps) {
  const spread = 4 + open * 16;
  return (
    <g
      className={`ad-scissors ad-scissors--${tone}`}
      transform={`translate(${x} ${y}) rotate(${angle}) scale(${unit})`}
      pointerEvents="none"
      aria-hidden="true"
    >
      <ellipse cx={-26} cy={6} rx={22} ry={5} fill="#1c1220" opacity={0.16} />
      <g transform={`rotate(${-spread / 2} -26 0)`}>
        <path d={BLADE} fill="url(#ad-scissors-steel)" stroke="#5b5664" strokeWidth={0.8} />
        <path
          d="M -30 -1.4 C -36 -4 -40 -10 -48 -12"
          fill="none"
          stroke="#d0587e"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <ellipse cx={-52} cy={-13} rx={7.5} ry={5.5} fill="none" stroke="#d0587e" strokeWidth={3.4} />
      </g>
      <g transform={`rotate(${spread / 2} -26 0)`}>
        <path
          d={BLADE}
          transform="scale(1 -1)"
          fill="url(#ad-scissors-steel)"
          stroke="#5b5664"
          strokeWidth={0.8}
        />
        <path
          d="M -30 1.4 C -36 4 -40 10 -48 12"
          fill="none"
          stroke="#a93d63"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <ellipse cx={-52} cy={13} rx={7.5} ry={5.5} fill="none" stroke="#a93d63" strokeWidth={3.4} />
      </g>
      <circle cx={-26} cy={0} r={2.2} fill="#f4f2f6" stroke="#5b5664" strokeWidth={0.8} />
      <circle className="ad-scissors__tip" cx={0} cy={0} r={3.2} fill="none" strokeWidth={1.4} />
    </g>
  );
}

export function ScissorsDefs() {
  return (
    <defs>
      <linearGradient id="ad-scissors-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#c9c6d0" />
        <stop offset="1" stopColor="#8d8a94" />
      </linearGradient>
    </defs>
  );
}
