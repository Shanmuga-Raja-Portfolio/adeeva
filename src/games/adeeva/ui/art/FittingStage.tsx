import { DOLL_VIEWBOX } from "../../../../ui/art/avatar/Croquis";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface FittingStageProps {
  className?: string | undefined;
}

const SPARKLES: readonly (readonly [number, number, number])[] = [
  [62, 210, 1],
  [338, 170, 1.3],
  [356, 430, 0.8],
  [48, 520, 1.1],
  [318, 40, 0.7],
  [84, 70, 0.9],
  [344, 640, 1],
  [70, 380, 0.7],
];

const STAR = "M0 -12 C1.4 -3 3 -1.4 12 0 C3 1.4 1.4 3 0 12 C-1.4 3 -3 1.4 -12 0 C-3 -1.4 -1.4 -3 0 -12 Z";

const ARCH = "M24 770 L24 160 A176 176 0 0 1 376 160 L376 770 Z";

export function FittingStage({ className }: FittingStageProps) {
  const id = useSvgId("fitting");
  return (
    <svg className={className} viewBox={DOLL_VIEWBOX} aria-hidden="true" focusable="false" overflow="visible">
      <defs>
        <radialGradient id={`${id}-mirror`} cx="0.5" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.55" stopColor="#fbe4e8" />
          <stop offset="1" stopColor="#efc6d1" />
        </radialGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3d98a" />
          <stop offset="0.5" stopColor="#c9a227" />
          <stop offset="1" stopColor="#8f6f12" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4cf" stopOpacity={0.95} />
          <stop offset="1" stopColor="#fff4cf" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-plinth`} cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fff6ef" />
          <stop offset="0.7" stopColor="#efd3c6" />
          <stop offset="1" stopColor="#d6ab9b" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={ARCH} />
        </clipPath>
      </defs>
      <path d={ARCH} fill={`url(#${id}-mirror)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <path d="M150 -20 L250 -20 L380 780 L20 780 Z" fill={`url(#${id}-beam)`} opacity={0.75} />
        <path d="M30 330 Q200 300 370 330" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2} fill="none" />
        <path d="M70 160 L130 100 M80 200 L160 120" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={6} />
      </g>
      <path d={ARCH} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={9} />
      <path
        d="M38 770 L38 162 A162 162 0 0 1 362 162 L362 770"
        fill="none"
        stroke="#fff3d6"
        strokeWidth={1.6}
        opacity={0.8}
      />
      <ellipse cx={200} cy={778} rx={176} ry={22} fill="#7a4a3e" opacity={0.22} />
      <ellipse
        cx={200}
        cy={770}
        rx={160}
        ry={26}
        fill={`url(#${id}-plinth)`}
        stroke="#c9a227"
        strokeWidth={2}
      />
      <g className="ad-fitting-stage__sparkles">
        {SPARKLES.map(([x, y, scale], index) => (
          <path
            key={index}
            d={STAR}
            fill={index % 2 === 0 ? "#e7b93a" : "#ffffff"}
            stroke={index % 2 === 0 ? "#b8860b" : "#e7b93a"}
            strokeWidth={0.8}
            transform={`translate(${x} ${y}) scale(${scale})`}
            style={{ animationDelay: `${index * 0.35}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
