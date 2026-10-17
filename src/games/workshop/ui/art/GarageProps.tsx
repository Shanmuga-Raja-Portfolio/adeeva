const OUTLINE = "#2f2622";
const SOFT = "#5a4636";

export function WallShelf() {
  return (
    <g stroke={SOFT} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M534 92 l10 18 M720 92 l-10 18" fill="none" />
      <rect x={520} y={84} width={214} height={12} rx={3} fill="#a4764b" />
      <rect x={532} y={44} width={30} height={40} rx={6} fill="#cfe3ea" fillOpacity={0.8} />
      <rect x={532} y={56} width={30} height={28} rx={4} fill="#c9a676" />
      <rect x={530} y={38} width={34} height={9} rx={3} fill="#c0574a" />
      <rect x={572} y={52} width={26} height={32} rx={5} fill="#f2c230" />
      <rect x={572} y={60} width={26} height={9} fill="#fffaf0" strokeWidth={1.5} />
      <rect x={608} y={36} width={36} height={48} rx={4} fill="#4a6378" />
      <rect x={608} y={48} width={36} height={14} fill="#fffaf0" strokeWidth={1.5} />
      <path d="M656 84 V56 M664 84 V48 M672 84 V58" stroke="#8a6a4f" strokeWidth={5} strokeLinecap="round" />
      <path d="M652 54 h8 M660 46 h8 M668 56 h8" stroke="#f0d9ad" strokeWidth={6} strokeLinecap="round" />
      <circle cx={706} cy={68} r={15} fill="#9cb59a" />
      <path d="M700 64 Q706 58 712 64" stroke="#ffffff" strokeOpacity={0.6} fill="none" />
    </g>
  );
}

export function WallClock({ hour }: { readonly hour: number }) {
  const angle = (hour % 12) * 30;
  return (
    <g transform="translate(468 150)">
      <circle r={34} fill="#fffaf0" stroke={OUTLINE} strokeWidth={4} />
      <circle r={28} fill="none" stroke="#e0c69e" strokeWidth={2} />
      {Array.from({ length: 12 }, (_, tick) => (
        <path
          key={tick}
          d="M0 -27 V-22"
          stroke={OUTLINE}
          strokeWidth={tick % 3 === 0 ? 3 : 1.5}
          transform={`rotate(${tick * 30})`}
        />
      ))}
      <path
        d="M0 0 V-16"
        stroke={OUTLINE}
        strokeWidth={4}
        strokeLinecap="round"
        transform={`rotate(${angle})`}
      />
      <path d="M0 0 V-22" stroke="#c0392b" strokeWidth={2.5} strokeLinecap="round" />
      <circle r={3.5} fill={OUTLINE} />
    </g>
  );
}

export function LeaningBoards() {
  return (
    <g stroke={SOFT} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M1150 250 L1176 248 L1196 640 L1170 642 Z" fill="#d9a061" />
      <path d="M1126 270 L1150 266 L1176 640 L1150 644 Z" fill="#e8b777" />
      <path d="M1104 300 L1124 296 L1150 642 L1128 646 Z" fill="#c97a52" />
      <g stroke="#a87545" strokeWidth={1.5} opacity={0.6} fill="none">
        <path d="M1160 290 Q1170 420 1178 600" />
        <path d="M1136 320 Q1146 460 1160 620" />
        <path d="M1114 350 Q1126 480 1138 630" />
      </g>
    </g>
  );
}

export function Shavings() {
  return (
    <g>
      <ellipse cx={980} cy={672} rx={90} ry={14} fill="#f0d9ad" opacity={0.85} />
      <g fill="none" stroke="#d9a061" strokeWidth={4} strokeLinecap="round">
        <path d="M930 664 q10 -12 18 0 q-8 10 -14 2" />
        <path d="M972 668 q12 -14 22 -2 q-10 12 -18 2" />
        <path d="M1012 662 q8 -10 16 0" />
        <path d="M800 640 q8 -10 16 0 q-6 8 -12 2" />
      </g>
      <g transform="translate(1048 470) rotate(14)" stroke={SOFT} strokeWidth={2.5} strokeLinejoin="round">
        <rect x={-5} y={0} width={10} height={170} rx={4} fill="#c58a4a" />
        <path d="M-26 170 h52 l8 34 h-68 Z" fill="#e7cf9e" />
        <path d="M-24 186 h48 M-28 196 h56" stroke="#b39566" strokeWidth={2} />
      </g>
    </g>
  );
}

export function SleepyCat() {
  return (
    <g transform="translate(190 660)" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round">
      <ellipse cx={0} cy={6} rx={78} ry={14} fill="#b7473a" opacity={0.85} />
      <ellipse
        cx={0}
        cy={4}
        rx={66}
        ry={9}
        fill="none"
        stroke="#f2c230"
        strokeWidth={2}
        strokeDasharray="6 5"
      />
      <path d="M-46 0 Q-50 -34 -6 -36 Q36 -38 44 -8 Q46 4 30 4 H-40 Q-48 4 -46 0 Z" fill="#e8a25a" />
      <path d="M-20 -34 Q-12 -20 -18 -4 M4 -36 Q12 -22 6 -4" stroke="#c97a33" strokeWidth={3} fill="none" />
      <circle cx={38} cy={-14} r={18} fill="#e8a25a" />
      <path d="M26 -28 L28 -42 L38 -31 Z M42 -31 L52 -42 L52 -26 Z" fill="#e8a25a" />
      <path d="M30 -14 q4 3 8 0 M42 -14 q4 3 8 0" fill="none" strokeWidth={2} />
      <path d="M-46 -4 Q-74 -6 -66 -24" fill="none" stroke="#e8a25a" strokeWidth={9} strokeLinecap="round" />
      <path d="M-46 -4 Q-74 -6 -66 -24" fill="none" strokeWidth={2} />
      <text
        x={58}
        y={-48}
        fontSize={18}
        fontWeight={700}
        fill="#4a6378"
        stroke="none"
        fontFamily="Georgia, serif"
      >
        z
      </text>
      <text
        x={70}
        y={-64}
        fontSize={13}
        fontWeight={700}
        fill="#4a6378"
        stroke="none"
        fontFamily="Georgia, serif"
      >
        z
      </text>
    </g>
  );
}

export function StreetDog() {
  return (
    <g>
      <g transform="translate(286 600)" stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round">
        <path
          d="M-22 -8 Q-24 -30 0 -30 Q18 -30 20 -16 L30 -24 Q38 -22 34 -12 L22 -6 Q20 4 10 4 H-16 Q-24 4 -22 -8 Z"
          fill="#f6efe2"
        />
        <path d="M-12 2 v10 M12 2 v10 M-4 2 v10 M4 2 v10" strokeWidth={3} strokeLinecap="round" />
        <path d="M-22 -14 Q-36 -24 -32 -36" fill="none" strokeWidth={3} strokeLinecap="round" />
        <path
          d="M-40 -32 q-4 4 0 8 M-44 -38 q-6 6 0 12"
          fill="none"
          stroke="#fffaf0"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={28} cy={-18} r={2} fill={OUTLINE} />
        <path d="M24 -26 Q28 -36 34 -28" fill="#c9a676" />
        <path d="M-60 -70 Q-30 -40 -16 -24" fill="none" stroke="#c0392b" strokeWidth={2} />
      </g>
    </g>
  );
}
