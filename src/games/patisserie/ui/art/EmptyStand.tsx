export interface EmptyStandProps {
  readonly className?: string | undefined;
}

export function EmptyStand({ className }: EmptyStandProps) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true" focusable="false">
      <ellipse cx={60} cy={84} rx={34} ry={4} fill="#3b2620" opacity={0.12} />
      <path d="M50 82 Q60 74 70 82 Z" fill="#e8dfcf" stroke="#cbbca6" strokeWidth={1.4} />
      <path d="M56 78 L58 62 H62 L64 78 Z" fill="#f1ebe0" stroke="#cbbca6" strokeWidth={1.2} />
      <ellipse cx={60} cy={60} rx={44} ry={8} fill="#fbf8f2" stroke="#cbbca6" strokeWidth={1.6} />
      <ellipse cx={60} cy={59} rx={36} ry={5} fill="none" stroke="#f2c4c9" strokeWidth={1.6} />
      <path
        d="M24 58 V36 Q24 8 60 6 Q96 8 96 36 V58"
        fill="#ffffff"
        fillOpacity={0.35}
        stroke="#d9b45a"
        strokeWidth={2}
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
      <circle cx={60} cy={4} r={3.5} fill="#d9b45a" />
      <path d="M36 30 Q38 18 50 14" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" fill="none" />
    </svg>
  );
}
