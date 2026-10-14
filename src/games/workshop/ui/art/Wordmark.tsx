export interface WordmarkProps {
  readonly tagline?: string | undefined;
  readonly compact?: boolean | undefined;
}

export function Wordmark({ tagline, compact = false }: WordmarkProps) {
  return (
    <div className={compact ? "ww-wordmark ww-wordmark--compact" : "ww-wordmark"}>
      <svg className="ww-wordmark__mallet" viewBox="-40 -40 80 80" aria-hidden="true" focusable="false">
        <g transform="rotate(-32)">
          <rect x={-5} y={-6} width={10} height={44} rx={4} fill="#c58a4a" stroke="#2f2622" strokeWidth={3} />
          <rect
            x={-22}
            y={-30}
            width={44}
            height={26}
            rx={6}
            fill="#f2c230"
            stroke="#2f2622"
            strokeWidth={3}
          />
          <rect
            x={-22}
            y={-30}
            width={10}
            height={26}
            rx={4}
            fill="#c99a12"
            stroke="#2f2622"
            strokeWidth={3}
          />
        </g>
      </svg>
      <h1 className="ww-wordmark__word" aria-label="Workshop & Wood">
        <span className="ww-wordmark__line" aria-hidden="true">
          Workshop
        </span>
        <span className="ww-wordmark__amp" aria-hidden="true">
          &amp; Wood
        </span>
      </h1>
      {tagline !== undefined ? <p className="ww-wordmark__tagline">{tagline}</p> : null}
    </div>
  );
}
