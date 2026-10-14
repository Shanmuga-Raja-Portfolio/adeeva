export interface WordmarkProps {
  readonly tagline?: string | undefined;
  readonly compact?: boolean | undefined;
}

export function Wordmark({ tagline, compact = false }: WordmarkProps) {
  return (
    <div className={compact ? "tf-wordmark tf-wordmark--compact" : "tf-wordmark"}>
      <h1 className="tf-wordmark__word" aria-label="Thrift-Flip Studio">
        <span className="tf-wordmark__thrift" aria-hidden="true">
          Thrift
        </span>
        <span className="tf-wordmark__dash" aria-hidden="true">
          -
        </span>
        <span className="tf-wordmark__flip" aria-hidden="true">
          Flip
        </span>
        <span className="tf-wordmark__studio" aria-hidden="true">
          Studio
        </span>
      </h1>
      <svg className="tf-wordmark__tag" viewBox="0 0 90 60" aria-hidden="true" focusable="false">
        <path
          d="M6 14 C 18 2, 30 30, 44 18"
          fill="none"
          stroke="#a07a52"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d="M40 10 L80 10 Q86 10 86 16 L86 44 Q86 50 80 50 L40 50 L28 30 Z"
          fill="#e8d9bd"
          stroke="#a07a52"
          strokeWidth={2}
        />
        <circle cx={40} cy={30} r={4} fill="#fff8ec" stroke="#a07a52" strokeWidth={1.5} />
        <path
          d="M56 22 L74 22 M56 30 L70 30 M56 38 L66 38"
          stroke="#f08a3c"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
      {tagline !== undefined ? <p className="tf-wordmark__tagline">{tagline}</p> : null}
    </div>
  );
}
