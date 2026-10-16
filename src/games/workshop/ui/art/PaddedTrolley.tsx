const OUTLINE = "#2f2622";

export function PaddedTrolley() {
  return (
    <g className="ww-trolley">
      <rect x={60} y={270} width={280} height={14} rx={6} fill="#4a6378" stroke={OUTLINE} strokeWidth={3} />
      <rect x={70} y={264} width={260} height={10} rx={5} fill="#9fd0ee" stroke={OUTLINE} strokeWidth={2} />
      <path d="M340 276 l26 -40" stroke={OUTLINE} strokeWidth={5} strokeLinecap="round" />
      {[90, 160, 240, 310].map((x) => (
        <g key={x} className="ww-trolley__wheel">
          <circle cx={x} cy={292} r={9} fill="#3a3a40" stroke={OUTLINE} strokeWidth={2} />
          <circle cx={x} cy={292} r={3} fill="#cfd6dc" />
        </g>
      ))}
    </g>
  );
}
