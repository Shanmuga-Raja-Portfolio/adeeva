import { darken } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { KeyId } from "../../content/openHouseKey";
import { keyById } from "../../core";

interface KeyArtProps {
  readonly keyId: KeyId | null;
  readonly size?: number | undefined;
  readonly label?: string | undefined;
  readonly className?: string | undefined;
}

const INK = "#3b2a33";

export function KeyArt({ keyId, size = 72, label, className }: KeyArtProps) {
  const id = useSvgId("is-key");
  if (keyId === null)
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 80 80"
        role="img"
        aria-label={label ?? "An empty hook"}
      >
        <circle cx={40} cy={14} r={6} fill="#c9a227" stroke={INK} strokeWidth={2} />
        <path d="M40 20 Q40 34 30 34" fill="none" stroke="#c9a227" strokeWidth={4} strokeLinecap="round" />
        <path d="M24 50 L56 50" stroke="#d9cbb8" strokeWidth={2} strokeDasharray="4 4" />
      </svg>
    );
  const key = keyById(keyId);
  const star = keyId === "star";
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      role="img"
      aria-label={label ?? key.name}
    >
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={key.shine} />
          <stop offset="0.55" stopColor={key.metal} />
          <stop offset="1" stopColor={darken(key.metal, 0.25)} />
        </linearGradient>
      </defs>
      <circle cx={40} cy={10} r={5} fill="#c9a227" stroke={INK} strokeWidth={1.5} />
      <path d="M40 15 L40 22" stroke="#5b4f60" strokeWidth={2} />
      <g transform="rotate(-18 40 46)">
        <circle cx={40} cy={34} r={13} fill={`url(#${id}-metal)`} stroke={INK} strokeWidth={2.5} />
        <circle cx={40} cy={34} r={5} fill="#fffaf2" stroke={INK} strokeWidth={2} />
        <rect
          x={37}
          y={45}
          width={6}
          height={26}
          rx={2}
          fill={`url(#${id}-metal)`}
          stroke={INK}
          strokeWidth={2}
        />
        <path
          d="M43 58 L50 58 L50 62 L43 62 M43 65 L48 65 L48 69 L43 69"
          fill={`url(#${id}-metal)`}
          stroke={INK}
          strokeWidth={1.8}
        />
        {star ? (
          <path
            d="M40 26 L42 31 L47 31 L43 34 L44.5 39 L40 36 L35.5 39 L37 34 L33 31 L38 31 Z"
            fill="#fff4c2"
            stroke={INK}
            strokeWidth={1}
          />
        ) : null}
      </g>
      <path d="M58 20 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 Z" fill="#fffaf2" opacity={0.85} />
    </svg>
  );
}
