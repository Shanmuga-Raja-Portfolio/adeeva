export function PassBell({ ringing }: { readonly ringing: boolean }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={ringing ? "ck-bell ck-bell--ringing" : "ck-bell"}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx={60} cy={92} rx={50} ry={7} fill="#0d1215" opacity={0.3} />
      <rect x={12} y={78} width={96} height={12} rx={4} fill="#5f6c73" />
      <g className="ck-bell__dome">
        <path d="M18 78 Q18 30 60 28 Q102 30 102 78 Z" fill="#d9b23c" stroke="#8f6e10" strokeWidth={3} />
        <path
          d="M32 64 Q34 42 54 38"
          stroke="#fff6d8"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
        <rect x={54} y={14} width={12} height={16} rx={3} fill="#8f6e10" />
        <circle cx={60} cy={12} r={8} fill="#aeb9bf" stroke="#5f6c73" strokeWidth={2} />
      </g>
      <g className="ck-bell__waves" stroke="#f2a93b" strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M8 40 q-6 10 0 20" />
        <path d="M112 40 q6 10 0 20" />
      </g>
    </svg>
  );
}
