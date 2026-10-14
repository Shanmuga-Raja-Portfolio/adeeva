import { CUISINES } from "../../content/cuisine";

export interface WordmarkProps {
  readonly tagline?: string | undefined;
  readonly compact?: boolean | undefined;
  readonly heading?: boolean | undefined;
}

export function KitchenMark({ className }: { readonly className?: string | undefined }) {
  return (
    <svg className={className} viewBox="-32 -32 64 64" aria-hidden="true" focusable="false">
      <circle r={30} fill="#2e3a40" />
      <circle r={30} fill="none" stroke="#f2a93b" strokeWidth={2.5} />
      <circle r={12} fill="#f2a93b" opacity={0.25} />
      <circle r={7} fill="#ffd88a" />
      {CUISINES.map((cuisine, index) => {
        const angle = (index / CUISINES.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <circle
            key={cuisine.id}
            cx={Math.cos(angle) * 19}
            cy={Math.sin(angle) * 19}
            r={5}
            fill={cuisine.accent}
            stroke="#f3f0e8"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

export function Wordmark({ tagline, compact = false, heading = true }: WordmarkProps) {
  const Title = heading ? "h1" : "span";
  return (
    <div className={compact ? "ck-wordmark ck-wordmark--compact" : "ck-wordmark"}>
      <KitchenMark className="ck-wordmark__mark" />
      <Title className="ck-wordmark__word" aria-label="Six Kitchens">
        <span className="ck-wordmark__six" aria-hidden="true">
          Six
        </span>
        <span className="ck-wordmark__kitchens" aria-hidden="true">
          Kitchens
        </span>
      </Title>
      {tagline !== undefined ? <p className="ck-wordmark__tagline">{tagline}</p> : null}
    </div>
  );
}
