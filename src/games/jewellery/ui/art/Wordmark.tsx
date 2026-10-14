export interface WordmarkProps {
  readonly tagline?: string | undefined;
  readonly compact?: boolean | undefined;
  readonly heading?: boolean | undefined;
}

export function Wordmark({ tagline, compact = false, heading = true }: WordmarkProps) {
  const Title = heading ? "h1" : "span";
  return (
    <div className={compact ? "jb-wordmark jb-wordmark--compact" : "jb-wordmark"}>
      <svg className="jb-wordmark__mark" viewBox="-30 -30 60 60" aria-hidden="true" focusable="false">
        <circle r={24} fill="none" stroke="#b88a2a" strokeWidth={4} />
        <circle
          r={28}
          fill="none"
          stroke="#e8a33d"
          strokeOpacity={0.6}
          strokeWidth={1}
          strokeDasharray="1.5 3"
        />
        <path
          d="M2 -14 A14 14 0 1 0 12 10 A11 11 0 1 1 2 -14 Z"
          fill="#d9b23c"
          stroke="#664e08"
          strokeWidth={1}
        />
        <circle cx={-5} cy={1} r={3} fill="#b9a7dc" />
        <path
          d="M-10 -12 Q-6 -16 -1 -16"
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.8}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <Title className="jb-wordmark__word" aria-label="Jewellery Bench">
        <span className="jb-wordmark__line" aria-hidden="true">
          Jewellery
        </span>
        <span className="jb-wordmark__line jb-wordmark__line--small" aria-hidden="true">
          Bench
        </span>
      </Title>
      {tagline !== undefined ? <p className="jb-wordmark__tagline">{tagline}</p> : null}
    </div>
  );
}
