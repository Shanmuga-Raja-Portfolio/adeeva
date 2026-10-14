export interface WordmarkProps {
  readonly tagline?: string | undefined;
  readonly compact?: boolean | undefined;
  readonly heading?: boolean | undefined;
}

export function Wordmark({ tagline, compact = false, heading = true }: WordmarkProps) {
  const Title = heading ? "h1" : "span";
  return (
    <div className={compact ? "is-wordmark is-wordmark--compact" : "is-wordmark"}>
      <svg className="is-wordmark__mark" viewBox="-32 -32 64 64" aria-hidden="true" focusable="false">
        <path
          d="M-24 -2 L0 -24 L24 -2 L24 26 L-24 26 Z"
          fill="#3c6aa8"
          stroke="#2a4f82"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <path d="M-17 2 L17 2 L17 20 L-17 20 Z" fill="#fffaf2" opacity={0.18} />
        <path
          d="M-20 26 L-20 4 M20 26 L20 4"
          stroke="#ffffff"
          strokeOpacity={0.45}
          strokeWidth={1.2}
          strokeDasharray="2 3"
        />
        <rect x={-14} y={-2} width={28} height={12} rx={5} fill="#f6d77a" stroke="#2b2230" strokeWidth={2} />
        <path
          d="M0 10 L0 14 L8 16 L8 26"
          fill="none"
          stroke="#2b2230"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path d="M-14 4 L14 4" stroke="#c8664a" strokeWidth={3} />
        <circle cx={18} cy={-16} r={5} fill="#f6d77a" opacity={0.9} />
      </svg>
      <Title className="is-wordmark__word" aria-label="Interior Studio">
        <span className="is-wordmark__line" aria-hidden="true">
          Interior
        </span>
        <span className="is-wordmark__line is-wordmark__line--small" aria-hidden="true">
          Studio
        </span>
      </Title>
      {tagline !== undefined ? <p className="is-wordmark__tagline">{tagline}</p> : null}
    </div>
  );
}
