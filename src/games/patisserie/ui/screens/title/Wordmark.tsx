export interface WordmarkProps {
  readonly tagline?: string | undefined;
  readonly compact?: boolean | undefined;
}

export function Wordmark({ tagline, compact = false }: WordmarkProps) {
  return (
    <div className={compact ? "pa-wordmark pa-wordmark--compact" : "pa-wordmark"}>
      <svg className="pa-wordmark__whisk" viewBox="-30 -40 60 80" aria-hidden="true" focusable="false">
        <path
          d="M0 18 C-16 8 -16 -30 0 -36 C16 -30 16 8 0 18 Z"
          fill="none"
          stroke="#c86a24"
          strokeWidth={3}
        />
        <path d="M0 18 C-7 4 -7 -26 0 -36 C7 -26 7 4 0 18" fill="none" stroke="#c86a24" strokeWidth={2.4} />
        <rect x={-4} y={16} width={8} height={22} rx={4} fill="#6b4232" />
      </svg>
      <h1 className="pa-wordmark__word" aria-label="Patisserie Atelier">
        <span className="pa-wordmark__line" aria-hidden="true">
          Patisserie
        </span>
        <span className="pa-wordmark__line pa-wordmark__line--script" aria-hidden="true">
          Atelier
        </span>
      </h1>
      {tagline !== undefined ? <p className="pa-wordmark__tagline">{tagline}</p> : null}
    </div>
  );
}
