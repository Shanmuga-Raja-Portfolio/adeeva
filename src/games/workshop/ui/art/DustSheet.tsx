const OUTLINE = "#2f2622";

export function DustSheet() {
  return (
    <g className="ww-dust-sheet">
      <path
        d="M70 270 C60 200 70 120 120 70 Q200 30 280 70 C330 120 340 200 330 270 Q300 262 270 272 Q240 262 200 274 Q160 262 130 272 Q100 262 70 270 Z"
        fill="#f3ead8"
        stroke={OUTLINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <g fill="none" stroke="#d6c7a8" strokeWidth={3} strokeLinecap="round">
        <path d="M130 100 Q150 180 130 266" />
        <path d="M200 64 Q214 170 200 270" />
        <path d="M270 100 Q250 180 268 266" />
      </g>
      <path d="M180 60 q20 -14 40 0" fill="none" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}
