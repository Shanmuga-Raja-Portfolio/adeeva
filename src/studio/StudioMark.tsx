export function StudioMark() {
  return (
    <a className="st-mark" href="#/" aria-label="Maker Studio home">
      <svg className="st-mark__emblem" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx={24} cy={24} r={22} fill="var(--st-accent)" />
        <circle
          cx={24}
          cy={24}
          r={17}
          fill="none"
          stroke="#fffaf5"
          strokeOpacity={0.5}
          strokeDasharray="3 3"
        />
        <path d="M15 32 L24 13 L33 32" fill="none" stroke="#fffaf5" strokeWidth={3} strokeLinecap="round" />
        <path d="M18.5 25 L29.5 25" stroke="#fffaf5" strokeWidth={3} strokeLinecap="round" />
        <path d="M34 10 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 l3 -1.2 Z" fill="#f6ecc8" />
      </svg>
      <span className="st-mark__words">
        <span className="st-mark__name">Maker Studio</span>
        <span className="st-mark__tag">Make things. Grow a studio.</span>
      </span>
    </a>
  );
}
