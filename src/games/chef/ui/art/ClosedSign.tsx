export function ClosedSign() {
  return (
    <svg viewBox="0 0 220 150" className="ck-closed-sign" aria-hidden="true" focusable="false">
      <path d="M110 6 L44 54 M110 6 L176 54" stroke="#c9a77a" strokeWidth={3} fill="none" />
      <circle cx={110} cy={7} r={6} fill="#f2c46b" stroke="#8a5a14" strokeWidth={2} />
      <rect
        x={24}
        y={50}
        width={172}
        height={84}
        rx={12}
        fill="#1c1220"
        opacity={0.35}
        transform="translate(4 6)"
      />
      <rect x={24} y={50} width={172} height={84} rx={12} fill="#8a5a2e" />
      <rect x={32} y={58} width={156} height={68} rx={8} fill="#a8743f" />
      {[72, 88, 104].map((y) => (
        <path key={y} d={`M36 ${y} H184`} stroke="#8a5a2e" strokeWidth={2} opacity={0.4} />
      ))}
      <text x={110} y={102} textAnchor="middle" fontSize={34} fill="#fff6dc" className="ck-scene-label">
        Closed
      </text>
      <path d="M58 114 H162" stroke="#ffd387" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      <path d="M190 20 a14 14 0 1 0 12 22 a11 11 0 1 1 -12 -22 Z" fill="#ffe2a8" />
      <circle cx={30} cy={22} r={2.5} fill="#ffe2a8" className="ck-twinkle" />
      <circle cx={54} cy={12} r={2} fill="#ffe2a8" className="ck-twinkle" />
      <circle cx={168} cy={10} r={2} fill="#ffe2a8" className="ck-twinkle" />
    </svg>
  );
}
