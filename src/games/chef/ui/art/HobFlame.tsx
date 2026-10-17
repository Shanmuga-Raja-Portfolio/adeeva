const TONGUES = [-44, -22, 0, 22, 44] as const;

export function HobFlame({ level, max }: { readonly level: number; readonly max: number }) {
  const lift = 0.45 + (level / max) * 0.75;
  return (
    <svg viewBox="-70 -70 140 90" className="ck-hob-flame" aria-hidden="true" focusable="false">
      <ellipse cx={0} cy={6} rx={66} ry={14} fill="#11161a" />
      <ellipse cx={0} cy={2} rx={58} ry={10} fill="#3a4448" stroke="#5f6c73" strokeWidth={2} />
      <ellipse cx={0} cy={-2} rx={46} ry={18} fill="#ff8a2a" opacity={0.12 + level * 0.06} />
      {TONGUES.map((x, index) => {
        const height = (index % 2 === 0 ? 34 : 26) * lift;
        return (
          <g key={x} transform={`translate(${x} 0)`}>
            <path
              d={`M-8 0 C-8 ${-height * 0.4} 0 ${-height * 0.7} 0 ${-height} C2 ${-height * 0.6} 8 ${-height * 0.4} 8 0 Z`}
              fill="#3f8fe0"
              opacity={0.85}
            />
            <path
              d={`M-5 0 C-5 ${-height * 0.3} 0 ${-height * 0.5} 0 ${-height * 0.72} C1 ${-height * 0.45} 5 ${-height * 0.3} 5 0 Z`}
              fill="#bfe3ff"
            />
          </g>
        );
      })}
    </svg>
  );
}
