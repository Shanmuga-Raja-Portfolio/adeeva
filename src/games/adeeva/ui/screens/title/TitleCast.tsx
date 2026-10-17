import type { AvatarLook } from "../../../../../engine/avatar";
import { AvatarFigure } from "../../../../../ui/art/avatar/Avatar";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { DressFormArt } from "../../art/DressFormArt";

export interface TitleCastProps {
  readonly look: AvatarLook;
  readonly name: string | null;
}

const SPARKLES: readonly (readonly [number, number, number])[] = [
  [96, 150, 1],
  [612, 120, 1.3],
  [660, 380, 0.8],
  [70, 470, 1.1],
  [540, 250, 0.7],
];

const STAR = "M0 -12 C1.4 -3 3 -1.4 12 0 C3 1.4 1.4 3 0 12 C-1.4 3 -3 1.4 -12 0 C-3 -1.4 -1.4 -3 0 -12 Z";

export function TitleCast({ look, name }: TitleCastProps) {
  const id = useSvgId("title-cast");
  return (
    <svg
      className="ad-title-cast"
      viewBox="0 0 720 820"
      role="img"
      aria-label={name === null ? "A designer in her atelier" : `${name} in the atelier`}
    >
      <defs>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3dc" stopOpacity={0.95} />
          <stop offset="0.7" stopColor="#f6d9c4" stopOpacity={0.55} />
          <stop offset="1" stopColor="#f6d9c4" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6dc" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fff6dc" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-rug`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7a6b8" />
          <stop offset="1" stopColor="#b9577a" />
        </linearGradient>
      </defs>
      <polygon points="270,0 390,0 560,800 120,800" fill={`url(#${id}-beam)`} opacity={0.28} />
      <ellipse cx={360} cy={786} rx={330} ry={34} fill={`url(#${id}-pool)`} />
      <ellipse cx={360} cy={790} rx={250} ry={22} fill={`url(#${id}-rug)`} />
      <ellipse
        cx={360}
        cy={786}
        rx={232}
        ry={16}
        fill="none"
        stroke="#fbe3eb"
        strokeWidth={2}
        strokeDasharray="6 6"
      />
      <g className="ad-title-cast__form">
        <DressFormArt x={566} y={348} scale={1.42} drape="#c9a0dc" gown="gown" />
      </g>
      <g className="ad-title-cast__designer" transform="translate(40 14) scale(0.97)">
        <AvatarFigure look={look} mood="delighted" pose="present" />
      </g>
      <g className="ad-title-cast__sparkles" fill="#e2b93b">
        {SPARKLES.map(([x, y, scale], index) => (
          <path
            key={index}
            d={STAR}
            transform={`translate(${x} ${y}) scale(${scale})`}
            style={{ animationDelay: `${index * 0.6}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
