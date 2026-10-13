export interface WordmarkProps {
  tagline?: string | undefined;
  compact?: boolean | undefined;
}

const LETTERS = ["A", "D", "E", "E", "V", "A"] as const;

const threadPath =
  "M14 70 C 70 96, 128 22, 196 52 S 300 104, 352 58 C 380 34, 412 38, 418 58 C 424 78, 398 92, 380 76 C 368 64, 384 46, 404 52 C 440 62, 470 70, 506 50";

export function Wordmark({ tagline, compact = false }: WordmarkProps) {
  return (
    <div className={compact ? "ad-wordmark ad-wordmark--compact" : "ad-wordmark"}>
      <h1 className="ad-wordmark__word" aria-label="ADEEVA">
        {LETTERS.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="ad-wordmark__letter"
            style={{ animationDelay: `${120 + index * 90}ms` }}
            aria-hidden="true"
          >
            {letter}
          </span>
        ))}
      </h1>
      <svg className="ad-wordmark__flourish" viewBox="0 0 520 110" aria-hidden="true" focusable="false">
        <path className="ad-wordmark__thread-shadow" d={threadPath} pathLength={1} />
        <path className="ad-wordmark__thread" d={threadPath} pathLength={1} />
        <g className="ad-wordmark__needle" transform="translate(506 50) rotate(-28)">
          <path d="M0 0 L34 0" stroke="#9a8f9c" strokeWidth={2.4} strokeLinecap="round" />
          <ellipse cx={30} cy={0} rx={3.4} ry={1.4} fill="none" stroke="#9a8f9c" strokeWidth={1.2} />
        </g>
        <g className="ad-wordmark__sparkle" transform="translate(196 30)">
          <path d="M0 -9 C1 -2 2 -1 9 0 C2 1 1 2 0 9 C-1 2 -2 1 -9 0 C-2 -1 -1 -2 0 -9 Z" fill="#c9a227" />
        </g>
      </svg>
      {tagline !== undefined ? <p className="ad-wordmark__tagline">{tagline}</p> : null}
    </div>
  );
}
